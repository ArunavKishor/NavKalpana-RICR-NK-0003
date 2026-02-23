import React, { useState, useEffect } from "react";
import { FaClipboardList, FaCalendarCheck, FaBook, FaExclamationCircle } from "react-icons/fa";
import api from "../../config/api";
import { format } from "date-fns";

const StudentDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        setLoading(true);
        // Assuming your auth context sets the token automatically in Api client
        const response = await api.get("/api/students/me/dashboard");
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Could not load dashboard information.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardContent();
  }, []);

  const hours = new Date().getHours();
  let greeting = "Hello";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  if (loading) return <div className="p-6">Loading your dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!dashboardData) return null;

  const { student, pendingAssignments, upcomingQuizzes } = dashboardData;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {greeting}, {student.name} 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Your Enrollment ID: <strong>{student.enrollmentId}</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">

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
                {student.pendingAssignmentsCount}
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
                {student.upcomingQuizzesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grids */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Active Assignments Panel */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-yellow-500" /> Pending Assignments
          </h2>
          {pendingAssignments.length === 0 ? (
            <p className="text-gray-500 text-sm">You have no pending assignments right now.</p>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map(assignment => (
                <div key={assignment._id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                      <p className="text-sm text-gray-500">Marks: {assignment.totalMarks}</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium flex gap-1 items-center">
                      <FaExclamationCircle />
                      Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Quizzes Panel */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBook className="text-green-500" /> Upcoming Quizzes
          </h2>
          {upcomingQuizzes.length === 0 ? (
            <p className="text-gray-500 text-sm">You have no upcoming quizzes lined up.</p>
          ) : (
            <div className="space-y-4">
              {upcomingQuizzes.map(quiz => (
                <div key={quiz._id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                      <p className="text-sm text-gray-500">Marks: {quiz.totalMarks}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium flex gap-1 items-center">
                      <FaCalendarCheck />
                      Due {format(new Date(quiz.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboardHome;
