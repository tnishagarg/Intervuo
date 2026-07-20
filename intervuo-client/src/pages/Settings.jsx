import { useEffect, useState } from "react";
import { User, Lock, FileText } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";

export default function Settings() {
  const { user } = useAppContext();
  const [tab, setTab] = useState("profile");

  const [name, setName] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
  api.get("/profile/me").then((res) => setName(res.data.name));
}, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      await api.put("/profile/me", { name });
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg("");
    setPasswordError("");
    try {
      await api.put("/profile/password", { currentPassword, newPassword });
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setPasswordSaving(false);
    }
  };

 return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        user={{
          name: user?.name || "You",
          initials: user?.name?.[0]?.toUpperCase() || "U",
        }}
      />

      <main className="max-w-7xl mx-auto px-10 py-14 w-full flex-1">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-ink-900 mb-1.5">Settings</h1>
          <p className="text-sm text-ink-500">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-4 gap-10">
          <div className="col-span-1 space-y-1">
            <button
              onClick={() => setTab("profile")}
              className={`w-full flex items-center gap-2.5 text-sm px-3.5 py-2.5 rounded-xl text-left transition ${
                tab === "profile"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-ink-700 hover:bg-ink-100/60 font-medium"
              }`}
            >
              <User size={16} /> Profile
            </button>
            <button
              onClick={() => setTab("password")}
              className={`w-full flex items-center gap-2.5 text-sm px-3.5 py-2.5 rounded-xl text-left transition ${
                tab === "password"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-ink-700 hover:bg-ink-100/60 font-medium"
              }`}
            >
              <Lock size={16} /> Password
            </button>
          </div>

          <div className="col-span-3">
            {tab === "profile" && (
              <div className="border border-ink-100 rounded-2xl p-8 max-w-md">
                <h2 className="text-base font-semibold text-ink-900 mb-5">
                  Profile information
                </h2>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                      Full name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-ink-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                      Email
                    </label>
                    <input
                      value={user?.email || ""}
                      disabled
                      className="w-full border border-ink-200 bg-ink-100 rounded-xl px-3.5 py-2.5 text-sm text-ink-500"
                    />
                  </div>
                  {profileMsg && (
                    <p className="text-xs font-medium text-brand-600">{profileMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-sm transition disabled:opacity-60"
                  >
                    {profileSaving ? "Saving..." : "Save changes"}
                  </button>
                </form>
              </div>
            )}

            {tab === "password" && (
              <div className="border border-ink-100 rounded-2xl p-8 max-w-md">
                <h2 className="text-base font-semibold text-ink-900 mb-5">
                  Change password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full border border-ink-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full border border-ink-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs font-medium text-danger-500">{passwordError}</p>
                  )}
                  {passwordMsg && (
                    <p className="text-xs font-medium text-success-700">{passwordMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-sm transition disabled:opacity-60"
                  >
                    {passwordSaving ? "Updating..." : "Update password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
