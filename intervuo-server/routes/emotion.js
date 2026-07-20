import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { analyzeFrame, analyzeVoice } from "../services/emotionService.js";

const router = Router();

router.post("/analyze", requireAuth, async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ message: "No image provided." });
  }

  const result = await analyzeFrame(image);
  res.json(result);
});
router.post("/analyze-voice", requireAuth, async (req, res) => {
  const { audio } = req.body;
  if (!audio) {
    return res.status(400).json({ message: "No audio provided." });
  }
  const result = await analyzeVoice(audio);
  res.json(result);
});
export default router;