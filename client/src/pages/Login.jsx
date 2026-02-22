import React, { useState } from "react";
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
      console.log("📤 Sending login request with:", formData);
      const res = await api.post("/api/auth/login", formData);
      console.log("✅ Login response:", res.data);
      toast.success(res.data.message);

      const user = res?.data?.data;
      const role = user?.role;

      if (!user || !role) {
        toast.error("Invalid server response");
        return;
      }

      if (role !== "admin" && role !== "teacher") {
        toast.error("Access denied. Admins and Teachers only.");
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
        navigate("/admin-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      }
      handleClearForm();
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error?.response?.data);
      console.error("❌ Status code:", error?.response?.status);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-3 sm:px-4 py-4 sm:py-6">
        {/* Background Grid Layer */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>

        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-lg sm:rounded-2xl p-6 sm:p-10 border border-gray-100">
            <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 text-center mb-1">
              Sign in to mindrise
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-2 text-center font-medium">
              Access your administration panel
            </p>

            <form
              onSubmit={handleSubmit}
              onReset={handleClearForm}
              className="space-y-4 sm:space-y-5 md:space-y-6 mt-6 sm:mt-8"
            >
              {/* Email */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter admin email"
                  className="w-full mt-1.5 sm:mt-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             outline-none transition-all bg-white"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                  Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter password"
                  className="w-full mt-1.5 sm:mt-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             outline-none transition-all bg-white"
                />

                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 sm:right-4 top-[42px] sm:top-[46px] cursor-pointer
                             text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="reset"
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200
                             text-slate-600 hover:bg-slate-50 transition"
                >
                  Clear
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-indigo-600 text-white font-medium
                             shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <p className="text-center text-slate-400 mt-6 sm:mt-8 text-xs font-medium">
            © {new Date().getFullYear()} Mindrise Administration. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t border-slate-100/50 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              mindrise
            </span>
            <span className="text-slate-300 text-sm">|</span>
            <span className="text-xs text-slate-500">Empowering Education</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Login;
