import React from "react";
import AuthModal from "../../components/layout/auth/AuthModal";
import CalendarPage from "../../components/pages/CalendarPage";
import HomePage from "../../components/pages/HomePage";
import LessonsPage from "../../components/pages/LessonsPage";
import Profile from "../../components/pages/Profile/Profile";
import ExamPage from "../../components/pages/Profile/ExamPage";
import Settings from "../../components/pages/Profile/Settings";
import ProjectsPage from "../../components/pages/ProjectsPage";
import { ClientPage } from "./RouteLayouts";

export const createStudentRoutes = ({
  user,
  onLogout,
  onUserUpdate,
  layoutProps,
  authModal,
}) => [
  {
    path: "/profile",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <Profile user={user} onUserUpdate={onUserUpdate} />
      </ClientPage>
    ),
  },
  {
    path: "/exam",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <ExamPage user={user} />
      </ClientPage>
    ),
  },
  {
    path: "/settings",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <Settings
          user={user}
          onLogout={onLogout}
          onUserUpdate={onUserUpdate}
        />
      </ClientPage>
    ),
  },
  {
    path: "/home",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <HomePage onAuthModalOpen={authModal.open} />
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={authModal.close}
          isLogin={authModal.isLogin}
          setIsLogin={authModal.setIsLogin}
          onAuthSuccess={authModal.onAuthSuccess}
        />
      </ClientPage>
    ),
  },
  {
    path: "/lessons",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <LessonsPage />
      </ClientPage>
    ),
  },
  {
    path: "/projects",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <ProjectsPage />
      </ClientPage>
    ),
  },
  {
    path: "/calendar",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <CalendarPage user={user} />
      </ClientPage>
    ),
  },
];
