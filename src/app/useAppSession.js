import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, logoutMiddleware } from "../auth/authMiddleware";

const SESSION_KEY = "learnflow_session";

const destinationFor = (user) => {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "teacher") return "/teacher/dashboard";
  return "/home";
};

const useAppSession = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getSession());

  useEffect(() => {
    if (
      user &&
      user.role !== "admin" &&
      !user.major &&
      user.needsMajorSelect === true
    ) {
      navigate("/select-major", { replace: true });
    }
  }, [navigate, user]);

  const handleAuthSuccess = useCallback(
    (result) => {
      if (!result.success) return;

      setUser(result.user);
      navigate(
        result.needsMajorSelect ? "/select-major" : result.redirect,
        { replace: true },
      );
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    const { redirect } = logoutMiddleware();
    setUser(null);
    navigate(redirect, { replace: true });
  }, [navigate]);

  const handleUserUpdate = useCallback((updatedUser) => {
    const currentSession = getSession();
    const nextUser = currentSession
      ? { ...currentSession, ...updatedUser }
      : updatedUser;

    setUser(nextUser);
    if (currentSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    }
  }, []);

  const handleMajorSelected = useCallback(() => {
    const updatedSession = getSession();
    if (!updatedSession) {
      navigate("/login", { replace: true });
      return;
    }

    setUser(updatedSession);
    navigate(destinationFor(updatedSession), { replace: true });
  }, [navigate]);

  return {
    user,
    isAuthenticated: Boolean(user),
    onAuthSuccess: handleAuthSuccess,
    onLogout: handleLogout,
    onUserUpdate: handleUserUpdate,
    onMajorSelected: handleMajorSelected,
  };
};

export default useAppSession;
