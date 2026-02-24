import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, ChevronDown, Menu, Loader2, X } from "lucide-react";
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
import api from "@/config/Api";
import { motion, AnimatePresence } from "framer-motion";

const DashboardHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  // Page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/teacher-dashboard/batches")) return "Class Batches";
    if (path.includes("/teacher-dashboard/assessments"))
      return "Assessments Dashboard";
    if (path.includes("/teacher-dashboard/students"))
      return "Student Management";
    if (path.includes("/teacher-dashboard/support"))
      return "Student Support";
    if (path.includes("/teacher-dashboard/attendance"))
      return "Attendance Hub";
    return "Portal Dashboard";
  };

  // 🔎 Search logic
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
          ].slice(0, 6)
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

  // Click outside handler
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResult = (result) => {
    if (result.type === "batch") {
      navigate(`/teacher-dashboard/batches`);
    } else {
      navigate(`/teacher-dashboard/students`);
    }

    setSearchQuery("");
    setShowResults(false);
    setIsMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300">
      
      {/* LEFT */}
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/50 rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block truncate">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* CENTER SEARCH */}
      <div className="relative w-64 lg:w-96 hidden md:block" ref={searchRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        )}

        <Input
          placeholder="Global smart search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10 h-11 bg-slate-50 border-slate-200 rounded-2xl"
        />

        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden p-2"
          >
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSearchResult(result)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-4"
              >
                <Search size={18} />
                <div>
                  <h4 className="font-black text-sm">
                    {result.type === "batch"
                      ? result.name
                      : result.user?.fullName}
                  </h4>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:text-rose-600"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${
                  user?.fullName || "User"
                }`}
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/teacher-dashboard/profile")}
            >
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Logout System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;