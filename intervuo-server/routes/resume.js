import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { parseResume } from "../services/pdfParser.js";
import { extractSkills } from "../services/skillExtractor.js";
import pool from "../config/db.js";
const router = Router();
import { requireAuth } from "../middleware/requireAuth.js";
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

router.post("/upload", requireAuth, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const text = await parseResume(req.file.path);
    const { skills, experienceLevel } = extractSkills(text);


   const [result] = await pool.query(
      "INSERT INTO resumes (user_id, resume_text, skills, experience_level) VALUES (?, ?, ?, ?)",
      [req.userId, text, JSON.stringify(skills), experienceLevel]
    );

    res.json({ resumeId: result.insertId, skills, experienceLevel, resumeText: text });
  } catch (err) {
    if (err.message === "NO_TEXT_EXTRACTED") {
      return res.status(422).json({
        message: "Couldn't read this file — try a text-based PDF, not a scanned image.",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong analyzing your resume." });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

export default router;