import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaClock } from "react-icons/fa";

const Quizzes = () => {
  const navigate = useNavigate();

  const [quizzes] = useState([
    {
      id: 1,
      title: "React Fundamentals Quiz",
      lesson: "React Basics",
      totalQuestions: 10,
      timeLimit: "15 min",
      status: "Completed",
      score: "8/10",
      attemptDate: "18 Feb 2026",
    },
    {
      id: 2,
      title: "JavaScript ES6 Quiz",
      lesson: "JavaScript Advanced",
      totalQuestions: 15,
      timeLimit: "20 min",
      status: "Completed",
      score: "12/15",
      attemptDate: "16 Feb 2026",
    },
    {
      id: 3,
      title: "HTML & CSS Quiz",
      lesson: "Web Basics",
      totalQuestions: 12,
      timeLimit: "15 min",
      status: "Available",
    },
  ]);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
            <FaClipboardList className="text-orange-500" />
            Quizzes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Attempt and track your quiz performance
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5"
            >
              {/* Top */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  {quiz.title}
                </h3>

                {/* Same Badge Color for All */}
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-600">
                  {quiz.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                {quiz.lesson}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FaClipboardList className="text-orange-500 text-xs" />
                  {quiz.totalQuestions} Questions
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FaClock className="text-orange-500 text-xs" />
                  {quiz.timeLimit}
                </div>
              </div>

              {/* Score */}
              {quiz.status === "Completed" && (
                <div className="bg-slate-100 rounded-lg p-3 mb-4 text-xs">
                  <p className="font-medium text-slate-700">
                    Score: {quiz.score}
                  </p>
                  <p className="text-slate-500">
                    {quiz.attemptDate}
                  </p>
                </div>
              )}

              {/* Same Button Style for All */}
              <button
                onClick={() =>
                  navigate(`/student-dashboard/quizzes/${quiz.id}`)
                }
                className="w-full py-2 text-xs rounded-lg font-medium transition-all bg-slate-900 text-white hover:bg-slate-800"
              >
                {quiz.status === "Completed"
                  ? "View Results"
                  : "Start Quiz"}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Quizzes;