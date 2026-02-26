import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherDashboardSidebar";
import TeacherDashboardHeader from "../../components/dashboard/TeacherDashboardHeader";

const TeacherDashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans">
      {/* Sidebar (Fixed on Desktop) */}
      <TeacherSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-72 transition-all duration-300">
        {/* Header */}
        <TeacherDashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
