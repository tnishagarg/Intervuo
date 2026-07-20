import { Router } from "express";
import bcrypt from "bcrypt";
import { requireAuth } from "../middleware/requireAuth.js";
import pool from "../config/db.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [req.userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(users[0]);
  } catch (err) {
    console.error("Fetch profile failed:", err);
    res.status(500).json({ message: "Couldn't load your profile." });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name cannot be empty." });
  }

  try {
    await pool.query("UPDATE users SET name = ? WHERE id = ?", [name.trim(), req.userId]);
    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Update profile failed:", err);
    res.status(500).json({ message: "Couldn't update your profile." });
  }
});

router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters." });
  }

  try {
    const [users] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const matches = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!matches) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, req.userId]);
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update failed:", err);
    res.status(500).json({ message: "Couldn't update your password." });
  }
});

router.get("/resumes", requireAuth, async (req, res) => {
  try { 
    const [resumes] = await pool.query(
      "SELECT id, experience_level, skills, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(resumes);
  } catch (err) {
    console.error("Fetch resumes failed:", err);
    res.status(500).json({ message: "Couldn't load your resumes." });
  }
});

export default router;