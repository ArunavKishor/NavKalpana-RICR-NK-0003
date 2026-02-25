import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { format } from "date-fns";
import { FaClipboardList, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const AssignmentManagement = () => {
  const [filter, setFilter] = useState("All");
  const [assignments, setAssignments] = useState([]);
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Fetch all published assignments
      const [assignmentsRes, dashboardRes] = await Promise.all([
        api.get("/api/assessments?type=assignment&status=published"),
        api.get("/api/students/me/dashboard"),
      ]);

      const allAssignments =
        assignmentsRes.data?.data?.assessments || [];

      // Get IDs the student has already submitted from the dashboard
      const pendingFromDashboard =
        dashboardRes.data?.data?.pendingAssignments || [];
      const pendingIds = new Set(
        pendingFromDashboard.map((a) => a._id.toString())
      );

      // Mark assignments as Pending or Submitted based on the dashboard data
      const enriched = allAssignments.map((a) => ({
        ...a,
        computedStatus: pendingIds.has(a._id.toString())
          ? "Pending"
          : "Submitted",
      }));

      setAssignments(enriched);
    } catch (err) {
      console.error("Assignment Fetch Error:", err);
      setError("Failed to load assignments.");
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAssignments =
    filter === "All"
      ? assignments
      : assignments.filter((a) => a.computedStatus === filter);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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
        {["All", "Pending", "Submitted"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${filter === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border hover:bg-blue-50 hover:text-blue-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border">
              <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No assignments found</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {assignment.title}
                  </h3>
                  <span className="ml-2 shrink-0 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    Assignment
                  </span>
                </div>

                {assignment.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <p className="text-sm text-gray-500 mb-1">
                  Total Marks:{" "}
                  <span className="font-medium text-gray-700">
                    {assignment.totalMarks}
                  </span>
                </p>

                {assignment.dueDate && (
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <FaExclamationCircle className="text-red-400 text-xs" />
                    Due:{" "}
                    <span className="font-medium text-gray-700">
                      {format(new Date(assignment.dueDate), "dd MMM yyyy")}
                    </span>
                  </p>
                )}

                {assignment.batch?.name && (
                  <p className="text-sm text-gray-500 mb-4">
                    Batch:{" "}
                    <span className="font-medium text-gray-700">
                      {assignment.batch.name}
                    </span>
                  </p>
                )}

                <span
                  className={`inline-block px-4 py-1 text-xs font-semibold rounded-full ${statusColor(
                    assignment.computedStatus
                  )}`}
                >
                  {assignment.computedStatus}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
