import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [resumeData, setResumeData] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("intervuo_token");
    const savedUser = localStorage.getItem("intervuo_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("intervuo_token", token);
    localStorage.setItem("intervuo_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("intervuo_token");
    localStorage.removeItem("intervuo_user");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        resumeData, setResumeData,
        interviewConfig, setInterviewConfig,
        questions, setQuestions,
        currentQuestionIndex, setCurrentQuestionIndex,
        answers, setAnswers,
        user, authLoading, login, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}