import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-ink-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}