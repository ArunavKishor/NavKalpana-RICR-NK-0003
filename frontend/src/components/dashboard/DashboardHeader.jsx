import React from "react";
import { ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getGreeting } from "@/lib/utils";
import { MobileSidebar } from "./Sidebar";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "Staff";

  return (
    <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300">
      {/* Left — Greeting & Mobile Menu */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <MobileSidebar />

        <div className="truncate">
          <h2 className="text-lg sm:text-2xl font-black text-[#0F4C5C] tracking-tight truncate">
            {greeting},{" "}
            <span className="text-primary capitalize opacity-80">
              {user?.fullName?.split(" ")[0] || user?.role || "User"}
            </span>
          </h2>
        </div>
      </div>

      {/* Right — Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.fullName || "Administrator"}
              </p>
              <p className="text-xs text-slate-500 font-medium">{roleLabel}</p>
            </div>

            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm cursor-pointer">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.fullName || "Admin",
                )}&background=2563eb&color=fff`}
                alt="Profile"
              />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-rose-600 cursor-pointer focus:text-rose-700 focus:bg-rose-50"
            onClick={handleLogout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;
