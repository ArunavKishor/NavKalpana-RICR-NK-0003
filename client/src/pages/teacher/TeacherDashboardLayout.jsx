import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherDashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

const TeacherDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar (Fixed) */}
      <TeacherSidebar isOpen={isSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Header (Sticky) */}
        <DashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
