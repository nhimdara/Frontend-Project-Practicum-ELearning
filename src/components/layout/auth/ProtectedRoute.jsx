// ProtectedRoute.js — Complete
import React from "react";
import { Navigate } from "react-router-dom";
import { routeGuardMiddleware, getSession } from "../../../auth/authMiddleware";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute requiredRole="admin">   → only admins
 *   <ProtectedRoute requiredRole="teacher"> → only teachers
 *   <ProtectedRoute requiredRole="client">  → only clients
 *   <ProtectedRoute>                        → any logged-in user
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  // First check the route guard
  const guard = routeGuardMiddleware(requiredRole);

  // If not allowed, redirect
  if (!guard.allowed) {
    return <Navigate to={guard.redirect} replace />;
  }

  // Get the session to check major status
  const session = getSession();

  // ALL users (except admin) need to select major if they don't have one
  if (
    session?.role !== "admin" &&
    !session.major &&
    session.needsMajorSelect === true
  ) {
    return <Navigate to="/select-major" replace />;
  }

  // For everyone else (including users with major selected), render children
  return children;
};

export default ProtectedRoute;
