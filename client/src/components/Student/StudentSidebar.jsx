import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBook,
  FaCalendarCheck,
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";

const StudentSidebar = () => {
  const location = useLocation();

  const sidebarItems = [
    { icon: FaTachometerAlt, label: "Dashboard", href: "/student-dashboard" },
    { icon: FaClipboardList, label: "Assignments", href: "/student-dashboard/assignments" },
    { icon: FaBook, label: "Quizzes", href: "/student-dashboard/quizzes" },
    { icon: FaCalendarCheck, label: "Attendance", href: "/student-dashboard/attendance" },
    { icon: FaUser, label: "Profile", href: "/student-dashboard/profile" },
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r border-slate-200 shadow-sm flex flex-col">

      {/* Header / Logo Area */}
      <div className="h-20 px-5 flex items-center border-b border-slate-100">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-40 group-hover:opacity-70 transition duration-300"></div>

            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FaUser className="text-white w-4 h-4" />
            </div>
          </motion.div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 tracking-wide">
              Student Panel
            </span>
            <span className="text-xs text-slate-400">
              Learning Dashboard
            </span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/student-dashboard"
              ? location.pathname === "/student-dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink
                to={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-lg"
                  />
                )}

                <item.icon
                  className={`w-5 h-5 transition-colors
                  ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-900"
                  }`}
                />

                <span className="text-sm truncate">{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentSidebar;