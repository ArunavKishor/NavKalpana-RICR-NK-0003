import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import tranparentLogo from "../assets/tranparentLogo.png";

const Header = () => {
  const { user, isLogin, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => {
    switch (role) {
      case "manager":
        navigate("/resturant-dashboard");
        break;
      case "partner":
        navigate("/rider-dashboard");
        break;
      case "customer":
        navigate("/user-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      default:
        navigate("/");
        break;
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-xl"
    >
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            src={tranparentLogo}
            alt="NavKalpana Logo"
            className="h-12 w-20 object-cover drop-shadow-lg"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {["Home", "Courses", "Contact Us"].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <Link
                to={
                  item === "Home"
                    ? "/"
                    : item === "Courses"
                    ? "/courses"
                    : "/contact"
                }
                className="text-black font-medium tracking-wide"
              >
                {item}
              </Link>

              {/* Animated Underline */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
            </motion.div>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isLogin ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={handleNavigate}
              className="cursor-pointer bg-white/20 text-white px-5 py-2 rounded-xl backdrop-blur-md border border-white/30 hover:bg-white/30 transition"
            >
              {user?.fullName || user?.name || "Dashboard"}
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg"
            >
              <span className="relative z-10">Login</span>

              {/* Shine Effect */}
              <span className="absolute inset-0 bg-white opacity-10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
