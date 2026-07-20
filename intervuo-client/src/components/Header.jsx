import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Header({ user, statusBadge }) {
  const navigate = useNavigate();
  const { logout } = useAppContext();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-3 border-b border-ink-100">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-ink-900">Intervuo</span>
        {statusBadge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning-50 text-warning-700">
            {statusBadge}
          </span>
        )}
      </div>

      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-ink-700"
          >
            <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center">
              {user.initials}
            </span>
            {user.name}
            <ChevronDown size={14} className="text-ink-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-ink-100 rounded-lg shadow-lg py-1 z-20">
              <button
                onClick={() => { setOpen(false); navigate("/dashboard"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 text-left"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
  onClick={() => { setOpen(false); navigate("/settings"); }}
  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 text-left"
>
  <Settings size={14} />
  Settings
</button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 text-left"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="text-sm text-ink-700">Sign in</button>
      )}
    </header>
  );
}