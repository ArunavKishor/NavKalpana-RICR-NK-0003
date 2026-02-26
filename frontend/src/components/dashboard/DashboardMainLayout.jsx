import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans">
      {/* Sidebar (Fixed on Desktop) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-72 transition-all duration-300 ease-in-out">
        {/* Header (Sticky) */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
