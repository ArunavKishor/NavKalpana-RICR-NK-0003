import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CheckCircle,
  MessageSquare,
  BarChart3,
  User,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/Api";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher-dashboard" },
  {
    icon: BookOpen,
    label: "Batch Management",
    href: "/teacher-dashboard/batches",
  },
  {
    icon: Users,
    label: "Student Management",
    href: "/teacher-dashboard/students",
  },
  {
    icon: FileText,
    label: "Assessments",
    href: "/teacher-dashboard/assessments",
  },
  { icon: CheckCircle, label: "Quizzes", href: "/teacher-dashboard/quizzes" },
  { icon: BarChart3, label: "Analytics", href: "/teacher-dashboard/analytics" },
  {
    icon: MessageSquare,
    label: "Support",
    href: "/teacher-dashboard/support",
  },
  { icon: User, label: "My Account", href: "/teacher-dashboard/account" },
];

const TeacherSidebar = ({ isOpen }) => {
  const location = useLocation();
  const [openSupportCount, setOpenSupportCount] = useState(0);

  useEffect(() => {
    const fetchOpenCount = async () => {
      try {
        const { data } = await api.get("/api/support", {
          params: { status: "open" },
        });
        const count = (data?.data?.requests || []).length;
        setOpenSupportCount(count);
      } catch {
        // silently fail — badge simply won't show
      }
    };
    fetchOpenCount();
  }, []);

  const sidebarItems = baseNavItems.map((item) =>
    item.href === "/teacher-dashboard/support" && openSupportCount > 0
      ? { ...item, badge: openSupportCount }
      : item,
  );

  return (
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : -285 }}
      transition={{
        type: "spring",
        stiffness: 95,
        damping: 16,
        mass: 0.9,
      }}
      className={cn(
        "fixed top-3 left-3 z-40 h-[calc(100vh-24px)] w-64 rounded-3xl",
        "bg-card/90 backdrop-blur-xl",
        "border border-border shadow-premium",
        "flex flex-col overflow-hidden",
      )}
    >
      {/* LOGO */}
      <div className="h-20 px-5 flex items-center border-b border-border">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          {/* MR Text Logo */}
          <motion.div
            whileHover={{ rotate: -3 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <span
              className="text-sm font-bold tracking-tight select-none"
              style={{
                color: "var(--primary-foreground)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              MR
            </span>
          </motion.div>

          <div className="leading-tight">
            <p
              className="font-semibold text-foreground tracking-wide"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              MindRise
            </p>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
          </div>
        </motion.div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/teacher-dashboard"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 2 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                  "transition-all duration-200 group",
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="teacherActive"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "var(--primary)" }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 22,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 w-9 h-9 rounded-lg flex items-center justify-center",
                    "transition-all duration-200",
                    isActive
                      ? "bg-white/20"
                      : "bg-secondary group-hover:bg-secondary/80",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isActive ? "text-white" : "text-muted-foreground",
                    )}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "relative z-10 flex-1 transition-colors duration-200",
                    isActive ? "text-white" : "text-foreground",
                  )}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative z-10 text-xs px-2 py-0.5 rounded-full font-semibold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-700",
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
