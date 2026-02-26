import React, { useEffect, useState } from "react";
import { Plus, Trash2, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch: "",
    dueDate: "",
    totalMarks: 100,
    duration: "",
    maxAttempts: 1,
    moduleName: "",
    lessonName: "",
    lessonId: "",
  });
  const [questionEditorQuiz, setQuestionEditorQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  // Scores panel state
  const [scoresQuiz, setScoresQuiz] = useState(null);
  const [scoresData, setScoresData] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);

  useEffect(() => {
    loadBatches();
    loadQuizzes();
  }, []);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/batches");
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error("Load batches failed:", err);
    }
  };

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/assessments", {
        params: { type: "quiz" },
      });
      setQuizzes(data?.data?.assessments || []);
    } catch (err) {
      console.error("Load quizzes failed:", err);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/api/assessments/${quizId}`);
      toast.success("Quiz deleted");
      await loadQuizzes();
    } catch (err) {
      console.error("Delete quiz failed:", err);
      toast.error("Failed to delete quiz");
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: "quiz",
        batch: formData.batch,
        totalMarks: Number(formData.totalMarks),
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
        status: "published",
        moduleName: formData.moduleName,
        lessonName: formData.lessonName,
        lessonId: formData.lessonId,
        duration: formData.duration ? Number(formData.duration) : undefined,
        maxAttempts: Number(formData.maxAttempts) || 1,
      };

      await api.post("/api/assessments", payload);
      toast.success("Quiz created successfully");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        batch: "",
        dueDate: "",
        totalMarks: 100,
        duration: "",
        maxAttempts: 1,
        moduleName: "",
        lessonName: "",
        lessonId: "",
      });
      await loadQuizzes();
    } catch (err) {
      console.error("Create quiz failed:", err);
      toast.error(err.response?.data?.message || "Failed to create quiz");
    }
  };

  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((q) => q.status === "published").length;
  const totalAttempts = quizzes.reduce(
    (sum, q) => sum + (q.submissionStats?.total || 0),
    0,
  );

  const openQuestionEditor = async (quiz) => {
    setQuestionEditorQuiz(quiz);
    try {
      const { data } = await api.get(`/api/assessments/${quiz._id}/questions`);
      setQuestions(data?.data?.questions || []);
    } catch (err) {
      console.error("Load questions failed:", err);
      toast.error("Failed to load quiz questions");
      setQuestions([]);
    }
  };

  const openScoresPanel = async (quiz) => {
    setScoresQuiz(quiz);
    setScoresData(null);
    setScoresLoading(true);
    try {
      const { data } = await api.get(`/api/assessments/${quiz._id}/statistics`);
      setScoresData(data?.data || null);
    } catch (err) {
      console.error("Load quiz statistics failed:", err);
      toast.error("Failed to load quiz scores");
    } finally {
      setScoresLoading(false);
    }
  };

  const handleQuestionChange = (index, updated) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const addEmptyQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        prompt: "",
        options: [
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
        ],
        marks: 1,
        explanation: "",
      },
    ]);
  };

  const handleSaveQuestions = async () => {
    if (!questionEditorQuiz) return;
    try {
      setIsSavingQuestions(true);
      const payload = questions.map((q, index) => ({
        _id: q._id,
        prompt: q.prompt,
        options: (q.options || []).map((opt) => ({
          label: opt.label,
          isCorrect: !!opt.isCorrect,
        })),
        marks: Number(q.marks ?? 1),
        order: q.order ?? index,
        isActive: q.isActive !== false,
        explanation: q.explanation ?? "",
      }));
      await api.post(`/api/assessments/${questionEditorQuiz._id}/questions`, {
        questions: payload,
      });
      toast.success("Questions saved");
      setQuestionEditorQuiz(null);
      setQuestions([]);
    } catch (err) {
      console.error("Save questions failed:", err);
      toast.error(err.response?.data?.message || "Failed to save questions");
    } finally {
      setIsSavingQuestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Quiz Management
            </h1>
            <p className="text-slate-600">
              Create and manage lesson-wise quizzes backed by assessments.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="py-3 px-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] hover:shadow-lg text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create New Quiz
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalQuizzes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  Active Quizzes
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {activeQuizzes}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalAttempts}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <span className="text-2xl">❓</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quizzes List */}
        <div>
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-7 w-1/2 rounded" />
                      <Skeleton className="h-4 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Quizzes Created
              </h3>
              <p className="text-slate-600 mb-6">
                Get started by creating your first quiz backed by assessments.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                Create First Quiz
              </Button>
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
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {quiz.title}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${quiz.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : quiz.status === "draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                              }`}
                          >
                            {quiz.status || "published"}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium">
                        Batch: <span className="text-slate-700">{quiz.batch?.name || "N/A"}</span> • Course:{" "}
                        <span className="text-slate-700">{quiz.batch?.course || "N/A"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-sm">
                    <div className="text-slate-600">
                      <span className="font-medium">Due Date:</span>{" "}
                      <span className="text-slate-900 text-xs">
                        {quiz.dueDate
                          ? new Date(quiz.dueDate).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Total Marks:</span>{" "}
                      <span className="text-slate-900">
                        {quiz.totalMarks || 0}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Duration:</span>{" "}
                      <span className="text-slate-900">
                        {quiz.duration ? `${quiz.duration} min` : "Unlimited"}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Max Attempts:</span>{" "}
                      <span className="text-slate-900">
                        {quiz.maxAttempts ?? 1}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Attempts:</span>{" "}
                      <span className="text-slate-900">
                        {quiz.submissionStats?.total || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium rounded-xl h-11 transition-all"
                      onClick={() => openQuestionEditor(quiz)}
                    >
                      Manage Questions
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-blue-600 border-blue-100 hover:bg-blue-50 font-medium rounded-xl h-11 transition-all"
                      onClick={() => openScoresPanel(quiz)}
                    >
                      <BarChart2 className="w-4 h-4 mr-2" />
                      View Scores
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-medium rounded-xl h-11 transition-all"
                      variant="ghost"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Quiz Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-premium rounded-2xl">
            <DialogHeader className="px-6 py-5 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white">
              <DialogTitle className="text-xl font-bold">Create New Quiz</DialogTitle>
              <p className="text-teal-50/80 text-xs mt-1">Set up a new assessment for your students</p>
            </DialogHeader>
            <form onSubmit={handleCreateQuiz} className="p-6 space-y-5 bg-white">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Quiz title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short description or instructions"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, batch: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input
                    type="number"
                    required
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalMarks: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (min)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Attempts</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAttempts: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* Optional lesson metadata */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson (optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    value={formData.moduleName}
                    onChange={(e) =>
                      setFormData({ ...formData, moduleName: e.target.value })
                    }
                    placeholder="Module / Unit"
                  />
                  <Input
                    value={formData.lessonName}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonName: e.target.value })
                    }
                    placeholder="Lesson name"
                  />
                  <Input
                    value={formData.lessonId}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonId: e.target.value })
                    }
                    placeholder="Lesson ID (optional)"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl hover:bg-slate-100 font-medium h-11"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0F4C5C] hover:bg-[#1a7a8f] text-white font-semibold rounded-xl px-8 h-11 shadow-md transition-all"
                >
                  Create Quiz
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Scores Panel Dialog */}
        <Dialog
          open={!!scoresQuiz}
          onOpenChange={(open) => {
            if (!open) setScoresQuiz(null);
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Quiz Scores • {scoresQuiz?.title}</DialogTitle>
            </DialogHeader>
            {scoresLoading ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                Loading scores...
              </p>
            ) : scoresData ? (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-600 uppercase">
                      Attempts
                    </p>
                    <p className="text-2xl font-black text-blue-700">
                      {scoresData.submissionCount}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-600 uppercase">
                      Avg Score
                    </p>
                    <p className="text-2xl font-black text-emerald-700">
                      {Math.round(scoresData.averageMarks * 10) / 10}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase">
                      Completion
                    </p>
                    <p className="text-2xl font-black text-purple-700">
                      {Math.round(scoresData.completionPercentage)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Out of {scoresQuiz?.totalMarks} total marks
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No scores available yet.
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* Question Editor Modal */}
        <Dialog
          open={!!questionEditorQuiz}
          onOpenChange={(open) => {
            if (!open) {
              setQuestionEditorQuiz(null);
              setQuestions([]);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-premium rounded-2xl">
            <DialogHeader className="px-6 py-5 bg-slate-900 text-white">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <span className="p-2 bg-slate-800 rounded-lg">✍️</span>
                Manage Questions
              </DialogTitle>
              <p className="text-slate-400 text-sm mt-1">{questionEditorQuiz?.title}</p>
            </DialogHeader>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-50/50">
              {questions.length === 0 && (
                <p className="text-sm text-slate-500">
                  No questions yet. Start by adding a question.
                </p>
              )}
              {questions.map((q, index) => (
                <div
                  key={q._id || index}
                  className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow mt-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        Question Prompt
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={q.prompt}
                      onChange={(e) =>
                        handleQuestionChange(index, { prompt: e.target.value })
                      }
                      className="h-12 bg-white rounded-xl border-slate-200 focus:ring-slate-900"
                      placeholder="Enter the question text here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(q.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <input
                          type="checkbox"
                          checked={!!opt.isCorrect}
                          className="w-5 h-5 rounded border-slate-300 text-[#0F4C5C] focus:ring-[#0F4C5C]"
                          onChange={(e) => {
                            const newOptions = [...(q.options || [])];
                            newOptions[optIdx] = {
                              ...newOptions[optIdx],
                              isCorrect: e.target.checked,
                            };
                            handleQuestionChange(index, {
                              options: newOptions,
                            });
                          }}
                        />
                        <Input
                          value={opt.label}
                          onChange={(e) => {
                            const newOptions = [...(q.options || [])];
                            newOptions[optIdx] = {
                              ...newOptions[optIdx],
                              label: e.target.value,
                            };
                            handleQuestionChange(index, {
                              options: newOptions,
                            });
                          }}
                          className="h-10 border-none bg-transparent focus:ring-0 text-sm font-medium"
                          placeholder={`Option ${optIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[#0F4C5C] font-bold p-0 flex items-center gap-1"
                      onClick={() => {
                        const newOptions = [
                          ...(q.options || []),
                          { label: "", isCorrect: false },
                        ];
                        handleQuestionChange(index, { options: newOptions });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </Button>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Points</span>
                      <Input
                        type="number"
                        className="w-16 h-8 border-none bg-transparent focus:ring-0 text-center font-bold"
                        value={q.marks ?? 1}
                        onChange={(e) =>
                          handleQuestionChange(index, {
                            marks: Number(e.target.value || 1),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explanation for students</span>
                    </div>
                    <Textarea
                      rows={2}
                      value={q.explanation ?? ""}
                      onChange={(e) =>
                        handleQuestionChange(index, {
                          explanation: e.target.value,
                        })
                      }
                      placeholder="Explain why the correct answer is correct..."
                      className="text-sm bg-white rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center bg-white border-t border-slate-100 p-6 sticky bottom-0">
                <Button
                  variant="outline"
                  onClick={addEmptyQuestion}
                  className="rounded-xl border-slate-200 font-bold h-11 text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Question
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setQuestionEditorQuiz(null)}
                    className="rounded-xl font-medium h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveQuestions}
                    disabled={isSavingQuestions}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl px-8 shadow-md"
                  >
                    {isSavingQuestions ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : "Publish Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QuizManagement;
