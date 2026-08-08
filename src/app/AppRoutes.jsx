import React, { useState } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { createAuthRoutes } from "./routes/authRoutes";
import { createStaffRoutes } from "./routes/staffRoutes";
import { createStudentRoutes } from "./routes/studentRoutes";

const AppRoutes = ({
  user,
  isAuthenticated,
  onAuthSuccess,
  onLogout,
  onUserUpdate,
  onMajorSelected,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openAuthModal = () => {
    setIsLogin(true);
    setIsAuthModalOpen(true);
  };

  const handleModalAuthSuccess = (result) => {
    setIsAuthModalOpen(false);
    onAuthSuccess(result);
  };

  const layoutProps = {
    isAuthenticated,
    user,
    onLogout,
    onAuthModalOpen: openAuthModal,
  };

  return useRoutes([
    ...createAuthRoutes({
      user,
      isAuthenticated,
      onAuthSuccess,
      onMajorSelected,
    }),
    ...createStaffRoutes({ user, onLogout }),
    ...createStudentRoutes({
      user,
      onLogout,
      onUserUpdate,
      layoutProps,
      authModal: {
        isOpen: isAuthModalOpen,
        isLogin,
        open: openAuthModal,
        close: () => setIsAuthModalOpen(false),
        setIsLogin,
        onAuthSuccess: handleModalAuthSuccess,
      },
    }),
    { path: "*", element: <Navigate to="/login" replace /> },
  ]);
};

export default AppRoutes;
