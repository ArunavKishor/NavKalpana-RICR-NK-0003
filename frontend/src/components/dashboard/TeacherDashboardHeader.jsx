import React from "react";
import { ChevronDown } from "lucide-react";
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

const TeacherDashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Teacher";

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      {/* Left Section — Greeting */}
      <div className="truncate">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
          {greeting},{" "}
          <span className="text-blue-600">
            {user?.fullName?.split(" ")[0] || "Teacher"}
          </span>
        </h2>
      </div>

      {/* Right Section — Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.fullName || "Teacher"}
              </p>
              <p className="text-xs text-slate-500 font-medium">{roleLabel}</p>
            </div>

            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm cursor-pointer">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${user?.fullName || "Teacher"}&background=2563eb&color=fff`}
              />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/teacher-dashboard/account")}
          >
            Profile
          </DropdownMenuItem>

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

export default TeacherDashboardHeader;
