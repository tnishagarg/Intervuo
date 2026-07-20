import { useState, useEffect } from "react";
import { Users, Code2, Briefcase, Mic, Camera, MessageCircle } from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";
import Footer from "../components/Footer";
const INTERVIEW_TYPES = [
  {
    id: "behavioral",
    label: "Behavioral",
    desc: "Leadership, culture fit, and soft skills.",
    icon: Users,
  },
  {
    id: "technical",
    label: "Technical",
    desc: "System design and coding scenarios.",
    icon: Code2,
  },
  {
    id: "hr",
    label: "HR",
    desc: "Salary expectations, background, and general fit.",
    icon: MessageCircle,
  },
  {
    id: "mixed",
    label: "Mixed",
    desc: "A combination of all question types.",
    icon: Briefcase,
  },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { resumeData, setInterviewConfig, setQuestions, setCurrentQuestionIndex, setAnswers, user } = useAppContext();
  const [selectedType, setSelectedType] = useState("technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [targetRole, setTargetRole] = useState("");
  const [questionCount, setQuestionCount] = useState(8);
  const [micReady, setMicReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        setMicReady(stream.getAudioTracks().length > 0);
      })
      .catch(() => setMicReady(false));

    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        setCameraReady(stream.getVideoTracks().length > 0);
      })
      .catch(() => setCameraReady(false));
  }, []);

  const handleStart = async () => {
    setGenerating(true);
    setGenError("");
    try {
      const res = await api.post("/interview/generate-questions", {
        resumeText: resumeData?.resumeText || "",
        type: selectedType,
        difficulty,
        targetRole,
        questionCount,
      });
      setQuestions(res.data.questions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setInterviewConfig({
        type: selectedType,
        difficulty,
        targetRole,
        questionCount,
      });
      navigate("/interview");
    } catch (err) {
      setGenError(
        err.response?.data?.message ||
          "Couldn't generate questions. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={{ name: user?.name || "User", initials: user?.name?.[0]?.toUpperCase() || "U" }} />
      <main className="flex-1 max-w-4xl mx-auto px-8 py-16 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-ink-900 mb-2">
            Set up your interview
          </h1>
          <p className="text-base text-ink-500">
            {resumeData
              ? `Based on: ${resumeData.skills.join(", ")}`
              : "Choose your preferences to generate tailored questions."}
          </p>
        </div>

        <div className="border border-ink-100 rounded-2xl p-8 mb-6">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Interview type
          </p>
          <div className="grid grid-cols-4 gap-4">
            {INTERVIEW_TYPES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`text-left rounded-xl p-5 border-2 transition ${
                  selectedType === id
                    ? "border-brand-500 bg-brand-50 shadow-sm"
                    : "border-ink-100 hover:border-ink-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  selectedType === id ? "bg-brand-500" : "bg-ink-100"
                }`}>
                  <Icon size={18} className={selectedType === id ? "text-white" : "text-ink-500"} />
                </div>
                <p className="text-sm font-semibold text-ink-900 mb-1">{label}</p>
                <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-ink-100 rounded-2xl p-8 mb-6">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Difficulty
          </p>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`text-sm font-medium px-5 py-2 rounded-full border-2 transition ${
                  difficulty === level
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-ink-200 text-ink-700 hover:border-ink-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-ink-100 rounded-2xl p-8 mb-6">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Target role <span className="text-ink-400 normal-case font-normal">(optional)</span>
          </p>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Software Engineer at Google"
            className="w-full border border-ink-300 rounded-lg px-4 py-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
          <p className="text-xs text-brand-600">AI tailors questions to this role</p>
        </div>

        <div className="border border-ink-100 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              Number of questions
            </p>
            <span className="text-sm font-semibold text-brand-600">{questionCount}</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full mb-1 accent-brand-500"
          />
          <div className="flex justify-between text-xs text-ink-400">
            <span>3</span>
            <span>12</span>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <span
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${micReady ? "bg-success-50 text-success-700" : "bg-ink-100 text-ink-500"}`}
          >
            <Mic size={12} />
            {micReady ? "Microphone ready" : "Microphone not detected"}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${cameraReady ? "bg-success-50 text-success-700" : "bg-ink-100 text-ink-500"}`}
          >
            <Camera size={12} />
            {cameraReady ? "Camera ready" : "Camera not detected"}
          </span>
        </div>

        <button
          onClick={handleStart}
          disabled={!micReady || !cameraReady || generating}
          className={`w-full text-base font-semibold rounded-xl py-4 transition ${
            micReady && cameraReady && !generating
              ? "bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
              : "bg-ink-100 text-ink-400 cursor-not-allowed"
          }`}
        >
          {generating ? "Generating your questions..." : "Start interview"}
        </button>
        {genError && (
          <p className="text-xs text-danger-500 text-center mt-3">{genError}</p>
        )}
        {(!micReady || !cameraReady) && (
          <p className="text-xs text-ink-500 text-center mt-3">
            Allow microphone and camera access to continue
          </p>
        )}
      </main>
      <Footer />
    </div>
  );

}
