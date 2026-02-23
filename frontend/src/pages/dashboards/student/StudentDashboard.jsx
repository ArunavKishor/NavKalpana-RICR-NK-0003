import React from "react";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentTopbar from "../components/student/StudentTopbar";
import StudentKPI from "../components/student/StudentKPI";
import AssignmentTable from "../components/student/AssignmentTable";
import AttendanceSummary from "../components/student/AttendanceSummary";
import "./student.css";

const Studentdashboard = () => {
  return (
    <div className="student-layout">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="student-main">
        
        {/* Topbar */}
        <StudentTopbar />

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <StudentKPI />
          <AssignmentTable />
          <AttendanceSummary />
        </div>

      </div>
    </div>
  );
};

export default Studentdashboard;