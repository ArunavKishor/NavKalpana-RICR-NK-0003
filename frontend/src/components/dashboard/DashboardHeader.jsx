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

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/teacher-dashboard/batches")) return "Class Batches";
    if (path.includes("/teacher-dashboard/assessments")) return "Assessments Dashboard";
    if (path.includes("/teacher-dashboard/students")) return "Student Management";
    if (path.includes("/teacher-dashboard/support")) return "Student Support";
    if (path.includes("/teacher-dashboard/attendance")) return "Attendance Hub";
    return "Portal Dashboard";
  };

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
          api.get("/api/batches", { params: { search: searchQuery } }).catch(() => ({ data: { data: { batches: [] } } })),
          api.get("/api/students", { params: { search: searchQuery } }).catch(() => ({ data: { data: { students: [] } } })),
        ]);

        const batches = batchesRes?.data?.data?.batches || [];
        const students = studentsRes?.data?.data?.students || [];

        setSearchResults([
          ...batches.slice(0, 3).map((b) => ({ type: "batch", ...b })),
          ...students.slice(0, 3).map((s) => ({ type: "student", ...s })),
        ].slice(0, 6));
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResult = (result) => {
    if (result.type === "batch") {
      navigate(`/teacher-dashboard/batches`); 
    } else if (result.type === "student") {
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
      {/* Left Section */}
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

      {/* Center Search - Mobile Expandable */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 h-20 bg-white z-50 flex items-center px-4 gap-4 md:hidden"
          >
            <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <input 
              autoFocus
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300"
            />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
            
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-2xl p-2 flex flex-col gap-1 max-h-[60vh] overflow-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResult(result)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <div className={`p-2 rounded-lg ${result.type === 'batch' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                       {result.type === 'batch' ? <Loader2 size={14}/> : <Loader2 size={14}/> /* Placeholder icon */}
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-slate-900 text-sm">{result.type === 'batch' ? result.name : result.user?.fullName}</p>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{result.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-64 lg:w-96 hidden md:block" ref={searchRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-rose-500 transition-colors">
          <Search className="w-4 h-4" />
        </div>
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        )}
        <Input
          placeholder="Global smart search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowResults(true)}
          className="pl-12 pr-10 h-11 bg-slate-50/50 border-slate-200/70 focus-visible:ring-rose-500 rounded-2xl font-medium placeholder:text-slate-400 transition-all focus:bg-white focus:shadow-sm"
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
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl transition-all flex items-center gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${result.type === 'batch' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                   {result.type === 'batch' ? <Search size={18}/> : <Search size={18}/>}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {result.type === "batch" ? result.name : result.user?.fullName}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {result.type === "batch" ? result.course : result.enrollmentId}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(true)} className="md:hidden text-slate-500">
          <Search size={20} />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100"
          >
            <Bell className="w-5 h-5" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-white text-sm">Alert Center</h3>
                  <button
                    onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                    className="text-[10px] font-black text-rose-400 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Bell className="mx-auto w-10 h-10 opacity-20 mb-3" />
                      <p className="text-xs font-bold uppercase tracking-widest">No Alerts</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
                          setShowNotifications(false);
                        }}
                        className={`w-full text-left p-4 rounded-2xl mb-1 transition-all group ${!notif.read ? "bg-rose-50/50" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-sm ${!notif.read ? "font-black text-slate-900" : "font-medium text-slate-600"}`}>
                            {notif.message}
                          </p>
                          {!notif.read && <span className="w-2 h-2 bg-rose-600 rounded-full mt-1.5 shrink-0"></span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 group cursor-pointer transition-all">
              <Avatar className="h-10 w-10 border-2 border-white shadow-md group-hover:shadow-rose-100 transition-all">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.role || "User"}&background=f43f5e&color=fff&bold=true`} />
                <AvatarFallback className="bg-rose-500 text-white font-black text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-sm font-black text-slate-900">{user?.fullName?.split(" ")[0] || "User"}</p>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure session</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-all" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl border-slate-200 shadow-2xl mt-3">
            <DropdownMenuLabel className="px-4 py-3 flex flex-col">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Authenticated as</span>
               <span className="text-sm font-black text-slate-900">{user?.fullName}</span>
               <span className="text-[10px] font-bold text-rose-500 uppercase">{user?.role} Access</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 mx-2" />
            <DropdownMenuItem className="p-3 cursor-pointer rounded-2xl font-bold flex items-center gap-3 text-slate-600 focus:text-rose-600 focus:bg-rose-50 transition-all" onClick={() => navigate("/teacher-dashboard/profile")}>
               <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer rounded-2xl font-black flex items-center gap-3 text-rose-600 focus:text-white focus:bg-rose-600 transition-all" onClick={handleLogout}>
              Logout System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
  );
};

export default DashboardHeader;
