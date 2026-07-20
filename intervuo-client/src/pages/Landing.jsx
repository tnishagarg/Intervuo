import { useNavigate } from "react-router-dom";
import { UploadCloud, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Footer from "../components/Footer";
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const handleStart = () => {
    navigate(user ? "/upload" : "/auth");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
        <span className="font-semibold text-ink-900">Intervuo</span>
        <button
          onClick={() => navigate(user ? "/dashboard" : "/auth")}
          className="text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          {user ? "Dashboard" : "Sign in"}
        </button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center w-full">
        <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-5">
          AI-powered mock interviews
        </span>
        <h1 className="text-5xl font-semibold text-ink-900 leading-tight mb-5 tracking-tight">
          Ace your next interview with Intervuo
        </h1>
        <p className="text-lg text-ink-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Upload your resume. Answer AI-generated questions. Get actionable feedback.
        </p>
        <button
          onClick={handleStart}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl px-8 py-3.5 shadow-sm transition"
        >
          Upload resume to start
        </button>

        <div className="grid grid-cols-3 gap-6 mt-24 text-left">
          <div className="border border-ink-100 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <UploadCloud size={19} className="text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-ink-900 mb-1.5">Upload resume</p>
            <p className="text-xs text-ink-500 leading-relaxed">
              Share your experience so we can tailor the interview strictly to your background.
            </p>
          </div>
          <div className="border border-ink-100 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <MessageSquare size={19} className="text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-ink-900 mb-1.5">Answer questions</p>
            <p className="text-xs text-ink-500 leading-relaxed">
              Face realistic interview scenarios with our interactive voice and video mock sessions.
            </p>
          </div>
          <div className="border border-ink-100 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={19} className="text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-ink-900 mb-1.5">Get feedback</p>
            <p className="text-xs text-ink-500 leading-relaxed">
              Receive detailed scores, actionable insights, and improved answers instantly.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}