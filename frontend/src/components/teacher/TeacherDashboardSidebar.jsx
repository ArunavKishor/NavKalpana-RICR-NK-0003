import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  BookOpen,
  CheckCircle,
  MessageSquare,
  X,
  ChevronRight,
  LifeBuoy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/teacher-dashboard" },
  {
    icon: BookOpen,
    label: "Batch Hub",
    href: "/teacher-dashboard/batches",
  },
  {
    icon: FileText,
    label: "Grade Hub",
    href: "/teacher-dashboard/assessments",
  },
  {
    icon: CheckCircle,
    label: "Quiz Matrix",
    href: "/teacher-dashboard/quizzes",
  },
  {
    icon: LifeBuoy,
    label: "Support Desk",
    href: "/teacher-dashboard/support",
  },
];

const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: isOpen ? 0 : -280 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className={cn(
        "fixed top-0 left-0 z-50 h-[100dvh] bg-white text-slate-800 flex flex-col",
        "border-r border-slate-100 shadow-2xl lg:shadow-none",
        "w-64 sm:w-72",
        "overflow-hidden",
      )}
    >
      {/* Premium Logo Area */}
      <div className="h-24 px-6 flex items-center justify-between bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer relative z-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <GraduationCap className="text-rose-500 w-6 h-6" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Mind<span className="text-rose-600">Rise</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mt-1.5">
              Teacher Edition
            </span>
          </div>
        </motion.div>

        {/* Close Button Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 hover:bg-slate-100 rounded-2xl transition-all"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5 text-slate-500" />
        </Button>
      </div>

      {/* Modern Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item, idx) => {
          const isActive =
            item.href === "/teacher-dashboard"
              ? location.pathname === "/teacher-dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                  isActive
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "relative z-10 p-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-white/10 group-hover:scale-110"
                      : "bg-slate-100 group-hover:bg-white group-hover:scale-110",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-rose-400" : "text-slate-500",
                    )}
                  />
                </div>
                <span className="relative z-10 font-bold text-[15px] tracking-tight">
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activePillIndicator"
                    className="absolute inset-0 bg-slate-900 rounded-2xl -z-0"
                  />
                )}

                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Status / Footer */}
      <div className="p-4 bg-slate-50/50 m-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">System Online</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              v1.2 Stable
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default TeacherSidebar;
