import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";
import { Check } from "lucide-react";
export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "signin" ? "/auth/login" : "/auth/signup";

    try {
      const res = await api.post(endpoint, form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-500 flex-col justify-between p-14 relative overflow-hidden">
  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
  <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10" />

  <span className="text-white font-semibold text-lg relative z-10">Intervuo</span>

  <div className="relative z-10">
    <p className="text-4xl font-semibold text-white leading-tight mb-6">
      Practice interviews with AI that actually knows your resume.
    </p>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-white" />
        </div>
        <p className="text-white/90 text-sm">Questions generated from your actual background — not generic prompts</p>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-white" />
        </div>
        <p className="text-white/90 text-sm">Real-time emotion analysis from your voice and expression</p>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-white" />
        </div>
        <p className="text-white/90 text-sm">Detailed, actionable feedback after every session</p>
      </div>
    </div>
  </div>

  <p className="text-white/50 text-xs relative z-10">© 2026 Intervuo</p>
</div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-ink-900 text-center mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-base text-ink-500 text-center mb-10">
            {mode === "signin"
              ? "Sign in to continue your interview practice"
              : "Start practicing interviews with AI-powered feedback"}
          </p>

          <div className="border border-ink-100 rounded-xl p-8">
            <div className="flex rounded-lg bg-ink-100 p-1 mb-6">
              <button
                onClick={() => {
                  setMode("signin");
                  setForm({ name: "", email: "", password: "" });
                  setError("");
                }}
                className={`flex-1 text-sm py-1.5 rounded-md transition ${
                  mode === "signin"
                    ? "bg-white shadow-sm font-medium text-ink-900"
                    : "text-ink-500"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setForm({ name: "", email: "", password: "" });
                  setError("");
                }}
                className={`flex-1 text-sm py-1.5 rounded-md transition ${
                  mode === "signup"
                    ? "bg-white shadow-sm font-medium text-ink-900"
                    : "text-ink-500"
                }`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-sm text-ink-700 mb-1 block">
                    Full name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Johnson"
                    required
                    className="w-full border border-ink-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-ink-700 mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-ink-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-ink-700">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs text-brand-600"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border border-ink-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {error && <p className="text-xs text-danger-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
          </div>

          <p className="text-xs text-ink-500 text-center mt-2">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setForm({ name: "", email: "", password: "" });
                    setError("");
                  }}
                  className="text-brand-600 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setForm({ name: "", email: "", password: "" });
                    setError("");
                  }}
                  className="text-brand-600 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
