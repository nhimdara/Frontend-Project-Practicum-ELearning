import React from "react";
import { Navigate } from "react-router-dom";
import MajorSelectPage from "../../components/pages/Majorselectpage";
import { AuthPage } from "./RouteLayouts";

export const createAuthRoutes = ({
  user,
  isAuthenticated,
  onAuthSuccess,
  onMajorSelected,
}) => {
  const authPage = (
    <AuthPage
      isAuthenticated={isAuthenticated}
      user={user}
      onAuthSuccess={onAuthSuccess}
    />
  );

  return [
    { path: "/", element: authPage },
    { path: "/login", element: authPage },
    { path: "/register", element: <Navigate to="/login" replace /> },
    {
      path: "/select-major",
      element: <MajorSelectPage onMajorSelected={onMajorSelected} />,
    },
  ];
};
