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
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-3xl"
            style={{ backgroundColor: "var(--primary)" }}
          />
          {/* Logo box */}
          <motion.div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <span
              className="text-2xl font-bold tracking-tight select-none"
              style={{
                color: "var(--primary-foreground)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              MR
            </span>
          </motion.div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="text-xl font-bold tracking-wide"
            style={{
              color: "var(--foreground)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            MindRise
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Classroom Intelligence Platform
          </p>
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
