import React, { useState, useEffect } from "react";
import { quizService } from "@/utils/quizService";
import toast from "react-hot-toast";

const AssignmentManagement = () => {
  const [filter, setFilter] = useState("All");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Static assignments now inside state
  const [staticAssignments, setStaticAssignments] = useState([
    {
      id: 1,
      title: "React Project",
      lesson: "React Basics",
      deadline: "25 Feb 2026",
      status: "Pending",
      marks: null,
      type: "assignment",
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      lesson: "HTML Module",
      deadline: "15 Feb 2026",
      status: "Evaluated",
      marks: "85/100",
      type: "assignment",
    },
    {
      id: 3,
      title: "JavaScript DOM Task",
      lesson: "JS Advanced",
      deadline: "20 Feb 2026",
      status: "Submitted",
      marks: null,
      type: "assignment",
    },
  ]);

  useEffect(() => {
    loadQuizzes();

    const handleStorageChange = () => {
      loadQuizzes();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadQuizzes = () => {
    try {
      setLoading(true);
      const allQuizzes = quizService.getAllQuizzes();

      const quizAssignments = allQuizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        lesson: "Quiz",
        deadline: new Date(quiz.createdAt).toLocaleDateString("en-US"),
        status: "Available",
        marks: null,
        type: "quiz",
        questions: quiz.questions?.length || 0,
      }));

      setQuizzes(quizAssignments);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit Handler
  const handleSubmitAssignment = (id) => {
    const updatedAssignments = staticAssignments.map((assignment) =>
      assignment.id === id
        ? { ...assignment, status: "Submitted" }
        : assignment
    );

    setStaticAssignments(updatedAssignments);
    toast.success("Assignment Submitted Successfully!");
  };

  const assignments = [...staticAssignments, ...quizzes];

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
      case "Available":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
        {["All", "Pending", "Submitted", "Evaluated", "Available"].map((tab) => (
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border">
              <p className="text-gray-500">No assignments found</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {assignment.title}
                  </h3>

                  {assignment.type === "quiz" && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      Quiz
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-1">
                  Lesson:{" "}
                  <span className="font-medium text-gray-700">
                    {assignment.lesson}
                  </span>
                </p>

                <p className="text-sm text-gray-500 mb-4">
                  Deadline:{" "}
                  <span className="font-medium text-gray-700">
                    {assignment.deadline}
                  </span>
                </p>

                {assignment.type === "quiz" && assignment.questions && (
                  <p className="text-sm text-gray-500 mb-4">
                    Questions:{" "}
                    <span className="font-medium text-gray-700">
                      {assignment.questions}
                    </span>
                  </p>
                )}

                <span
                  className={`inline-block px-4 py-1 text-xs font-semibold rounded-full ${statusColor(
                    assignment.status
                  )}`}
                >
                  {assignment.status}
                </span>

                {assignment.marks && (
                  <p className="mt-4 text-sm font-semibold text-green-600">
                    Marks: {assignment.marks}
                  </p>
                )}

                {/* ✅ Submit Button */}
                {assignment.status === "Pending" &&
                  assignment.type === "assignment" && (
                    <button
                      onClick={() =>
                        handleSubmitAssignment(assignment.id)
                      }
                      className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
                    >
                      Submit Assignment
                    </button>
                  )}

                {/* Quiz Button */}
                {assignment.type === "quiz" &&
                  assignment.status === "Available" && (
                    <button className="mt-5 w-full bg-orange-600 text-white py-2 rounded-xl hover:bg-orange-700 transition duration-200">
                      Start Quiz
                    </button>
                  )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;