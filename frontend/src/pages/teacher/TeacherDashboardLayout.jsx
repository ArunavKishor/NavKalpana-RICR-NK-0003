import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherDashboardSidebar";
import TeacherDashboardHeader from "../../components/dashboard/TeacherDashboardHeader";

const TeacherDashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar (Fixed) */}
      <TeacherSidebar isOpen={true} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        {/* Header */}
        <TeacherDashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
