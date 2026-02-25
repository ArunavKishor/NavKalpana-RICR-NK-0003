import React, { useState, useEffect } from "react";
import { FaClipboardList, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          "/api/assessments?type=quiz&status=published"
        );
        const data = response.data?.data?.assessments || [];
        setQuizzes(data);
      } catch (err) {
        console.error("Quizzes Fetch Error:", err);
        setError("Failed to load quizzes.");
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading quizzes...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <FaClipboardList className="text-4xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No quizzes available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5"
              >
                {/* Top */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <span className="ml-2 shrink-0 px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-600">
                    Quiz
                  </span>
                </div>

                {quiz.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <FaClipboardList className="text-orange-500 text-xs" />
                    Total Marks: {quiz.totalMarks}
                  </div>
                  {quiz.dueDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <FaClock className="text-orange-500 text-xs" />
                      Due: {format(new Date(quiz.dueDate), "dd MMM yyyy")}
                    </div>
                  )}
                  {quiz.batch?.name && (
                    <div className="text-xs text-slate-500">
                      Batch: <span className="font-medium text-slate-700">{quiz.batch.name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    navigate(`/student-dashboard/quizzes/${quiz._id}`)
                  }
                  className="w-full py-2 text-xs rounded-lg font-medium transition-all bg-slate-900 text-white hover:bg-slate-800"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Quizzes;
