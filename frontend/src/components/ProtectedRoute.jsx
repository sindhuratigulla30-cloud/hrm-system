import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ============================================================
 * PROTECTED ROUTE COMPONENT
 * ============================================================
 * 
 * Checks authentication and role before allowing access
 * Redirects to landing page if not authenticated
 * Redirects if user doesn't have required role
 */

function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    user = null;
  }

  // ========================================================
  // CHECK AUTHENTICATION
  // ========================================================

  if (!token || !user) {
    // Not authenticated - redirect to landing
    console.log("No token or user found, redirecting to landing");
    return <Navigate to="/" replace />;
  }

  // ========================================================
  // CHECK ROLE (if required)
  // ========================================================

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role - redirect to landing
    console.log(`User role "${user.role}" doesn't match required role "${requiredRole}"`);
    return <Navigate to="/" replace />;
  }

  // ========================================================
  // AUTHENTICATED & AUTHORIZED
  // ========================================================

  return children;
}

export default ProtectedRoute;
