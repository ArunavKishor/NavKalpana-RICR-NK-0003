import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const StudentSidebar = () => {
  const location = useLocation();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student-dashboard" },
    { icon: FileText, label: "Assignments", href: "/student-dashboard/assignments" },
    { icon: BookOpen, label: "Quizzes", href: "/student-dashboard/quizzes" },
    { icon: Calendar, label: "Attendance", href: "/student-dashboard/attendance" },
    { icon: User, label: "Profile", href: "/student-dashboard/profile" },
  ];

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-white text-slate-800 flex flex-col",
        "border-r border-slate-200 shadow-sm",
        "w-64 sm:w-64",
        "overflow-y-auto",
        "transition-all duration-300"
      )}
    >
      {/* Logo */}
      <div className="h-16 sm:h-20 px-4 sm:px-5 flex items-center border-b border-slate-100">
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-blue-500 via-cyan-500 to-teal-500 blur-lg opacity-40 group-hover:opacity-80 transition duration-300"></div>

            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-semibold text-slate-900 tracking-wide">
              MindRise
            </span>
            <span className="text-xs text-slate-400">
              Student Portal
            </span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-4 sm:py-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/student-dashboard"
              ? location.pathname === "/student-dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicatorStudent"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-lg"
                  />
                )}

                <item.icon
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-900"
                  )}
                />

                <span className="text-sm truncate">
                  {item.label}
                </span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default StudentSidebar;
