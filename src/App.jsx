// App.js — Complete with major selection for all users
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  getSession,
  logoutMiddleware,
  updateSessionMajor,
} from "./auth/authMiddleware";
import ProtectedRoute from "./components/layout/auth/ProtectedRoute";

import FontStyle from "./components/layout/ui/FontStyle";
import GlobalStyles from "./components/layout/ui/GlobalStyles";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthModal from "./components/layout/auth/AuthModal";
import ScrollToTop from "./components/assets/ScrollToTop";

import HomePage from "./components/pages/HomePage";
import LessonsPage from "./components/pages/LessonsPage";
import ProjectsPage from "./components/pages/ProjectsPage";
import CalendarPage from "./components/pages/CalendarPage";
import Profile from "./components/pages/Profile/Profile";
import Settings from "./components/pages/Profile/Settings";
import ExamPage from "./components/pages/Profile/ExamPage";

import AdminDashboard from "./components/pages/AdminDashboard";
import TeacherDashboard from "./components/pages/Teacherdashboard";
import MajorSelectPage from "./components/pages/Majorselectpage";

import LoginPage from "./components/layout/auth/Loginpage";

import AIChat from "./components/service/AIChat";

const deferState = (fn) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};

// ─────────────────────────────────────────────────────────────
//  PageLayout
// ─────────────────────────────────────────────────────────────
const PageLayout = ({
  isAuthenticated,
  user,
  onLogout,
  onAuthModalOpen,
  children,
  showAIChat = true,
}) => (
  <div className="nav-font min-h-screen flex flex-col">
    <FontStyle />
    <GlobalStyles />
    <Navbar
      isAuthenticated={isAuthenticated}
      user={user}
      onLogout={onLogout}
      onAuthModalOpen={onAuthModalOpen}
    />
    <main className="flex-grow">{children}</main>
    <Footer />
    {showAIChat && isAuthenticated && <AIChat />}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  AppInner
// ─────────────────────────────────────────────────────────────
const AppInner = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // ── Restore session on mount ──
  useEffect(() => {
    const session = getSession();

    if (session) {
      // ALL users (except admin) need major selection if they don't have one
      if (
        session.role !== "admin" &&
        !session.major &&
        session.needsMajorSelect === true
      ) {
        navigate("/select-major", { replace: true });
        return;
      }
      deferState(() => {
        setUser(session);
        setIsAuthenticated(true);
      });
    }
  }, [navigate]);

  // ── Theme ──
  useEffect(() => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("learnflow_settings") || "{}",
      );
      if (
        settings.theme === "dark" ||
        (settings.theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark-mode");
      } else {
        document.documentElement.classList.remove("dark-mode");
      }
    } catch {
      // Ignore malformed local settings and keep the default theme.
    }
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────

  const handleAuthSuccess = (middlewareResult) => {
    if (!middlewareResult.success) return;

    setUser(middlewareResult.user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    // ALL users (except admin) go to major selection if needed
    if (middlewareResult.needsMajorSelect) {
      navigate("/select-major", { replace: true });
      return;
    }

    navigate(middlewareResult.redirect, { replace: true });
  };

  const handleLogout = () => {
    const { redirect } = logoutMiddleware();
    setUser(null);
    setIsAuthenticated(false);
    navigate(redirect, { replace: true });
  };

  const handleUserUpdate = (updated) => {
    setUser(updated);
    const session = getSession();
    if (session) {
      const newSession = { ...session, ...updated };
      localStorage.setItem("learnflow_session", JSON.stringify(newSession));
    }
  };

  const openAuthModal = (mode) => {
    setIsLogin(true);
    setIsAuthModalOpen(true);
  };

  const restoredSession = getSession();
  const effectiveUser = user || restoredSession;
  const effectiveIsAuthenticated = isAuthenticated || Boolean(restoredSession);

  const layoutProps = {
    isAuthenticated: effectiveIsAuthenticated,
    user: effectiveUser,
    onLogout: handleLogout,
    onAuthModalOpen: openAuthModal,
  };

  return (
    <Routes>
      {/* ─── AUTH ROUTES ─── */}

      <Route
        path="/"
        element={
          effectiveIsAuthenticated ? (
            <Navigate
              to={
                effectiveUser?.role === "admin"
                  ? "/admin/dashboard"
                  : effectiveUser?.role === "teacher"
                    ? "/teacher/dashboard"
                    : effectiveUser?.major
                      ? "/home"
                      : "/select-major"
              }
              replace
            />
          ) : (
            <div className="min-h-screen flex flex-col">
              <LoginPage onAuthSuccess={handleAuthSuccess} />
              <Footer />
            </div>
          )
        }
      />

      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          effectiveIsAuthenticated ? (
            <Navigate
              to={
                effectiveUser?.role === "admin"
                  ? "/admin/dashboard"
                  : effectiveUser?.role === "teacher"
                    ? "/teacher/dashboard"
                    : effectiveUser?.major
                      ? "/home"
                      : "/select-major"
              }
              replace
            />
          ) : (
            <div className="min-h-screen flex flex-col">
              <LoginPage onAuthSuccess={handleAuthSuccess} />
              <Footer />
            </div>
          )
        }
      />

      {/* Major Selection - For ALL users who need it */}
      <Route
        path="/select-major"
        element={
          <MajorSelectPage
            onMajorSelected={(major) => {
              updateSessionMajor(major);
              const updatedSession = getSession();
              if (updatedSession) {
                setUser(updatedSession);
                setIsAuthenticated(true);
              }

              if (updatedSession?.role === "teacher") {
                navigate("/teacher/dashboard", { replace: true });
              } else if (updatedSession?.role === "admin") {
                navigate("/admin/dashboard", { replace: true });
              } else {
                navigate("/home", { replace: true });
              }
            }}
          />
        }
      />

      {/* ─── PROTECTED ROUTES ─── */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard user={effectiveUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard user={effectiveUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Profile user={effectiveUser} onUserUpdate={handleUserUpdate} />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/certificates"
        element={
          <ProtectedRoute requiredRole="admin">
            <Navigate
              to="/admin/dashboard"
              replace
              state={{ activeTab: "certificates" }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exam"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <ExamPage user={effectiveUser} />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Settings
                user={effectiveUser}
                onLogout={handleLogout}
                onUserUpdate={handleUserUpdate}
              />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* ─── PUBLIC PAGES ─── */}

      <Route
        path="/home"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <HomePage onAuthModalOpen={openAuthModal} />
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                onAuthSuccess={handleAuthSuccess}
              />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <LessonsPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <ProjectsPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <CalendarPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

// ─────────────────────────────────────────────────────────────
//  Root App
// ─────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <ScrollToTop />
    <AppInner />
  </Router>
);

export default App;
