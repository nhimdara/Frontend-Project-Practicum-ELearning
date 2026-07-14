import React from "react";
import { Navigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import PageLayout from "../../components/layout/PageLayout";
import LoginPage from "../../components/layout/auth/Loginpage";
import ProtectedRoute from "../../components/layout/auth/ProtectedRoute";

const defaultDestination = (user) => {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "teacher") return "/teacher/dashboard";
  return user?.major ? "/home" : "/select-major";
};

export const AuthPage = ({ isAuthenticated, user, onAuthSuccess }) => {
  if (isAuthenticated) {
    return <Navigate to={defaultDestination(user)} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LoginPage onAuthSuccess={onAuthSuccess} />
      <Footer />
    </div>
  );
};

export const ClientPage = ({ layoutProps, children }) => (
  <ProtectedRoute requiredRole="client">
    <PageLayout {...layoutProps}>{children}</PageLayout>
  </ProtectedRoute>
);
