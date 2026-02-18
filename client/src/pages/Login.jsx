import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../config/Api";
import { useAuth } from "../context/AuthContext";
import ForgetPasswordModal from "../components/publicModals/ForgetPasswordModal";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

const roleRoutes = {
  admin: "/admin-dashboard",
  student: "/student-dashboard",
  manager: "/resturant-dashboard",
  customer: "/user-dashboard",
};

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      toast.success(res.data.message);

      const user = res.data.data;
      const role = user?.role;

      setUser(user);
      setIsLogin(true);
      setRole(role);
      sessionStorage.setItem("CravingUser", JSON.stringify(user));

      handleClearForm();

      const nextRoute = roleRoutes[role];
      if (nextRoute) {
        navigate(nextRoute);
      } else {
        toast.error("Unknown role. Please contact support.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unknown Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center  from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8">

            <h1 className="text-3xl font-bold text-white text-center mb-6">
              Welcome Back 👋
            </h1>

            <form
              onSubmit={handleSubmit}
              onReset={handleClearForm}
              className="space-y-5"
            >
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder=" "
                  className="peer w-full px-4 pt-5 pb-2 rounded-lg bg-white/90 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:bg-gray-200"
                />
                <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all 
                  peer-placeholder-shown:top-4 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-gray-400 
                  peer-focus:top-2 
                  peer-focus:text-sm 
                  peer-focus:text-indigo-600">
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder=" "
                  className="peer w-full px-4 pt-5 pb-2 rounded-lg bg-white/90 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:bg-gray-200"
                />
                <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all 
                  peer-placeholder-shown:top-4 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-gray-400 
                  peer-focus:top-2 
                  peer-focus:text-sm 
                  peer-focus:text-indigo-600">
                  Password
                </label>

                {/* Eye Toggle */}
                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-indigo-600 transition"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </div>
              </div>

              {/* Forget Password */}
              <div className="text-right">
                <button
                  className="text-sm text-white hover:text-yellow-200 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgetPasswordModelOpen(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="reset"
                  disabled={isLoading}
                  className="flex-1 bg-white/30 hover:bg-white/40 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-white/80 mt-6 text-sm">
            We respect your privacy 🔒
          </p>
        </div>
      </div>

      {isForgetPasswordModelOpen && (
        <ForgetPasswordModal
          onClose={() => setIsForgetPasswordModelOpen(false)}
        />
      )}
    </>
  );
};

export default Login;
