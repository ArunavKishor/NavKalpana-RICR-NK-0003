import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, GraduationCap, LifeBuoy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Batch Management", href: "/admin/batches" },
    { icon: FileText, label: "Assessment Management", href: "/admin/assessments" },
    { icon: GraduationCap, label: "Student Management", href: "/admin/students" },
    { icon: LifeBuoy, label: "Support Requests", href: "/admin/support" },
];

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

   return (
    <>
        {/* Overlay for Mobile */}
        <div
            className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 lg:hidden ${
                isOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setIsOpen(false)}
        />

        <div
            className={`
                fixed top-0 left-0 z-40
                h-screen
                w-64 sm:w-72 lg:w-64
                bg-white text-slate-800
                flex flex-col
                border-r border-slate-200 shadow-sm
                transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
            `}
        >
            {/* Logo Area */}
            <div className="h-16 sm:h-20 flex items-center gap-3 px-4 sm:px-6 border-b border-slate-100">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-wide text-slate-900">
                    Academia
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                                isActive
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive
                                        ? "text-white"
                                        : "text-slate-400 group-hover:text-slate-900"
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* System Status */}
            <div className="p-3 sm:p-4 border-t border-slate-100">
                <div className="px-2 sm:px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        System Status
                    </p>
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        Live Services
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default Sidebar;
