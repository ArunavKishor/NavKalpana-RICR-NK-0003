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

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("Token");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsLogin(true);
        setRole(parsed.role);
      }
    } catch (error) {
      console.error("Failed to parse stored user", error);
    }
  }, []);

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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
