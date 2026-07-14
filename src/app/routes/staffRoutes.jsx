import React from "react";
import ProtectedRoute from "../../components/layout/auth/ProtectedRoute";
import AdminDashboard from "../../components/pages/AdminDashboard";
import CertificatesPage from "../../components/pages/CertificatesPage";
import TeacherDashboard from "../../components/pages/TeacherDashboard";

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
