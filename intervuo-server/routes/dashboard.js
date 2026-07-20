import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import pool from "../config/db.js";

const router = Router();
router.get("/session/:id", requireAuth, async (req, res) => {
  try {
    const [sessions] = await pool.query(
      `SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.userId]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ message: "Session not found." });
    }

    const [questions] = await pool.query(
      `SELECT q.id, q.question_order, q.type, q.question_text, a.transcript, a.mood
       FROM questions q
       LEFT JOIN answers a ON a.question_id = q.id
       WHERE q.session_id = ?
       ORDER BY q.question_order`,
      [req.params.id]
    );

    const emotionTimeline = questions.map((q) => q.mood || "Neutral");

    res.json({ session: sessions[0], questions, emotionTimeline });
  } catch (err) {
    console.error("Fetch session failed:", err);
    res.status(500).json({ message: "Couldn't load this session." });
  }
});


router.get("/summary", requireAuth, async (req, res) => {
  try {
    const [sessions] = await pool.query(
      `SELECT s.id, s.interview_type, s.difficulty, s.target_role, s.overall_score, s.filler_word_count, s.dominant_mood, s.created_at,
              COUNT(q.id) AS question_count
       FROM interview_sessions s
       LEFT JOIN questions q ON q.session_id = s.id
       WHERE s.user_id = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.userId]
    );

    const totalSessions = sessions.length;
    const avgScore = totalSessions
      ? Math.round(sessions.reduce((sum, s) => sum + s.overall_score, 0) / totalSessions)
      : 0;

    const dayStrings = [...new Set(sessions.map((s) => new Date(s.created_at).toDateString()))];
    let streak = 0;
    let cursor = new Date();
    while (dayStrings.includes(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Score trend: last 5 sessions, oldest to newest, for a left-to-right chart
    const scoreTrend = [...sessions]
      .slice(0, 5)
      .reverse()
      .map((s) => ({ date: s.created_at, score: s.overall_score }));

    // Suggested focus: look for real patterns across recent sessions
    const suggestions = [];
    const recentForAnalysis = sessions.slice(0, 5);

    if (recentForAnalysis.length > 0) {
      const avgFillerWords =
        recentForAnalysis.reduce((sum, s) => sum + (s.filler_word_count || 0), 0) /
        recentForAnalysis.length;
      if (avgFillerWords >= 5) {
        suggestions.push({
          title: "Reduce filler words",
          detail: `Averaging ${Math.round(avgFillerWords)} per session`,
        });
      }

      const typeScores = {};
      recentForAnalysis.forEach((s) => {
        if (!typeScores[s.interview_type]) typeScores[s.interview_type] = [];
        typeScores[s.interview_type].push(s.overall_score);
      });
      const typeAverages = Object.entries(typeScores).map(([type, scores]) => ({
        type,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }));
      const weakestType = typeAverages.sort((a, b) => a.avg - b.avg)[0];
      if (weakestType && weakestType.avg < 50) {
        suggestions.push({
          title: `Practice more ${weakestType.type} questions`,
          detail: `Scored below average (${Math.round(weakestType.avg)}/100)`,
        });
      }

      const stressfulSessions = recentForAnalysis.filter(
        (s) => s.dominant_mood?.includes("Stressed") || s.dominant_mood?.includes("Nervous")
      ).length;
      if (stressfulSessions >= Math.ceil(recentForAnalysis.length / 2)) {
        suggestions.push({
          title: "Work on pacing under pressure",
          detail: "From recent emotion analysis",
        });
      }
    }

    res.json({
      totalSessions,
      avgScore,
      streak,
      recentSessions: sessions.slice(0, 10),
      scoreTrend,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (err) {
    console.error("Dashboard summary failed:", err);
    res.status(500).json({ message: "Couldn't load your dashboard. Please try again." });
  }
});
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const [sessions] = await pool.query(
      `SELECT s.id, s.interview_type, s.difficulty, s.target_role, s.overall_score, s.filler_word_count, s.dominant_mood, s.created_at,
              COUNT(q.id) AS question_count
       FROM interview_sessions s
       LEFT JOIN questions q ON q.session_id = s.id
       WHERE s.user_id = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.userId]
    );
    res.json({ sessions });
  } catch (err) {
    console.error("Fetch all sessions failed:", err);
    res.status(500).json({ message: "Couldn't load your sessions." });
  }
});
export default router;