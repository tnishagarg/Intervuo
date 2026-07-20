import { useRef, useState } from "react";
import { UploadCloud, Check, AlertTriangle } from "lucide-react";
import Header from "../components/Header";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Footer from "../components/Footer";
export default function ResumeUpload() {
  const navigate = useNavigate();
  const { setResumeData, user } = useAppContext();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMsg("Only PDF files are supported.");
      return;
    }

    setStatus("loading");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Couldn't read this file — try a text-based PDF, not a scanned image.",
      );
      setStatus("error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    uploadFile(e.dataTransfer.files?.[0]);
  };

 return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        user={{
          name: user?.name || "User",
          initials: user?.name?.[0]?.toUpperCase() || "U",
        }}
      />

      <main className="flex-1 max-w-2xl mx-auto px-8 py-16 w-full flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-ink-900 mb-1.5">
            Upload your resume
          </h1>
          <p className="text-sm text-ink-500">
            We'll tailor your mock interview to your background.
          </p>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-ink-300 hover:border-brand-500/50 rounded-2xl py-16 px-10 text-center mb-6 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <UploadCloud size={26} className="text-brand-600" />
          </div>
          <p className="text-lg font-semibold text-ink-900 mb-1.5">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-ink-500 mb-6">PDF files only · Max 10MB</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-ink-700 border border-ink-300 rounded-xl px-6 py-2.5 hover:bg-ink-50 transition"
          >
            Browse files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <p className="text-sm text-ink-500">Analyzing your resume...</p>
          </div>
        )}

        {status === "success" && result && (
          <div className="border border-ink-100 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-success-50 flex items-center justify-center">
                <Check size={13} className="text-success-600" />
              </div>
              <span className="text-sm font-medium text-ink-900">
                Resume analyzed successfully
              </span>
            </div>

            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2.5">
              Extracted skills
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {result.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-700"
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2.5">
              Experience level
            </p>
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-ink-100 text-ink-700 mb-6">
              {result.experienceLevel}
            </span>

            <button
              onClick={() => {
                setResumeData(result);
                navigate("/setup");
              }}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl py-3 shadow-sm transition"
            >
              Continue
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="border border-danger-500/30 bg-danger-50 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle size={17} className="text-danger-500" />
              <span className="text-sm font-semibold text-ink-900">
                Couldn't read this file
              </span>
            </div>
            <p className="text-xs text-ink-500 mb-5">{errorMsg}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm font-medium text-ink-700 border border-ink-300 rounded-xl px-5 py-2 hover:bg-white transition"
            >
              Try again
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );

}
