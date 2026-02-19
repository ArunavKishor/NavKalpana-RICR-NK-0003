import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../config/Api";
import { useAuth } from "../context/AuthContext";
import ForgetPasswordModal from "../components/publicModals/ForgetPasswordModal";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { GraduationCap } from "lucide-react";

const Login = () => {
  const { setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();

  const [isForgetPasswordModelOpen, setIsForgetPasswordModelOpen] =
    useState(false);

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
      const res = await api.post("/auth/login", formData);

      const user = res?.data?.data;
      const role = user?.role;

      if (!user || !role) {
        toast.error("Invalid server response");
        return;
      }

      /* ✅ ADMIN-ONLY VALIDATION */
      if (role !== "admin") {
        toast.error("Access denied. Admins only.");
        sessionStorage.removeItem("Token");
        return;
      }

      toast.success("Welcome Admin");

      setUser(user);
      setIsLogin(true);
      setRole(role);

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
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        
        {/* 🌈 Soft Ambient Background */}
        <div className="absolute w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[140px] top-[-120px] left-[-120px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-100 rounded-full blur-[120px] bottom-[-100px] right-[-100px]" />

        {/* 🧊 Glass Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 w-full max-w-md"
        >
          <div
            className="backdrop-blur-xl bg-white/80 border border-slate-200
                       shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                       rounded-3xl p-10"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg">
                  <GraduationCap size={28} />
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-slate-800">
                Admin Login
              </h1>

              <p className="text-slate-500 text-sm mt-2">
                Sign in to access the administration panel
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              onReset={handleClearForm}
              className="space-y-6"
            >
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             outline-none transition-all bg-white"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-sm font-medium text-slate-700">
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
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             outline-none transition-all bg-white"
                />

                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[46px] cursor-pointer
                             text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgetPasswordModelOpen(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="reset"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl border border-slate-200
                             text-slate-600 hover:bg-slate-50 transition"
                >
                  Clear
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white
                             font-medium shadow-lg hover:bg-indigo-700 transition
                             flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <p className="text-center text-slate-400 mt-6 text-xs">
            © 2026 Administration System
          </p>
        </motion.div>
      </div>

      {/* Forget Password Modal */}
      {isForgetPasswordModelOpen && (
        <ForgetPasswordModal
          onClose={() => setIsForgetPasswordModelOpen(false)}
        />
      )}
    </>
  );
};

export default Login;
