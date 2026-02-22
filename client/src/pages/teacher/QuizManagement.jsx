import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { quizService } from "@/utils/quizService";
import CreateQuiz from "@/components/teacher/CreateQuiz";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
    
    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = () => {
      console.log("Storage changed, reloading quizzes");
      loadQuizzes();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadQuizzes = () => {
    try {
      const allQuizzes = quizService.getAllQuizzes();
      console.log("Loaded quizzes:", allQuizzes);
      setQuizzes(allQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error("Failed to load quizzes");
    }
  };

  const handleQuizCreated = (newQuiz) => {
    // Reload quizzes from localStorage to ensure consistency
    const updatedQuizzes = quizService.getAllQuizzes();
    setQuizzes(updatedQuizzes);
    setShowCreateForm(false);
    toast.success("Quiz created and assigned to students!");
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        quizService.deleteQuiz(quizId);
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
        toast.success("Quiz deleted");
      } catch (error) {
        toast.error("Failed to delete quiz");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (showCreateForm) {
    return (
      <CreateQuiz
        onQuizCreated={handleQuizCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Quiz Management</h1>
            <p className="text-slate-600">Create and manage quizzes for your students</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="py-3 px-6 bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <Plus size={20} />
            Create New Quiz
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Quizzes</p>
                <p className="text-3xl font-bold text-slate-900">{quizzes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Quizzes</p>
                <p className="text-3xl font-bold text-green-600">
                  {quizzes.filter((q) => q.status === "assigned").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Questions</p>
                <p className="text-3xl font-bold text-orange-600">
                  {quizzes.reduce((sum, q) => sum + q.questions.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes List */}
        <div>
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Quizzes Created</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first quiz</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                Create First Quiz
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{quiz.title}</h3>
                      <p className="text-sm text-slate-600">
                        {quiz.questions.length} questions • Created by {quiz.assignedBy}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quiz.status === "assigned"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div className="text-slate-600">
                      <span className="font-medium">Questions:</span>{" "}
                      <span className="text-slate-900">{quiz.questions.length}</span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Created:</span>{" "}
                      <span className="text-slate-900 text-xs">
                        {formatDate(quiz.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button className="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg flex items-center justify-center gap-2 transition">
                      <Eye size={18} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
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

export default QuizManagement;
