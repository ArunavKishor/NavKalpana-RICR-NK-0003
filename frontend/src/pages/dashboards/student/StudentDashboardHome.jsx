import React from "react";
import { FaClipboardList, FaCalendarCheck, FaBook } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { getGreeting } from "@/lib/utils";

const StudentDashboardHome = () => {
  const { user } = useAuth();
  const student = {
    name: user?.fullName || "Student",
    attendance: 82,
    pendingAssignments: 2,
    upcomingQuizzes: 1,
  };

  const greeting = getGreeting();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {greeting}, {student.name} 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Welcome to your student dashboard. Track your academic progress below.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Attendance */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <FaCalendarCheck size={20} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Attendance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {student.attendance}%
              </p>
            </div>
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <FaClipboardList size={20} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Pending Assignments</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {student.pendingAssignments}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <FaBook size={20} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Upcoming Quizzes</h3>
              <p className="text-2xl font-bold text-green-600">
                {student.upcomingQuizzes}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Info Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Quick Overview
        </h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-2">
          <li>Complete your pending assignments before deadline.</li>
          <li>Maintain attendance above 75% to stay eligible.</li>
          <li>Prepare for upcoming quizzes.</li>
        </ul>
      </div>

    </div>
  );
};

export default StudentDashboardHome;
