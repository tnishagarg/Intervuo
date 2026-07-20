import { useEffect, useRef, useState } from "react";
import { Camera, Pause, Check, Play } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Header from "../components/Header";
import api from "../api/axios";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const MOOD_BADGE_STYLES = {
  Confident: "bg-success-50 text-success-700",
  Nervous: "bg-warning-50 text-warning-700",
  Stressed: "bg-danger-50 text-danger-700",
  Neutral: "bg-ink-100 text-ink-700",
};

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MOOD_SEVERITY = { Confident: 0, Neutral: 1, Nervous: 2, Stressed: 3 };

const combineFaceAndVoiceMood = (faceMood, voiceMood) => {
  const faceSeverity = MOOD_SEVERITY[faceMood] ?? 1;
  const voiceSeverity = MOOD_SEVERITY[voiceMood] ?? 1;
  return faceSeverity >= voiceSeverity ? faceMood : voiceMood;
};

const getDominantMood = (history) => {
  if (history.length === 0) return "Neutral";
  const counts = history.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

export default function InterviewSession() {
  const navigate = useNavigate();
  const {
    questions, currentQuestionIndex, setCurrentQuestionIndex,
    answers, setAnswers, user,
  } = useAppContext();

  const currentQuestion = questions[currentQuestionIndex];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [mood, setMood] = useState("Neutral");
  const [moodHistory, setMoodHistory] = useState([]);
  const [voiceMood, setVoiceMood] = useState("Neutral");
  const [voiceMoodHistory, setVoiceMoodHistory] = useState([]);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const micStreamRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const devicesReady = cameraOn && micOn;
  const prevQuestionIndexRef = useRef(currentQuestionIndex);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused) setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [paused]);

  // Auto-retry device connection if lost
  useEffect(() => {
    if (cameraOn && micOn) return;
    const interval = setInterval(() => {
      connectDevices();
    }, 2000);
    return () => clearInterval(interval);
  }, [cameraOn, micOn]);

  // Speech-to-text: restart cleanly per question
  useEffect(() => {
    const questionChanged = prevQuestionIndexRef.current !== currentQuestionIndex;
    prevQuestionIndexRef.current = currentQuestionIndex;

    SpeechRecognition.stopListening();

    if (questionChanged) {
      resetTranscript();
    }

    if (!paused && devicesReady) {
      const timer = setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true });
        if (questionChanged) {
          restartAudioRecording();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, paused, devicesReady]);

  const connectDevices = () => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraOn(true);
        }
        const [videoTrack] = stream.getVideoTracks();
        videoTrack.onended = () => setCameraOn(false);
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraOn(false);
      });

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        setMicOn(true);
        micStreamRef.current = stream;
        const [audioTrack] = stream.getAudioTracks();
        audioTrack.onended = () => setMicOn(false);
        startAudioRecording(stream);
      })
      .catch((err) => {
        console.error("Mic error:", err);
        setMicOn(false);
      });
  };

  const startAudioRecording = (stream) => {
    const audioStream = new MediaStream(stream.getAudioTracks());
    const recorder = new MediaRecorder(audioStream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  const restartAudioRecording = () => {
    if (micStreamRef.current) {
      startAudioRecording(micStreamRef.current);
    }
  };

  const stopAudioRecordingAndAnalyze = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(",")[1];
          try {
            const res = await api.post("/emotion/analyze-voice", { audio: base64Audio });
            if (res.data?.mood) {
              setVoiceMood(res.data.mood);
              setVoiceMoodHistory((prev) => [...prev, res.data.mood]);
            }
          } catch (err) {
            console.error("Voice emotion analysis failed:", err);
          }
          resolve();
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.stop();
    });
  };

  // Connect devices on mount
  useEffect(() => {
    connectDevices();
  }, []);

  // Continuous FACE detection every 4s
  useEffect(() => {
    if (!cameraOn) return;

    const captureAndAnalyze = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = dataUrl.split(",")[1];

      try {
        const res = await api.post("/emotion/analyze", { image: base64 });
        if (res.data?.mood) {
          setMoodHistory((prev) => {
            const updated = [...prev, res.data.mood];
            const recent = updated.slice(-3);
            const counts = recent.reduce((acc, m) => {
              acc[m] = (acc[m] || 0) + 1;
              return acc;
            }, {});
            const smoothedMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
            setMood(smoothedMood);
            return updated;
          });
        }
      } catch (err) {
        console.error("Emotion analysis failed:", err);
      }
    };

    const interval = setInterval(captureAndAnalyze, 4000);
    return () => clearInterval(interval);
  }, [cameraOn]);

  // Continuous VOICE detection every 6s
  useEffect(() => {
    if (!micOn || paused) return;

    const cycleVoiceAnalysis = async () => {
      await stopAudioRecordingAndAnalyze();
      restartAudioRecording();
    };

    const interval = setInterval(cycleVoiceAnalysis, 6000);
    return () => clearInterval(interval);
  }, [micOn, paused]);

  const handleSubmit = async () => {
    const faceMood = getDominantMood(moodHistory);
    const voiceDominant = getDominantMood(voiceMoodHistory);
    const finalMood = combineFaceAndVoiceMood(faceMood, voiceDominant);

    const newAnswers = [
      ...answers,
      { questionIndex: currentQuestionIndex, transcript, mood: finalMood },
    ];
    setAnswers(newAnswers);
    setMoodHistory([]);
    setVoiceMoodHistory([]);
    setVoiceMood("Neutral");

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log("Interview complete. All answers:", newAnswers);
      navigate("/interview-complete");
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-ink-500">
          No questions loaded. Please start from setup.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {paused && devicesReady && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col">
          <Header user={{ name: user?.name || "You", initials: user?.name?.[0]?.toUpperCase() || "U" }} statusBadge="Paused" />
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-lg border border-warning-500/30 bg-warning-50 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Pause size={18} className="text-warning-700" />
                <p className="text-base font-semibold text-ink-900">Interview paused</p>
              </div>
              <p className="text-sm text-ink-500 mb-6">
                Your progress is saved. Take a moment whenever you need.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white border border-ink-100 rounded-xl p-4 text-center">
                  <p className="text-xl font-semibold text-ink-900">{formatTime(elapsedSeconds)}</p>
                  <p className="text-xs text-ink-500 mt-1">Elapsed</p>
                </div>
                <div className="bg-white border border-ink-100 rounded-xl p-4 text-center">
                  <p className="text-xl font-semibold text-ink-900">
                    {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <p className="text-xs text-ink-500 mt-1">Progress</p>
                </div>
                <div className="bg-white border border-ink-100 rounded-xl p-4 text-center">
                  <p className="text-xl font-semibold text-ink-900">{answers.length}</p>
                  <p className="text-xs text-ink-500 mt-1">Answered</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaused(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl py-3"
                >
                  <Play size={14} />
                  Resume interview
                </button>
                <button
                  onClick={() => navigate("/interview-complete")}
                  className="text-sm font-medium text-ink-700 border border-ink-300 rounded-xl px-5 py-3"
                >
                  End session
                </button>
              </div>
              <p className="text-xs text-ink-500 mt-4 text-center">
                Ending early will still generate a partial feedback report for completed answers.
              </p>
            </div>
          </div>
        </div>
      )}
      {!devicesReady && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center px-6 text-center">
          <Camera size={28} className="text-danger-500 mb-3" />
          <p className="text-base font-medium text-ink-900 mb-1">
            {!cameraOn && !micOn
              ? "Camera and microphone access lost"
              : !cameraOn
                ? "Camera access lost"
                : "Microphone access lost"}
          </p>
          <p className="text-sm text-ink-500 mb-4 max-w-sm">
            Your interview is paused. Please re-enable access in your browser's
            permission settings — we'll reconnect automatically once it's restored.
          </p>
          <span className="text-xs text-ink-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
            Checking for access...
          </span>
        </div>
      )}
      <Header user={{ name: user?.name || "User", initials: user?.name?.[0]?.toUpperCase() || "U" }} />
      <main className="flex-1 max-w-5xl mx-auto px-8 py-14 w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {listening && !paused && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-danger-500">
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
                Recording
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="border border-ink-100 rounded-2xl p-10 mb-6">
          <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-4">
            {currentQuestion.type}
          </span>
          <p className="text-2xl font-medium text-ink-900 leading-relaxed">
            "{currentQuestion.text}"
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="col-span-2 bg-ink-100/60 border border-ink-100 rounded-2xl p-7 min-h-60">
            <p className="text-xs font-semibold text-ink-500 mb-3 tracking-wide uppercase">
              Live transcript
            </p>
            {browserSupportsSpeechRecognition ? (
              <p className="text-base text-ink-700 leading-relaxed">
                {transcript || "Start speaking to see your answer transcribed here..."}
              </p>
            ) : (
              <p className="text-sm text-ink-500">
                Speech recognition isn't supported in this browser. Try Chrome or Edge.
              </p>
            )}
          </div>
          <div className="relative bg-ink-100/60 border border-ink-100 rounded-2xl min-h-60 flex flex-col items-center justify-center gap-2 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl ${cameraOn ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraOn && (
              <>
                <Camera size={24} className="text-ink-500" />
                <span className="text-xs text-ink-500">Camera preview</span>
              </>
            )}
            <span className={`absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${MOOD_BADGE_STYLES[mood] || MOOD_BADGE_STYLES.Neutral}`}>
              {mood}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-700 border border-ink-300 rounded-xl px-5 py-3"
          >
            <Pause size={14} />
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!devicesReady}
            className={`flex items-center gap-1.5 text-sm font-semibold rounded-xl px-7 py-3 transition ${
              devicesReady
                ? "text-white bg-brand-500 hover:bg-brand-600 shadow-sm"
                : "text-ink-400 bg-ink-100 cursor-not-allowed"
            }`}
          >
            <Check size={14} />
            Submit answer
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );

}