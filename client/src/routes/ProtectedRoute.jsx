import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLogin, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (isLogin && role === "admin") {
    return children;
  }

  return <Navigate to="/admin-login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
