import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../teacher/TeacherSidebar";
import "./TeacherDashboardLayout.css";

const TeacherDashboardLayout = () => {
  return (
    <div className="teacher-dashboard-layout">
      <TeacherSidebar />
      <main className="teacher-dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherDashboardLayout;
