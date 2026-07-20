import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";

const MOOD_COLORS = {
  Confident: "bg-success-500",
  Nervous: "bg-warning-500",
  Stressed: "bg-danger-500",
  Neutral: "bg-ink-300",
};

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/dashboard/session/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load this session."));
  }, [id]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-danger-500 text-sm">{error}</div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">Loading...</div>;
  }

  const { session, questions, emotionTimeline } = data;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={{ name: user?.name || "User", initials: user?.name?.[0]?.toUpperCase() || "U" }} />
      <main className="flex-1 max-w-7xl mx-auto px-10 py-16 w-full">
        <button onClick={() => navigate("/dashboard")} className="text-sm text-brand-600 mb-4">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-semibold text-ink-900 mb-1 capitalize">
          {session.interview_type} Interview
        </h1>
        <p className="text-base text-ink-500 mb-8">
          {new Date(session.created_at).toLocaleDateString()} • {questions.length} questions • {session.difficulty}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-ink-100 rounded-xl p-7">
            <p className="text-xs text-ink-500 mb-1">Overall Score</p>
            <p className="text-2xl font-semibold text-ink-900">
              {session.overall_score}<span className="text-sm text-ink-500">/100</span>
            </p>
          </div>
          <div className="border border-ink-100 rounded-xl p-7">
            <p className="text-xs text-ink-500 mb-1">Filler Words</p>
            <p className="text-2xl font-semibold text-ink-900">{session.filler_word_count}</p>
          </div>
          <div className="border border-ink-100 rounded-xl p-7">
            <p className="text-xs text-ink-500 mb-1">Dominant Mood</p>
            <p className="text-2xl font-semibold text-success-700">{session.dominant_mood}</p>
          </div>
        </div>
      {(session.strengths || session.improvements) && (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="border border-ink-100 rounded-xl p-7">
      <p className="flex items-center gap-1.5 text-sm font-medium text-success-700 mb-3">
        <CheckCircle2 size={16} />
        Strengths
      </p>
      <ul className="space-y-2">
        {(() => {
          const strengths = session.strengths ? JSON.parse(session.strengths) : [];
          return strengths.length > 0 ? (
            strengths.map((s, i) => (
              <li key={i} className="text-sm text-ink-700 flex gap-2">
                <CheckCircle2 size={14} className="text-success-500 mt-0.5 shrink-0" />
                {s}
              </li>
            ))
          ) : (
            <li className="text-sm text-ink-500">Not enough answered content to identify strengths.</li>
          );
        })()}
      </ul>
    </div>
    <div className="border border-ink-100 rounded-xl p-7">
      <p className="flex items-center gap-1.5 text-sm font-medium text-danger-700 mb-3">
        <AlertCircle size={16} />
        Areas to Improve
      </p>
      <ul className="space-y-2">
        {(session.improvements ? JSON.parse(session.improvements) : []).map((s, i) => (
          <li key={i} className="text-sm text-ink-700 flex gap-2">
            <AlertCircle size={14} className="text-danger-500 mt-0.5 shrink-0" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
        {emotionTimeline?.length > 0 && (
          <div className="border border-ink-100 rounded-xl p-7 mb-6">
            <p className="text-sm font-medium text-ink-900 mb-3">Emotion Timeline</p>
            <div className="flex gap-1 h-7 mb-2">
              {emotionTimeline.map((mood, i) => (
                <div key={i} title={mood} className={`flex-1 rounded ${MOOD_COLORS[mood] || "bg-ink-300"}`} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-ink-500 mb-3">
              <span>Q1</span>
              <span>Q{emotionTimeline.length}</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                <span key={mood} className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  {mood}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-lg font-semibold text-ink-900 mb-4">Question by question</p>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="border border-ink-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-brand-600">{q.type} • Q{i + 1}</p>
                  {q.mood && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      q.mood === "Confident" ? "bg-success-50 text-success-700" :
                      q.mood === "Nervous" ? "bg-warning-50 text-warning-700" :
                      q.mood === "Stressed" ? "bg-danger-50 text-danger-700" :
                      "bg-ink-100 text-ink-700"
                    }`}>
                      {q.mood}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-ink-900 mb-3">{q.question_text}</p>
                <p className="text-xs text-ink-500 mb-1">Your answer:</p>
                <p className="text-sm text-ink-700">{q.transcript || "(no answer given)"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
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