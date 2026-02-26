import React from "react";
import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      {/* Animated MR Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo Mark */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-32 h-32 rounded-full border-2 border-primary/20"
          />
          {/* Logo container */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <img
              src="/logo.png"
              alt="MindRise Logo"
              className="w-24 h-24 object-contain shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            MindRise
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm font-medium mt-1 text-muted-foreground"
          >
            Classroom Intelligence Platform
          </motion.p>
        </div>

        {/* Loading bar */}
        <div
          className="w-48 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--border)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--primary)" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;
