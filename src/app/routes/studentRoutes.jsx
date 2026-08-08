import React, { lazy } from "react";
import AuthModal from "../../components/layout/auth/AuthModal";
import HomePage from "../../components/pages/HomePage";
import { ClientPage } from "./RouteLayouts";

const CalendarPage = lazy(() => import("../../components/pages/CalendarPage"));
const LessonsPage = lazy(() => import("../../components/pages/LessonsPage"));
const Profile = lazy(() => import("../../components/pages/Profile/Profile"));
const ExamPage = lazy(() => import("../../components/pages/Profile/ExamPage"));
const Settings = lazy(() => import("../../components/pages/Profile/Settings"));
const ProjectsPage = lazy(() => import("../../components/pages/ProjectsPage"));
const NotificationsPage = lazy(() => import("../../components/pages/NotificationsPage"));

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
    path: "/notifications",
    element: (
      <ClientPage layoutProps={layoutProps}>
        <NotificationsPage user={user} />
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
