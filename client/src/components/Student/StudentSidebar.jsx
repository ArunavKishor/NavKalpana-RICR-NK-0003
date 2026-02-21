import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBook,
  FaCalendarCheck,
  FaUser,
} from "react-icons/fa";

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
    <div className="w-64 min-h-screen bg-white border-r border-slate-200 shadow-sm flex flex-col p-4">

      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/student-dashboard"
              ? location.pathname === "/student-dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
              ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {/* Orange Active Line */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-lg"></span>
              )}

              <item.icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />

              <span className="text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentSidebar;