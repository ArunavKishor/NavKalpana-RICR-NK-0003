import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Batch Management", href: "/admin/batches" },
  { icon: FileText, label: "Assessments", href: "/admin/assessments" },
  { icon: GraduationCap, label: "Students", href: "/admin/students" },
  { icon: Users, label: "Teachers", href: "/admin/teachers" },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : -285 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 18,
        mass: 0.8,
      }}
      className={cn(
        "fixed top-3 left-3 z-50 h-[calc(100vh-24px)] w-64 rounded-3xl",
        "bg-card border border-border shadow-premium flex flex-col overflow-hidden",
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
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
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
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </motion.div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }}
              transition={{ type: "tween", duration: 0.18 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                  "transition-colors duration-200 group",
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="adminSidebarActive"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "var(--primary)" }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 20,
                    }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className={cn(
                    "relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
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

                {/* Arrow Animation */}
                <ChevronRight
                  className={cn(
                    "relative z-10 w-4 h-4 transition-all duration-200",
                    isActive
                      ? "text-white opacity-100"
                      : "text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0",
                  )}
                />
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
