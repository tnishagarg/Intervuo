import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";

const MOOD_STYLES = {
  Confident: "text-success-700 bg-success-50",
  Nervous: "text-warning-700 bg-warning-50",
  Stressed: "text-danger-700 bg-danger-50",
  Neutral: "text-ink-700 bg-ink-100",
};

const MOOD_TEXT_COLORS = {
  Confident: "text-success-700",
  Nervous: "text-warning-700",
  Stressed: "text-danger-700",
  Neutral: "text-ink-600",
};

function MoodBadge({ mood }) {
  if (mood.includes(" & ")) {
    const parts = mood.split(" & ");
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-ink-100">
        {parts.map((part, i) => (
          <span key={part} className={MOOD_TEXT_COLORS[part] || "text-ink-700"}>
            {part}
            {i < parts.length - 1 && <span className="text-ink-400 mx-0.5">&</span>}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${MOOD_STYLES[mood] || MOOD_STYLES.Neutral}`}>
      {mood}
    </span>
  );
}

export default function AllSessions() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/sessions")
      .then((res) => setSessions(res.data.sessions))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={{ name: user?.name || "User", initials: user?.name?.[0]?.toUpperCase() || "U" }} />
      <main className="flex-1 max-w-7xl mx-auto px-10 py-14 w-full">
        <button onClick={() => navigate("/dashboard")} className="text-sm text-brand-600 mb-4">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-semibold text-ink-900 mb-1">All Sessions</h1>
        <p className="text-base text-ink-500 mb-8">
          {sessions.length} total interview{sessions.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <p className="text-sm text-ink-500">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-ink-500">No sessions yet.</p>
        ) : (
          <div className="border border-ink-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                  <th className="px-5 py-3 font-normal">Date</th>
                  <th className="px-5 py-3 font-normal">Type</th>
                  <th className="px-5 py-3 font-normal">Difficulty</th>
                  <th className="px-5 py-3 font-normal">Questions</th>
                  <th className="px-5 py-3 font-normal">Score</th>
                  <th className="px-5 py-3 font-normal">Mood</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/session/${s.id}`)}
                    className="border-b border-ink-100 last:border-0 cursor-pointer hover:bg-ink-100/50"
                  >
                    <td className="px-5 py-3 text-ink-700">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-ink-700 capitalize">{s.interview_type}</td>
                    <td className="px-5 py-3 text-ink-700">{s.difficulty}</td>
                    <td className="px-5 py-3 text-ink-700">{s.question_count} Qs</td>
                    <td className="px-5 py-3 text-ink-900 font-medium">{s.overall_score}/100</td>
                    <td className="px-5 py-3">
                      <MoodBadge mood={s.dominant_mood} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}