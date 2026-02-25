import React from "react";
import { ChevronDown, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

const DashboardHeader = ({ toggleSidebar }) => {
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
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      {/* Left — Greeting */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-900"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <div className="truncate">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
            {greeting},{" "}
            <span className="text-blue-600 capitalize">
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
                  user?.fullName || "Admin"
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
