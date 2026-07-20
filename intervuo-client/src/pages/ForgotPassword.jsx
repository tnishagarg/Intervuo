import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStatus("sent");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink-900 text-center mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-ink-500 text-center mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        <div className="border border-ink-100 rounded-xl p-6">
          {status === "sent" ? (
            <p className="text-sm text-success-700 text-center">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-ink-700 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-ink-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {status === "error" && <p className="text-xs text-danger-500">{message}</p>}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <button onClick={() => navigate("/auth")} className="text-xs text-brand-600 text-center w-full mt-4">
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}