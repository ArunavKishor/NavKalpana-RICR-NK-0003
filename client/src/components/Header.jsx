import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import tranparentLogo from "../assets/tranparentLogo.png";

const Header = () => {
  const { user, isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ FIX

  const handleNavigate = () => {
    switch (role) {
      case "partner":
        navigate("/rider-dashboard");
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

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-xl"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            src={tranparentLogo}
            alt="NavKalpana Logo"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <Link
                to={item.path}
                className="text-black font-medium tracking-wide text-sm lg:text-base"
              >
                {item.name}
              </Link>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
            </motion.div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Auth Button */}
          {isLogin ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={handleNavigate}
              className="cursor-pointer bg-white/20 text-white px-4 sm:px-5 py-2 rounded-xl backdrop-blur-md border border-white/30 hover:bg-white/30 transition text-sm sm:text-base whitespace-nowrap"
            >
              {user?.fullName || user?.name || "Dashboard"}
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              <span className="relative z-10">Login</span>
              <span className="absolute inset-0 bg-white opacity-10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/20 px-6 py-4 space-y-4"
          >
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block text-black font-medium text-base"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;