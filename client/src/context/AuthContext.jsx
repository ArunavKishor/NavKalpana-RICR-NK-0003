import React, { createContext, useContext } from "react";
import { useStackApp, useUser } from "@stackframe/react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};



export const AuthProvider = ({ children }) => {
  const user = useUser();
  const app = useStackApp();

  // Map Stack user to app user shape
  const appUser = user ? {
    ...user,
    fullName: user.displayName || user.primaryEmail,
    role: "customer", // Default role, can be enhanced later with metadata
  } : null;

  const isLogin = !!user;

  const logout = async () => {
    await app.signOut();
    sessionStorage.removeItem("CravingUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        setUser: () => { }, // No-op as state is managed by Stack
        isLogin,
        setIsLogin: () => { }, // No-op
        role: appUser?.role,
        setRole: () => { }, // No-op
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
