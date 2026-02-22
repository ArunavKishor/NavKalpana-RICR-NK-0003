import React, { useState } from "react";

const AssignmentManagement = () => {
  const [filter, setFilter] = useState("All");

  const assignments = [
    {
      id: 1,
      title: "React Project",
      lesson: "React Basics",
      deadline: "25 Feb 2026",
      status: "Pending",
      marks: null,
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      lesson: "HTML Module",
      deadline: "15 Feb 2026",
      status: "Evaluated",
      marks: "85/100",
    },
    {
      id: 3,
      title: "JavaScript DOM Task",
      lesson: "JS Advanced",
      deadline: "20 Feb 2026",
      status: "Submitted",
      marks: null,
    },
  ];

  const filteredAssignments =
    filter === "All"
      ? assignments
      : assignments.filter((a) => a.status === filter);

  const statusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Submitted":
        return "bg-blue-100 text-blue-700";
      case "Evaluated":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Assignment Management
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track and manage your assignments
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["All", "Pending", "Submitted", "Evaluated"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border hover:bg-blue-50 hover:text-blue-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {assignment.title}
            </h3>

            <p className="text-sm text-gray-500 mb-1">
              Lesson: <span className="font-medium text-gray-700">{assignment.lesson}</span>
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Deadline: <span className="font-medium text-gray-700">{assignment.deadline}</span>
            </p>

            {/* Status */}
            <span
              className={`inline-block px-4 py-1 text-xs font-semibold rounded-full ${statusColor(
                assignment.status
              )}`}
            >
              {assignment.status}
            </span>

            {/* Marks */}
            {assignment.marks && (
              <p className="mt-4 text-sm font-semibold text-green-600">
                Marks: {assignment.marks}
              </p>
            )}

            {/* Submit Button */}
            {assignment.status === "Pending" && (
              <button className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200">
                Submit Assignment
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentManagement;