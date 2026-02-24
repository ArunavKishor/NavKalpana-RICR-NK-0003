import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  BookOpen,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher-dashboard" },
  { icon: BookOpen, label: "Batch Management", href: "/teacher-dashboard/batches" },
  { icon: FileText, label: "Assessments", href: "/teacher-dashboard/assessments" },
  { icon: GraduationCap, label: "Students", href: "/teacher-dashboard/students" },
  { icon: CheckCircle, label: "Quizzes", href: "/teacher-dashboard/quizzes" },
  { icon: MessageSquare, label: "Support", href: "/teacher-dashboard/support", badge: 2 },
];

const TeacherSidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : -285 }}
      transition={{
        type: "spring",
        stiffness: 110,   // softer motion
        damping: 18,      // smoother stop
        mass: 0.8,
      }}
      className={cn(
        "fixed top-3 left-3 z-40 h-[calc(100vh-24px)] w-64 rounded-3xl",
        "bg-gradient-to-b from-white to-slate-50",
        "border border-slate-200 shadow-sm flex flex-col overflow-hidden"
      )}
    >
      {/* LOGO */}
      <div className="h-20 px-5 flex items-center border-b border-slate-100">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <motion.div
            whileHover={{ rotate: -6 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md"
          >
            <GraduationCap className="text-white w-5 h-5" />
          </motion.div>

          <div className="leading-tight">
            <p className="font-semibold text-slate-900 tracking-wide">
              MindRise
            </p>
            <p className="text-xs text-slate-500">
              Teacher Portal
            </p>
          </div>
        </motion.div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/teacher-dashboard"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }} // subtle movement
              transition={{ type: "tween", duration: 0.18 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                  "transition-colors duration-200 group"
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarTeacher"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500"
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 20,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-white/20"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isActive ? "text-white" : "text-slate-500"
                    )}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "relative z-10 flex-1 transition-colors duration-200",
                    isActive ? "text-white" : "text-slate-700"
                  )}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative z-10 text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-600"
                    )}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default TeacherSidebar;