from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import os

# Ensure the haarcascade file exists where cv2/fer expects it
_cascade_dir = os.path.dirname(cv2.data.haarcascades) if hasattr(cv2, 'data') else None
_target_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml") if _cascade_dir else None
if _target_path and not os.path.exists(_target_path):
    os.makedirs(os.path.dirname(_target_path), exist_ok=True)
    import shutil
    shutil.copy("/usr/local/share/haarcascades/haarcascade_frontalface_default.xml", _target_path)

from fer.fer import FER
import cv2
import numpy as np
import base64
import io
import base64 as b64
import subprocess
import librosa
import imageio_ffmpeg

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Using ffmpeg at: {FFMPEG_PATH}")

def webm_bytes_to_wav_bytes(webm_bytes):
    process = subprocess.run(
        [FFMPEG_PATH, "-i", "pipe:0", "-f", "wav", "-ar", "22050", "-ac", "1", "pipe:1"],
        input=webm_bytes,
        capture_output=True,
    )
    if process.returncode != 0:
        raise RuntimeError(f"ffmpeg conversion failed: {process.stderr.decode(errors='ignore')}")
    return process.stdout

app = Flask(__name__)
CORS(app)

detector = FER(mtcnn=False)

CONFIDENCE_THRESHOLD = 0.45

mood_map = {
    "happy": "Confident",
    "neutral": "Neutral",
    "surprise": "Confident",
    "sad": "Nervous",
    "fear": "Nervous",
    "angry": "Stressed",
    "disgust": "Stressed",
}

@app.route("/analyze-frame", methods=["POST"])
def analyze_frame():
    try:
        data = request.get_json()
        image_b64 = data.get("image")
        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        results = detector.detect_emotions(frame)

        if not results:
            return jsonify({"mood": "Neutral", "confidence": 0})

        emotions = results[0]["emotions"]
        top_emotion = max(emotions, key=emotions.get)
        confidence = emotions[top_emotion]

        mood = mood_map.get(top_emotion, "Neutral") if confidence >= CONFIDENCE_THRESHOLD else "Neutral"

        print("Raw emotions:", emotions)

        return jsonify({"mood": mood, "confidence": round(confidence, 2), "raw": emotions})
    except Exception as e:
        print("Error analyzing frame:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-voice", methods=["POST"])
def analyze_voice():
    try:
        data = request.get_json()
        audio_b64 = data.get("audio")
        if not audio_b64:
            return jsonify({"error": "No audio provided"}), 400

        audio_bytes = b64.b64decode(audio_b64)

        wav_bytes = webm_bytes_to_wav_bytes(audio_bytes)
        y, sr = librosa.load(io.BytesIO(wav_bytes), sr=None)

        if len(y) < sr * 0.5:
            return jsonify({"mood": "Neutral", "reason": "Audio too short"})

        f0, voiced_flag, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        f0_clean = f0[~np.isnan(f0)]
        pitch_std = float(np.std(f0_clean)) if len(f0_clean) > 0 else 0

        rms = librosa.feature.rms(y=y)[0]
        energy_mean = float(np.mean(rms))
        energy_std = float(np.std(rms))
        energy_cv = energy_std / energy_mean if energy_mean > 0 else 0

        silence_threshold = energy_mean * 0.3
        silent_frames = np.sum(rms < silence_threshold)
        pause_ratio = silent_frames / len(rms)

        stress_score = 0
        if pitch_std < 15:
            stress_score += 1
        if energy_cv > 0.6:
            stress_score += 1
        if pause_ratio > 0.35:
            stress_score += 1

        mood_by_score = {0: "Confident", 1: "Neutral", 2: "Nervous", 3: "Stressed"}
        mood = mood_by_score.get(stress_score, "Neutral")

        print(f"Voice analysis — pitch_std: {pitch_std:.1f}, energy_cv: {energy_cv:.2f}, pause_ratio: {pause_ratio:.2f}, score: {stress_score}, mood: {mood}")

        return jsonify({"mood": mood, "stress_score": stress_score})
    except Exception as e:
        print("Error analyzing voice:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)