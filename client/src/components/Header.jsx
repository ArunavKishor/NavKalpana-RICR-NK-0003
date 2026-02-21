import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import tranparentLogo from "../assets/tranparentLogo.png";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Completely remove header after login
  if (isLogin) return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4 pt-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            src={tranparentLogo}
            alt="Logo"
            className="h-9 sm:h-11 lg:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-medium text-white/80">
            {/* Put any navigation links here if needed */}
          </nav>

          {/* Enhanced Login Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="relative px-5 lg:px-6 py-2 rounded-xl text-sm lg:text-base font-semibold text-white overflow-hidden
                       bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 shadow-lg"
          >
            {/* Button Gradient Hover Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full -z-10" />

            {/* Shine effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute inset-0 bg-white/20 skew-x-12 w-1/2 -z-10"
            />

            <span className="relative z-10 tracking-wide">Login</span>
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-1"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg"
          >
            <div className="flex flex-col p-4 gap-3">
              <button
                onClick={() => {
                  navigate("/login");
                  setOpen(false);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-medium
                           bg-gradient-to-r from-orange-500 to-pink-500 text-white"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
