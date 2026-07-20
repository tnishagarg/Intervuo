import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      setMessage(res.data.message);
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
      setStatus("error");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm font-medium text-danger-500 mb-1">Invalid or missing reset link</p>
          <p className="text-xs text-ink-500">Please request a new password reset email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-ink-900 mb-1.5">
            Set a new password
          </h1>
          <p className="text-sm text-ink-500">
            Choose a strong password you haven't used before.
          </p>
        </div>

        <div className="border border-ink-100 rounded-2xl p-7">
          {status === "success" ? (
            <div className="text-center py-2">
              <div className="w-11 h-11 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-ink-700 mb-6 leading-relaxed">{message}</p>
              <button
                onClick={() => navigate("/auth")}
                className="w-full text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl py-3 shadow-sm transition"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-ink-700 mb-1.5 block">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border border-ink-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
                <p className="text-xs text-ink-500 mt-1.5">Must be at least 6 characters.</p>
              </div>
              {status === "error" && (
                <p className="text-xs font-medium text-danger-500">{message}</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl py-3 shadow-sm transition disabled:opacity-60"
              >
                {status === "loading" ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

}