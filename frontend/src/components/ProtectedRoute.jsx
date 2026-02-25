import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLogin } = useAuth();
    const location = useLocation();

    if (!isLogin || !user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Check if role is allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role if they try to access unauthorized pages
        if (user.role === "admin") {
            return <Navigate to="/admin-dashboard" replace />;
        } else if (user.role === "teacher") {
            return <Navigate to="/teacher-dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
