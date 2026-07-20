import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import crypto from "crypto";
import { sendResetEmail } from "../services/emailService.js";
const router = Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, user: { id: result.insertId, name, email } });
  } catch (err) {
    console.error("Signup failed:", err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await pool.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [token, expiry, users[0].id],
    );

    await sendResetEmail(email, token);

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password failed:", err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [passwordHash, users[0].id],
    );

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password failed:", err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});
export default router;
