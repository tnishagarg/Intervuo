import { Router } from "express";
import { generateQuestions } from "../services/questionGenerator.js";

const router = Router();

router.post("/generate-questions", async (req, res) => {
  const { resumeText, type, difficulty, targetRole, questionCount } = req.body;

  if (!resumeText || !type || !difficulty || !questionCount) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const questions = await generateQuestions({ resumeText, type, difficulty, targetRole, questionCount });
    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't generate questions. Please try again." });
  }
});

export default router;