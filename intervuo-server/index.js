import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import feedbackRoutes from "./routes/feedback.js";
import dashboardRoutes from "./routes/dashboard.js";
import emotionRoutes from "./routes/emotion.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/emotion", emotionRoutes);
app.use("/api/profile", profileRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Intervuo server running on port ${PORT}`));