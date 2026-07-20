import axios from "axios";

const EMOTION_SERVICE_URL = process.env.EMOTION_SERVICE_URL || "http://localhost:5001";

export async function analyzeFrame(base64Image) {
  try {
    const res = await axios.post(`${EMOTION_SERVICE_URL}/analyze-frame`, {
      image: base64Image,
    });
    return res.data;
  } catch (err) {
    console.error("Emotion service call failed:", err.message);
    return { mood: "Neutral", confidence: 0 };
  }
}

export async function analyzeVoice(base64Audio) {
  try {
    const res = await axios.post(`${EMOTION_SERVICE_URL}/analyze-voice`, {
      audio: base64Audio,
    });
    return res.data;
  } catch (err) {
    console.error("Voice emotion service call failed:", err.message);
    return { mood: "Neutral" };
  }
}