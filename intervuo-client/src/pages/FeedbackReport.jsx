import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle} from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";
import Footer from "../components/Footer";
const MOOD_COLORS = {
  Confident: "bg-success-500",
  Nervous: "bg-warning-500",
  Stressed: "bg-danger-500",
  Neutral: "bg-ink-300",
};

export default function FeedbackReport() {
  const { questions, answers, resumeData, interviewConfig, user } = useAppContext();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!questions.length || !answers.length) {
      setError("No interview data found.");
      setLoading(false);
      return;
    }

    api
      .post("/feedback/generate", {
        questions,
        answers,
        resumeId: resumeData?.resumeId,
        interviewConfig,
      })
      .then((res) => setFeedback(res.data))
      .catch(() =>
        setError("Couldn't generate your feedback report. Please try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-ink-500">Analyzing your interview...</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-danger-500">{error}</p>
      </div>
    );
  }

  const scoreColor =
    feedback.overallScore >= 80
      ? "text-success-600"
      : feedback.overallScore >= 50
        ? "text-warning-600"
        : "text-danger-600";

  const scoreRing =
    feedback.overallScore >= 80
      ? "stroke-success-500"
      : feedback.overallScore >= 50
        ? "stroke-warning-500"
        : "stroke-danger-500";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={{ name: user?.name || "User", initials: user?.name?.[0]?.toUpperCase() || "U" }} />

      <main className="flex-1 max-w-4xl mx-auto px-8 py-14 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink-900 mb-1">
            Interview Report
          </h1>
          <p className="text-sm text-ink-500">
            {questions.length} question{questions.length !== 1 ? "s" : ""} · {interviewConfig?.type || "Interview"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="col-span-1 border border-ink-100 rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-2">
              <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-ink-100" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={scoreRing}
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - feedback.overallScore / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-semibold ${scoreColor}`}>
                  {feedback.overallScore}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-ink-500 tracking-wide uppercase">Overall Score</p>
          </div>

          <div className="border border-ink-100 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-ink-500 mb-2 tracking-wide uppercase">Filler Words</p>
            <p className="text-3xl font-semibold text-ink-900">
              {feedback.fillerWordCount}
            </p>
            <p className="text-xs text-ink-500 mt-1">across all answers</p>
          </div>

          <div className="border border-ink-100 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-ink-500 mb-2 tracking-wide uppercase">Dominant Mood</p>
            <p className="text-3xl font-semibold text-success-700">
              {feedback.dominantMood}
            </p>
            <p className="text-xs text-ink-500 mt-1">most frequent state</p>
          </div>
        </div>

        <div className="border border-ink-100 rounded-2xl p-7 mb-6">
          <p className="text-xs font-semibold text-ink-500 mb-4 tracking-wide uppercase">
            Emotion Timeline
          </p>
          <div className="flex gap-1.5 h-9 mb-2">
            {feedback.emotionTimeline.map((mood, i) => (
              <div
                key={i}
                title={mood}
                className={`flex-1 rounded-md ${MOOD_COLORS[mood] || "bg-ink-300"}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-ink-500 mb-5">
            <span>Q1</span>
            <span>Q{feedback.emotionTimeline.length}</span>
          </div>
          <div className="flex gap-5 flex-wrap pt-4 border-t border-ink-100">
            {Object.entries(MOOD_COLORS).map(([mood, color]) => (
              <span
                key={mood}
                className="flex items-center gap-1.5 text-xs font-medium text-ink-700"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                {mood}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="border border-success-500/30 bg-success-50/40 rounded-2xl p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-success-700 mb-4">
              <CheckCircle2 size={17} />
              Strengths
            </p>
            <ul className="space-y-3">
              {feedback.strengths.length > 0 ? (
                feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-ink-700 flex gap-2.5 leading-relaxed">
                    <CheckCircle2
                      size={15}
                      className="text-success-500 mt-0.5 shrink-0"
                    />
                    {s}
                  </li>
                ))
              ) : (
                <li className="text-sm text-ink-500">
                  Not enough answered content to identify strengths yet.
                </li>
              )}
            </ul>
          </div>
          <div className="border border-danger-500/30 bg-danger-50/40 rounded-2xl p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-danger-700 mb-4">
              <AlertCircle size={17} />
              Areas to Improve
            </p>
            <ul className="space-y-3">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="text-sm text-ink-700 flex gap-2.5 leading-relaxed">
                  <AlertCircle
                    size={15}
                    className="text-danger-500 mt-0.5 shrink-0"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center">
  <button
    onClick={() => navigate("/dashboard")}
    className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-6 py-2.5"
  >
    Back to Dashboard
  </button>
</div>
      </main>
      <Footer />
    </div>
  );

}
