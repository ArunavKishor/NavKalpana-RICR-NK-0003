import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../Student/StudentSidebar";
import StudentHeader from "../Student/StudentHeader";

const StudentDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar isOpen={isSidebarOpen} />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "ml-0"
          }`}
      >
        <StudentHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
