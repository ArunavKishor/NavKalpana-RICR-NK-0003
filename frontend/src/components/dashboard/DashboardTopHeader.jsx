import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Menu } from "lucide-react";
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
import { getGreeting } from "@/lib/utils";
import api from "@/config/Api";

const DashboardHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    students: [],
    batches: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchContainerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setShowDropdown(false);
      setSearchResults({ students: [], batches: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [studentsRes, batchesRes] = await Promise.all([
          api.get(
            `/api/students?search=${encodeURIComponent(searchQuery)}&limit=5`,
          ),
          api.get(
            `/api/batches?search=${encodeURIComponent(searchQuery)}&limit=5`,
          ),
        ]);

        const students = studentsRes.data?.students || studentsRes.data || [];
        const batches = batchesRes.data?.batches || batchesRes.data || [];

        setSearchResults({
          students: Array.isArray(students) ? students : [],
          batches: Array.isArray(batches) ? batches : [],
        });
        setShowDropdown(true);
      } catch (err) {
        setSearchResults({ students: [], batches: [] });
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStudentClick = () => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate("/teacher-dashboard/students");
  };

  const handleBatchClick = () => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate("/teacher-dashboard/batches");
  };

  const hasResults =
    searchResults.students.length > 0 || searchResults.batches.length > 0;

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
            <span className="text-blue-600">
              {user?.fullName?.split(" ")[0] || "Admin"}
            </span>
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search Bar */}
        <div
          ref={searchContainerRef}
          className="relative w-52 lg:w-80 hidden md:block"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
          <Input
            placeholder="Search students, batches..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.length >= 2) setShowDropdown(true);
            }}
          />

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {searchLoading ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  Searching...
                </div>
              ) : !hasResults ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No results found
                </div>
              ) : (
                <>
                  {/* Students Section */}
                  {searchResults.students.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                        Students
                      </div>
                      {searchResults.students.map((student, idx) => (
                        <button
                          key={student._id || idx}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex flex-col gap-0.5"
                          onClick={handleStudentClick}
                        >
                          <span className="text-sm font-medium text-slate-800">
                            {student.user?.fullName || "Unknown Student"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {student.enrollmentId || ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Batches Section */}
                  {searchResults.batches.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                        Batches
                      </div>
                      {searchResults.batches.map((batch, idx) => (
                        <button
                          key={batch._id || idx}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex flex-col gap-0.5"
                          onClick={handleBatchClick}
                        >
                          <span className="text-sm font-medium text-slate-800">
                            {batch.name || "Unknown Batch"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {batch.course || ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.fullName || "Administrator"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Head of Department
                </p>
              </div>

              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm cursor-pointer">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${user?.fullName || "Admin"}&background=2563eb&color=fff`}
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
