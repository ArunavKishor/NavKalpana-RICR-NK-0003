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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const StudentSidebar = ({ isOpen }) => {
  const location = useLocation();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student-dashboard" },
    {
      icon: FileText,
      label: "Assignments",
      href: "/student-dashboard/assignments",
      badge: 3,
    },
    { icon: BookOpen, label: "Quizzes", href: "/student-dashboard/quizzes" },
    { icon: Calendar, label: "Attendance", href: "/student-dashboard/attendance" },
    { icon: User, label: "Profile", href: "/student-dashboard/profile" },
  ];

  return (
    <motion.aside
      initial={{ x: -120 }}
      animate={{ x: isOpen ? 0 : -280 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className={cn(
        "fixed top-3 left-3 z-50 h-[calc(100vh-24px)] w-64 rounded-3xl",
        "backdrop-blur-xl bg-gradient-to-b from-white to-slate-50",
        "border border-slate-200 shadow-sm flex flex-col overflow-hidden"
      )}
    >
      {/* LOGO */}
      <div className="h-20 px-5 flex items-center border-b border-slate-100">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
            <GraduationCap className="text-white w-5 h-5" />
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-slate-900 tracking-wide">
              MindRise
            </p>
            <p className="text-xs text-slate-500">
              Student Portal
            </p>
          </div>
        </motion.div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/student-dashboard"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarStudent"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div
                  className={cn(
                    "relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    isActive
                      ? "bg-white/15"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-slate-500"
                    )}
                  />
                </div>

                <span className="relative z-10 flex-1">
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    className={cn(
                      "relative z-10 text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-600"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default StudentSidebar;