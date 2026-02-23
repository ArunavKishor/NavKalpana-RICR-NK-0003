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
      const res = await api.post("/api/auth/login", formData);
      toast.success(res.data.message);

      const user = res?.data?.data;
      const role = user?.role;

      if (!user || !role) {
        toast.error("Invalid server response");
        return;
      }

      if (role !== "admin") {
        toast.error("Access denied. Admins only.");
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

      navigate("/admin-dashboard");
      handleClearForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl p-6 sm:p-8 border border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center">
              Education Portal Login
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm mt-2 text-center">
              Sign in to access the administration panel
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

          <p className="text-center text-slate-400 mt-5 sm:mt-6 text-xs">
            © 2026 Administration System
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
