import React, { lazy } from "react";
import ProtectedRoute from "../../components/layout/auth/ProtectedRoute";
const AdminDashboard = lazy(() => import("../../components/pages/AdminDashboard"));
const CertificatesPage = lazy(() => import("../../components/pages/CertificatesPage"));
const TeacherDashboard = lazy(() => import("../../components/pages/TeacherDashboard"));

export const createStaffRoutes = ({ user, onLogout }) => [
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard user={user} onLogout={onLogout} />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/dashboard",
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherDashboard user={user} onLogout={onLogout} />
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificates",
    element: (
      <ProtectedRoute requiredRole="admin">
        <CertificatesPage user={user} onLogout={onLogout} />
      </ProtectedRoute>
    ),
  },
];
