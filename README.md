# Intervuo

Intervuo is an AI-powered mock interview platform. It reads your resume, generates personalized interview questions with Google's Gemini AI, listens to your spoken answers in real time, analyzes your facial expressions and vocal tone to detect confidence and nervousness, and gives you a detailed, honest performance report.

**Live:** (https://intervuo-u07e.onrender.com/)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, recharts, react-speech-recognition |
| Backend | Node.js, Express, MySQL, JWT, bcrypt, Nodemailer |
| Emotion Service | Python, Flask, FER, librosa, OpenCV, TensorFlow (CPU) |
| AI | Google Gemini API |
| Deployment | Render (frontend, backend, emotion service) + Clever Cloud (MySQL) |

## How It Works

**1. Resume Upload** — PDF text is extracted (`pdf-parse`), skills and experience level are pulled via keyword/regex matching, and saved to MySQL.

**2. Interview Setup** — User picks interview type (Behavioral / Technical / HR / Mixed), difficulty (Easy / Medium / Hard), optional target role, and question count (3–12). Mic and camera access are verified before starting.

**3. AI Question Generation** — Resume, type, difficulty, and role are sent to Gemini with strict rules: questions must match the requested type exactly, difficulty follows an explicit rubric, and at least half the questions target the specified role if one was given.

**4. Live Interview Session**
- Speech-to-text transcribes answers continuously.
- **Facial emotion detection**: a webcam frame every 4s is analyzed via FER; readings below 0.45 confidence default to "Neutral," and the last 3 readings are smoothed to avoid flicker.
- **Vocal emotion detection**: a ~6s audio clip is analyzed continuously via `librosa` for pitch variation, energy consistency, and pause ratio. Each factor crossing a threshold adds 1 to a stress score (0–3), mapped to Confident → Neutral → Nervous → Stressed.
- **Combining face + voice**: each mood has a severity (Confident=0 … Stressed=3); whichever signal shows *higher* severity wins, since vocal stress is harder to fake than expression.
- The most frequent mood across all readings during an answer becomes that question's final mood.

**5. AI Feedback & Scoring** — Each answered question is scored 0–100 across 5 criteria (Clarity, Relevance, Structure/STAR, Specificity, Depth — 20 points each). 
```
overallScore = (sum of all question scores) / (total number of questions)
```
Unanswered or off-topic answers score 0 across all criteria — so the denominator always includes every question, not just answered ones, meaning incomplete interviews score proportionally lower. Strengths are only listed when genuinely earned from real content; nothing is invented to pad the list. Filler words are counted locally via regex, not by the AI.

**6. Dashboard** — Streak counts consecutive days with a completed session (missing a day resets it to 0). Score trend charts the last 5 sessions. "Suggested focus" is rule-based: flags high filler-word averages (≥5/session), the weakest-scoring interview type (if under 50 average), or frequent stress/nervousness across recent sessions.

**7. Auth** — bcrypt-hashed passwords, JWT sessions, and a time-limited (1 hour) email-based password reset flow via Nodemailer.

## Architecture

```
intervuo-client/     React frontend
intervuo-server/     Node/Express API + MySQL
emotion-service/      Python/Flask — facial + vocal emotion analysis
```
