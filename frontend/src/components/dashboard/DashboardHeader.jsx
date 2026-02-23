import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, ChevronDown, Menu, Loader2 } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import api from "@/config/Api";

const DashboardHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "support",
      message: "New support request received",
      timestamp: Date.now(),
      read: false,
    },
    {
      id: 2,
      type: "submission",
      message: "Student submitted assignment",
      timestamp: Date.now() - 3600000,
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  // Global search across batches and students
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const [batchesRes, studentsRes] = await Promise.all([
          api
            .get("/api/batches", { params: { search: searchQuery } })
            .catch(() => ({ data: { data: { batches: [] } } })),
          api
            .get("/api/students", { params: { search: searchQuery } })
            .catch(() => ({ data: { data: { students: [] } } })),
        ]);

        const batches = batchesRes?.data?.data?.batches || [];
        const students = studentsRes?.data?.data?.students || [];

        setSearchResults(
          [
            ...batches.slice(0, 3).map((b) => ({ type: "batch", ...b })),
            ...students.slice(0, 3).map((s) => ({ type: "student", ...s })),
          ].slice(0, 6),
        );
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResult = (result) => {
    if (result.type === "batch") {
      navigate(`/teacher/batch/${result._id}`);
    } else if (result.type === "student") {
      navigate(`/admin/student/${result._id}`);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            Good Morning,{" "}
            <span className="text-blue-600 capitalize">
              {user?.fullName?.split(" ")[0] || user?.role || "User"}
            </span>
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search Bar */}
        <div className="relative w-52 lg:w-80 hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
          )}
          <Input
            placeholder="Search students, batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() =>
              searchQuery.trim() &&
              searchResults.length > 0 &&
              setShowResults(true)
            }
            className="pl-10 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-full"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchResult(result)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {result.type}
                    </span>
                    <span className="text-sm text-slate-900">
                      {result.type === "batch"
                        ? result.name
                        : result.user?.fullName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {result.type === "batch"
                      ? result.course
                      : result.enrollmentId}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
          >
            <Bell className="w-5 h-5" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button
                  onClick={() =>
                    setNotifications(
                      notifications.map((n) => ({ ...n, read: true })),
                    )
                  }
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500">
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        setNotifications(
                          notifications.map((n) =>
                            n.id === notif.id ? { ...n, read: true } : n,
                          ),
                        );
                        setShowNotifications(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0 ${
                        !notif.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notif.read
                              ? "font-semibold text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.fullName ||
                    (user?.role === "teacher" ? "Teacher" : "Administrator")}
                </p>
                <p className="text-xs text-slate-500 font-medium capitalize">
                  {user?.role === "teacher"
                    ? "Faculty"
                    : user?.role === "admin"
                      ? "Head of Department"
                      : "Staff"}
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
