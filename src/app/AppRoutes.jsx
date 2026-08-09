import React, { Suspense, lazy, useState } from "react";
import { useRoutes } from "react-router-dom";
import { createAuthRoutes } from "./routes/authRoutes";
import { createStaffRoutes } from "./routes/staffRoutes";
import { createStudentRoutes } from "./routes/studentRoutes";
import { PageLoader } from "../components/ui";

const NotFoundPage = lazy(() => import("../components/pages/NotFoundPage"));

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

  const routes = useRoutes([
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
    { path: "*", element: <NotFoundPage isAuthenticated={isAuthenticated} /> },
  ]);

  return <Suspense fallback={<PageLoader />}>{routes}</Suspense>;
};

export default AppRoutes;
