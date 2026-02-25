import React from "react";
import { Bell, Search, ChevronDown, Menu, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getGreeting } from "@/lib/utils";

const DashboardHeader = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const greeting = getGreeting();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAccountClick = () => {
        // Navigate to appropriate account page based on role
        if (user?.role === "teacher") {
            navigate("/teacher-dashboard/account");
        } else {
            // For admin or other roles, can add their account page later
            navigate("/admin/dashboard");
        }
    };

    return (
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">

            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-slate-500 hover:text-slate-900"
                >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                {/* Welcome Message */}
                <div className="truncate">
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
                        {greeting},{" "}
                        <span className="text-blue-600 capitalize">
                            {user?.fullName?.split(" ")[0] || user?.role || "User"}
                        </span>
                    </h2>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-6">

                {/* Search Bar */}
                <div className="relative w-52 lg:w-80 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search students, batches..."
                        className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-full"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">

                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-tight">
                                    {user?.fullName || (user?.role === "teacher" ? "Teacher" : "Administrator")}
                                </p>
                                <p className="text-xs text-slate-500 font-medium capitalize">
                                    {user?.role === "teacher" ? "Faculty" : (user?.role === "admin" ? "Head of Department" : "Staff")}
                                </p>
                            </div>

                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm cursor-pointer">
                                <AvatarImage
                                    src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.role || "User"}&background=2563eb&color=fff`}
                                />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>

                            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {user?.role === "teacher" && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleAccountClick}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            className="text-rose-600 cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                            onClick={handleLogout}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
