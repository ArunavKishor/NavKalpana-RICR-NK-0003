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
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-500 ease-in-out ${scrolled
        ? "bg-black/30 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-full py-2 mx-4 md:mx-auto"
        : "bg-transparent py-2"
        } flex items-center justify-between`}>

        <Link to="/" className="flex items-center gap-2 z-50">
          <motion.img
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            src={tranparentLogo}
            alt="Logo"
            className={`w-auto object-contain transition-all duration-500 ease-in-out ${scrolled ? 'h-10' : 'h-14'}`}
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
            className="group relative px-6 py-2.5 rounded-full font-semibold text-white overflow-hidden
                       bg-white/5 border border-white/20 backdrop-blur-md shadow-lg transition-all duration-300
                       hover:border-white/40"
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
          className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-4 right-4 mt-2 origin-top rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
                className="w-full py-3 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-violet-600 to-orange-500 shadow-lg hover:shadow-xl transition-all"
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
