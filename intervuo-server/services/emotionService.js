import axios from "axios";

export async function analyzeFrame(base64Image) {
  try {
    const res = await axios.post("http://localhost:5001/analyze-frame", {
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
    const res = await axios.post("http://localhost:5001/analyze-voice", {
      audio: base64Audio,
    });
    return res.data;
  } catch (err) {
    consyole.error("Voice emotion service call failed:", err.message);
    return { mood: "Neutral" };
  }
}