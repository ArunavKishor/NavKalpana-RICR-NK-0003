import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../config/Api";
import { useAuth } from "../context/AuthContext";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

const Login = () => {
  const { setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const sessionMessage = sessionStorage.getItem("sessionExpiredMessage");
    if (sessionMessage) {
      toast.error(sessionMessage);
      sessionStorage.removeItem("sessionExpiredMessage");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearForm = () =>
    setFormData({
      email: "",
      password: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/login", formData);
      toast.success(res.data.message);

      const user = res?.data?.data;
      const role = user?.role;

      if (!user || !role) {
        toast.error("Invalid server response");
        return;
      }

      if (role !== "admin" && role !== "teacher") {
        toast.error("Access denied.");
        sessionStorage.removeItem("Token");
        return;
      }

      toast.success(`Welcome ${role === "admin" ? "Admin" : "Teacher"}`);

      setUser(user);
      setIsLogin(true);
      setRole(role);

      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("token", user.token);
      sessionStorage.setItem("Token", JSON.stringify(user));

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      }
      handleClearForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-3 sm:px-4 py-4 sm:py-6">
        {/* Background Grid Layer */}
        <div
          className="absolute inset-0 -z-10 h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.90 0.01 255.4 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.90 0.01 255.4 / 0.5) 1px, transparent 1px)",
            backgroundSize: "6rem 4rem",
          }}
        />

        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          {/* Logo Mark */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center mb-8"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-premium mb-3 bg-white"
            >
              <img src="/logo.png" alt="MindRise Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1
              className="text-2xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              MindRise
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Classroom Intelligence Platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card shadow-premium rounded-2xl p-6 sm:p-10 border border-border/50"
          >
            <h2
              className="text-xl sm:text-2xl font-bold text-foreground text-center mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Sign in to your account
            </h2>
            <p className="text-muted-foreground text-sm text-center mt-1 mb-6">
              Enter your credentials to continue
            </p>

            <form
              onSubmit={handleSubmit}
              onReset={handleClearForm}
              className="space-y-4 sm:space-y-5"
            >
              {/* Email */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-border
                             focus:ring-2 focus:ring-primary/40 focus:border-primary
                             outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-xs sm:text-sm font-medium text-foreground block mb-1.5">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-border
                             focus:ring-2 focus:ring-primary/40 focus:border-primary
                             outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 sm:right-4 bottom-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="reset"
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-border
                             text-foreground hover:bg-secondary transition-colors"
                >
                  Clear
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold
                             shadow-sm transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          <p className="text-center text-muted-foreground mt-6 sm:mt-8 text-xs font-medium">
            &copy; {new Date().getFullYear()} MindRise. All rights reserved.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t border-border/50 bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              MindRise
            </span>
            <span className="text-border text-sm">|</span>
            <span className="text-xs text-muted-foreground">
              Empowering Education
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Login;
