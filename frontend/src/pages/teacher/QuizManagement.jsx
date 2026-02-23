import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Clock,
  Users,
  HelpCircle,
  BarChart3,
  X,
  Activity,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import CreateQuiz from "@/components/teacher/CreateQuiz";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [monitorQuiz, setMonitorQuiz] = useState(null);
  const [monitorData, setMonitorData] = useState({
    submissions: [],
    stats: null,
    loading: true,
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/assessments", {
        params: { type: "quiz" },
      });
      setQuizzes(data?.data?.assessments || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizCreated = () => {
    loadQuizzes();
    setShowCreateForm(false);
    setEditingQuiz(null);
    toast.success("Quiz saved successfully!");
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/api/assessments/${quizId}`);
      toast.success("Quiz deleted");
      loadQuizzes();
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowCreateForm(true);
  };

  const openMonitor = async (quiz) => {
    setMonitorQuiz(quiz);
    setMonitorData({ submissions: [], stats: null, loading: true });
    try {
      const [subsRes, statsRes] = await Promise.all([
        api.get(`/api/assessments/${quiz._id}/submissions`),
        api.get(`/api/assessments/${quiz._id}/statistics`),
      ]);
      setMonitorData({
        submissions: subsRes.data?.data?.submissions || [],
        stats: statsRes.data?.data || null,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to load monitoring data:", err);
      setMonitorData({ submissions: [], stats: null, loading: false });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (showCreateForm) {
    return (
      <CreateQuiz
        onQuizCreated={handleQuizCreated}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingQuiz(null);
        }}
        editingQuiz={editingQuiz}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Quiz Management
            </h1>
            <p className="text-slate-600">
              Create and manage quizzes for your students
            </p>
          </div>
          <button
            onClick={() => {
              setEditingQuiz(null);
              setShowCreateForm(true);
            }}
            className="py-3 px-6 bg-linear-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
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
                <p className="text-slate-600 text-sm font-medium">
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {quizzes.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {quizzes.filter((q) => q.status === "published").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Questions
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {quizzes.reduce(
                    (sum, q) => sum + (q.questions?.length || 0),
                    0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Quizzes List */}
        {!loading && (
          <div>
            {quizzes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
                <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No Quizzes Created
                </h3>
                <p className="text-slate-600 mb-6">
                  Get started by creating your first quiz
                </p>
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
                    key={quiz._id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {quiz.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          quiz.status === "published"
                            ? "bg-green-100 text-green-700"
                            : quiz.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>
                          <strong>{quiz.questions?.length || 0}</strong>{" "}
                          Questions
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          <strong>{quiz.duration || 30}</strong> mins
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>
                          Max <strong>{quiz.attemptLimit || 1}</strong>{" "}
                          attempt(s)
                        </span>
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Marks:</span>{" "}
                        {quiz.totalMarks}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Due:</span>{" "}
                        {formatDate(quiz.dueDate)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => openMonitor(quiz)}
                        className="flex-1 py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Activity size={18} />
                        Monitor
                      </button>
                      <button
                        onClick={() => setPreviewQuiz(quiz)}
                        className="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Eye size={18} />
                        Preview
                      </button>
                      <button
                        onClick={() => handleEditQuiz(quiz)}
                        className="flex-1 py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Pencil size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
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
        )}
      </div>

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewQuiz(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {previewQuiz.title}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {previewQuiz.questions?.length || 0} questions •{" "}
                  {previewQuiz.duration || 30} min • {previewQuiz.totalMarks}{" "}
                  marks
                </p>
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {previewQuiz.questions?.map((q, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900 mb-3">
                    Q{idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options?.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-3 py-2 rounded-lg border text-sm ${
                          oIdx === q.correctAnswer
                            ? "bg-green-50 border-green-300 text-green-800 font-medium"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="font-semibold mr-2">
                          {["A", "B", "C", "D"][oIdx]}.
                        </span>
                        {opt}
                        {oIdx === q.correctAnswer && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Monitoring Modal */}
      {monitorQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setMonitorQuiz(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Quiz Monitoring: {monitorQuiz.title}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {monitorQuiz.questions?.length || 0} questions •{" "}
                  {monitorQuiz.totalMarks} marks
                </p>
              </div>
              <button
                onClick={() => setMonitorQuiz(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {monitorData.loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 text-sm">
                    Loading monitoring data...
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        Total Attempts
                      </p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {monitorData.stats?.submissionCount || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Average Score
                      </p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">
                        {monitorData.stats?.averageMarks
                          ? monitorData.stats.averageMarks.toFixed(1)
                          : "0"}
                        <span className="text-sm font-normal text-blue-500">
                          /{monitorQuiz.totalMarks}
                        </span>
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Completion Rate
                      </p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {monitorData.stats?.completionPercentage
                          ? monitorData.stats.completionPercentage.toFixed(0)
                          : "0"}
                        %
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Class Average %
                      </p>
                      <p className="text-3xl font-bold text-amber-900 mt-1">
                        {monitorData.stats?.averageMarks &&
                        monitorQuiz.totalMarks
                          ? (
                              (monitorData.stats.averageMarks /
                                monitorQuiz.totalMarks) *
                              100
                            ).toFixed(0)
                          : "0"}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Student Attempts Table */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      Student Attempts
                    </h3>
                    {monitorData.submissions.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">
                          No student attempts yet
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Student
                              </th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Submitted At
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                                Score
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                                Percentage
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {monitorData.submissions.map((sub) => {
                              const pct =
                                sub.marksObtained != null &&
                                monitorQuiz.totalMarks
                                  ? (
                                      (sub.marksObtained /
                                        monitorQuiz.totalMarks) *
                                      100
                                    ).toFixed(0)
                                  : null;
                              return (
                                <tr key={sub._id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                        {(sub.student?.user?.fullName ||
                                          "S")[0].toUpperCase()}
                                      </div>
                                      <span className="font-medium">
                                        {sub.student?.user?.fullName ||
                                          "Student"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">
                                    {new Date(sub.submittedAt).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-center font-semibold">
                                    {sub.marksObtained != null
                                      ? `${sub.marksObtained}/${monitorQuiz.totalMarks}`
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {pct != null ? (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          pct >= 80
                                            ? "bg-green-100 text-green-700"
                                            : pct >= 50
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {pct}%
                                      </span>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        sub.submissionStatus === "evaluated" ||
                                        sub.status === "evaluated"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {sub.submissionStatus ||
                                        sub.status ||
                                        "submitted"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
