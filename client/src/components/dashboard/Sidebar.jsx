import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  LifeBuoy,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Batch Management", href: "/admin/batches" },
  { icon: FileText, label: "Assessment Management", href: "/admin/assessments" },
  { icon: GraduationCap, label: "Student Management", href: "/admin/students" },
  { icon: Users, label: "Teacher Management", href: "/admin/teachers" },
  { icon: LifeBuoy, label: "Support Requests", href: "/admin/support" },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -80, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className="h-screen w-64 bg-white text-slate-800 flex flex-col fixed left-0 top-0 z-40
                 border-r border-slate-200 shadow-sm"
    >
      {/* ✅ Animated Logo Area */}
      <div className="h-20 px-5 flex items-center border-b border-slate-100">
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          {/* Floating Gradient Logo */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-40 group-hover:opacity-80 transition duration-300"></div>

            <div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-tr
                         from-indigo-500 via-purple-500 to-pink-500
                         flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="text-white w-5 h-5" />
            </div>
          </motion.div>

          {/* Brand Text */}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-slate-900 tracking-wide">
              MindRise
            </span>
            <span className="text-xs text-slate-400">
              Admin Panel
            </span>
          </div>
        </motion.div>
      </div>

      {/* ✅ Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {/* Active Indicator Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-lg"
                  />
                )}

                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-900"
                  )}
                />

                <span className="text-sm">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
