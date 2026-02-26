import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/config/Api";
import PageLoader from "@/components/common/PageLoader";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
        setRole(parsedUser.role);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    setRole(userData.role);
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", userData.token);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Continue with client-side cleanup even if API call fails
    }
    setUser(null);
    setIsLogin(false);
    setRole(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLogin,
        setIsLogin,
        role,
        setRole,
        login,
        logout,
        isLoading,
      }}
    >
      {isLoading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
};
