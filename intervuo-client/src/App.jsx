import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ResumeUpload from "./pages/ResumeUpload";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import FeedbackReport from "./pages/FeedbackReport";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import SessionDetail from "./pages/SessionDetail";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AllSessions from "./pages/AllSessions";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/session/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
    <Route path="/sessions" element={<ProtectedRoute><AllSessions /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/interview-complete" element={<ProtectedRoute><FeedbackReport /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;