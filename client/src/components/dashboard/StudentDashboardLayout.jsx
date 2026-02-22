import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../Student/StudentSidebar";
import "./StudentDashboardLayout.css";

const StudentDashboardLayout = () => {
  return (
    <div className="student-dashboard-layout">
      <StudentSidebar />
      <main className="student-dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentDashboardLayout;
