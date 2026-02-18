import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/dashbords/AdminDashbord";
import UserDashboard from "./pages/dashbords/UserDashboard";
import { AuthProvider } from "./context/AuthContext";
import { StackHandler, StackProvider, StackTheme } from "@stackframe/react";
import { stackClientApp } from "./stack/client";

const App = () => {
  return (
    <BrowserRouter>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <AuthProvider>
            <Toaster />
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={
                <div className="relative min-h-screen flex items-center justify-center">
                  <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                  <StackHandler />
                </div>
              } />
              <Route path="/register" element={
                <div className="relative min-h-screen flex items-center justify-center">
                  <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                  <StackHandler />
                </div>
              } />
              <Route path="/handler/*" element={<StackHandler fullPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
            </Routes>
          </AuthProvider>
        </StackTheme>
      </StackProvider>
    </BrowserRouter>
  );
};

export default App;
