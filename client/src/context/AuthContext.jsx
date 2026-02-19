import React, { createContext, useContext, useState, useEffect } from "react";

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
    const storedUser = sessionStorage.getItem("CravingUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
        setRole(parsedUser.role || "student");
      } catch (error) {
        console.error("Failed to parse stored user", error);
        sessionStorage.removeItem("CravingUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    setRole(userData.role || "student");
    sessionStorage.setItem("CravingUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLogin(false);
    setRole(null);
    sessionStorage.removeItem("Token");
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
        isLoading
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
