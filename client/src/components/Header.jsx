import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import tranparentLogo from "../assets/tranparentLogo.png";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ Completely remove header after login
  if (isLogin) return null;

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250 }}
            src={tranparentLogo}
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Login Button */}
        <div className="hidden md:flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="relative px-6 py-2 rounded-xl font-semibold text-white overflow-hidden
                       bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 shadow-lg"
          >
            <span className="relative z-10">Login</span>

            <motion.span
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-white/20 skew-x-12"
            />
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10"
          >
            <div className="flex flex-col p-4 gap-3">
              <button
                onClick={() => navigate("/login")}
                className="py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white"
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