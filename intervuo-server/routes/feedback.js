import { Router } from "express";
import { generateFeedback } from "../services/feedbackGenerator.js";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();

router.post("/generate", requireAuth, async (req, res) => {
  const { questions, answers, resumeId, interviewConfig } = req.body;

  if (!questions?.length || !answers?.length) {
    return res.status(400).json({ message: "Missing questions or answers." });
  }

  const connection = await pool.getConnection();

  try {
    const feedback = await generateFeedback({ questions, answers });

    await connection.beginTransaction();

    const [sessionResult] = await connection.query(
  `INSERT INTO interview_sessions 
   (user_id, resume_id, interview_type, difficulty, target_role, overall_score, filler_word_count, dominant_mood, strengths, improvements) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    req.userId,
    resumeId || null,
    interviewConfig?.type || null,
    interviewConfig?.difficulty || null,
    interviewConfig?.targetRole || null,
    feedback.overallScore,
    feedback.fillerWordCount,
    feedback.dominantMood,
    JSON.stringify(feedback.strengths),
    JSON.stringify(feedback.improvements),
  ]
);
    const sessionId = sessionResult.insertId;

    for (let i = 0; i < questions.length; i++) {
      const [qResult] = await connection.query(
        "INSERT INTO questions (session_id, question_order, type, question_text) VALUES (?, ?, ?, ?)",
        [sessionId, i, questions[i].type, questions[i].text]
      );
      const questionId = qResult.insertId;

      const answer = answers.find((a) => a.questionIndex === i);
      await connection.query(
        "INSERT INTO answers (question_id, transcript, mood) VALUES (?, ?, ?)",
        [questionId, answer?.transcript || "", answer?.mood || null]
      );
    }

    await connection.commit();
    res.json(feedback);
  } catch (err) {
    await connection.rollback();
    console.error("Feedback generation/save failed:", err);
    res.status(500).json({ message: "Couldn't generate feedback. Please try again." });
  } finally {
    connection.release();
  }
});

export default router;