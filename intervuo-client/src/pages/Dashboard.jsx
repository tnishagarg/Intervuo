import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, FileUp, MessageSquare, BarChart3 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";
import Footer from "../components/Footer";
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
            {i < parts.length - 1 && (
              <span className="text-ink-400 mx-0.5">&</span>
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${MOOD_STYLES[mood] || MOOD_STYLES.Neutral}`}
    >
      {mood}
    </span>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load your dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-ink-500">Loading your dashboard...</p>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const isEmpty = data && data.totalSessions === 0;

  const today = new Date();
  const sessionDayStrings = new Set(
    (data?.recentSessions || []).map((s) =>
      new Date(s.created_at).toDateString(),
    ),
  );
  const weekStrip = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      label: DAYS[(d.getDay() + 6) % 7],
      active: sessionDayStrings.has(d.toDateString()),
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        user={{ name: user?.name || "You", initials: user?.name?.[0] || "U" }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-10 py-14 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">
              {isEmpty
                ? `Welcome to Intervuo, ${firstName}`
                : `Welcome back, ${firstName}`}
            </h1>
            <p className="text-sm text-ink-500">
              {isEmpty
                ? "Your dashboard is ready — start your first practice session to see your progress here."
                : "Ready for your next practice session?"}
            </p>
          </div>
          <div className="flex gap-3">
            {!isEmpty && (
              <button
                onClick={() => navigate("/upload")}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2"
              >
                + New Interview
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-ink-500 border border-ink-300 rounded-lg px-4 py-2"
            >
              Log out
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-danger-500 mb-4">{error}</p>}

        {isEmpty ? (
          <>
            <div className="border border-ink-100 rounded-xl p-10 text-center mb-6">
              <Mic size={28} className="mx-auto text-ink-400 mb-3" />
              <p className="text-base font-medium text-ink-900 mb-1">
                No interviews yet
              </p>
              <p className="text-sm text-ink-500 mb-1">
                Once you complete your first session, your score, emotion
                analysis, and session history will appear here.
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 mt-4"
              >
                Start your first interview →
              </button>
              <p className="text-xs text-ink-500 mt-2">
                Takes about 15 minutes • No preparation needed
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="border border-ink-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center">
                    1
                  </span>
                  <FileUp size={16} className="text-ink-500" />
                </div>
                <p className="text-sm font-medium text-ink-900 mb-1">
                  Upload your resume
                </p>
                <p className="text-xs text-ink-500">
                  We read your skills and experience to tailor every question.
                </p>
              </div>
              <div className="border border-ink-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center">
                    2
                  </span>
                  <MessageSquare size={16} className="text-ink-500" />
                </div>
                <p className="text-sm font-medium text-ink-900 mb-1">
                  Answer out loud
                </p>
                <p className="text-xs text-ink-500">
                  Speak your answers naturally — we transcribe and analyze in
                  real time.
                </p>
              </div>
              <div className="border border-ink-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center">
                    3
                  </span>
                  <BarChart3 size={16} className="text-ink-500" />
                </div>
                <p className="text-sm font-medium text-ink-900 mb-1">
                  Get your report
                </p>
                <p className="text-xs text-ink-500">
                  Receive a score, emotion timeline, and AI coaching tips per
                  answer.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="border border-ink-100 rounded-xl p-7 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-900 mb-1">
                  {data.streak}-day streak
                </p>
                <p className="text-xs text-ink-500">
                  Practice today to keep your streak!
                </p>
              </div>
              <div className="flex gap-2">
                {weekStrip.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                        day.active
                          ? "bg-warning-500 text-white"
                          : day.isToday
                            ? "border-2 border-brand-500 text-ink-500"
                            : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      🔥
                    </div>
                    <span className="text-[10px] text-ink-500">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border border-ink-100 rounded-xl p-7">
                <p className="text-xs text-ink-500 mb-1">Total Sessions</p>
                <p className="text-3xl font-semibold text-ink-900">
                  {data.totalSessions}
                </p>
              </div>
              <div className="border border-ink-100 rounded-xl p-7">
                <p className="text-xs text-ink-500 mb-1">Average Score</p>
                <p className="text-3xl font-semibold text-ink-900">
                  {data.avgScore}
                  <span className="text-base text-ink-500">/100</span>
                </p>
              </div>
              <div className="border border-ink-100 rounded-xl p-7">
                <p className="text-xs text-ink-500 mb-1">Current Streak</p>
                <p className="text-3xl font-semibold text-ink-900">
                  {data.streak} day{data.streak !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {data.scoreTrend?.length > 1 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 border border-ink-100 rounded-xl p-7">
                  <p className="text-sm font-medium text-ink-900 mb-3">
                    Score Trend
                  </p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={data.scoreTrend}>
                      <YAxis domain={[0, 100]} hide />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-brand-500)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-ink-500 mt-1">
                    Last {data.scoreTrend.length} sessions
                  </p>
                </div>

                <div className="border border-ink-100 rounded-xl p-7">
                  <p className="text-sm font-medium text-ink-900 mb-3">
                    Suggested Focus
                  </p>
                  {data.suggestions?.length > 0 ? (
                    <div className="space-y-2">
                      {data.suggestions.map((s, i) => (
                        <div key={i}>
                          <p className="text-xs font-medium text-ink-900">
                            {s.title}
                          </p>
                          <p className="text-xs text-ink-500">{s.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-500">
                      Keep practicing to see personalized tips here.
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="border border-ink-100 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-900">
                  Recent Sessions
                </p>
                <button
                  onClick={() => navigate("/sessions")}
                  className="text-xs text-brand-600 font-medium"
                >
                  View all →
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                    <th className="px-5 py-2 font-normal">Date</th>
                    <th className="px-5 py-2 font-normal">Type</th>
                    <th className="px-5 py-2 font-normal">Questions</th>
                    <th className="px-5 py-2 font-normal">Score</th>
                    <th className="px-5 py-2 font-normal">Mood</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSessions.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/session/${s.id}`)}
                      className="border-b border-ink-100 last:border-0 cursor-pointer hover:bg-ink-100/50"
                    >
                      <td className="px-5 py-3 text-ink-700">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-ink-700 capitalize">
                        {s.interview_type}
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {s.question_count} Qs
                      </td>
                      <td className="px-5 py-3 text-ink-900 font-medium">
                        {s.overall_score}/100
                      </td>
                      <td className="px-5 py-3">
                        <MoodBadge mood={s.dominant_mood} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
