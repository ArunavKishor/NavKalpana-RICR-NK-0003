import React, { useEffect, useState } from "react";
import { Plus, Trash2, BarChart2, BookOpen, Clock, Users, Target, Layers, CalendarDays, CheckCircle } from "lucide-react";
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
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Quiz Management
          </h1>
          <p className="text-slate-500 mt-1">
            Create and manage lesson-wise quizzes backed by assessments.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto py-6 px-8 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] hover:shadow-lg text-white font-bold rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create New Quiz
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Quizzes</p>
            <p className="text-3xl font-black text-slate-900">{totalQuizzes}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Active Quizzes</p>
            <p className="text-3xl font-black text-emerald-600">{activeQuizzes}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Attempts</p>
            <p className="text-3xl font-black text-orange-600">{totalAttempts}</p>
          </div>
        </motion.div>
      </div>

      {/* Quizzes List */}
      <div>
        {loading ? (
          <div className="grid gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48 rounded-lg" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-7 w-28 rounded-full" />
                  ))}
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Quizzes Created Yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Get started by creating your first quiz backed by assessments.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] hover:shadow-lg text-white font-bold rounded-2xl px-8 py-5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Quiz
            </Button>
          </div>
        ) : (
          <div className="grid gap-5">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz._id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-[#0F4C5C]/20 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Card top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f]" />

                <div className="p-6">
                  {/* Title row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F4C5C] to-[#1a7a8f] flex items-center justify-center shrink-0 shadow-md shadow-[#0F4C5C]/20">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700">{quiz.batch?.name || "No Batch"}</span>
                          {quiz.batch?.course && (
                            <span className="text-slate-400"> · {quiz.batch.course}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 self-start px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${quiz.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : quiz.status === "draft"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {quiz.status || "published"}
                    </span>
                  </div>

                  {/* Meta pill badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.dueDate
                        ? new Date(quiz.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "No due date"}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.totalMarks || 0} Marks
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.duration ? `${quiz.duration} min` : "Unlimited"}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.maxAttempts ?? 1} attempt{(quiz.maxAttempts ?? 1) !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0F4C5C]/5 border border-[#0F4C5C]/10 rounded-full px-3 py-1.5 text-xs font-bold text-[#0F4C5C]">
                      <Users className="w-3.5 h-3.5" />
                      {quiz.submissionStats?.total || 0} submissions
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#0F4C5C]/30 hover:text-[#0F4C5C] font-semibold rounded-xl h-10 transition-all"
                      onClick={() => openQuestionEditor(quiz)}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Manage Questions
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-blue-600 border-blue-100 hover:bg-blue-50 hover:border-blue-300 font-semibold rounded-xl h-10 transition-all"
                      onClick={() => openScoresPanel(quiz)}
                    >
                      <BarChart2 className="w-4 h-4 mr-2" />
                      View Scores
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="sm:w-auto text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 font-semibold rounded-xl h-10 px-5 transition-all"
                      variant="ghost"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
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
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[90vh]">
          {/* Sticky Header */}
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white shrink-0">
            <DialogTitle className="text-2xl font-bold">Create New Quiz</DialogTitle>
            <p className="text-teal-50/70 text-sm mt-1">Set up a timed assessment for your students</p>
          </DialogHeader>

          {/* Scrollable Body */}
          <form
            id="createQuizForm"
            onSubmit={handleCreateQuiz}
            className="flex-1 overflow-y-auto px-8 py-6 space-y-5 bg-white"
          >
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                placeholder="e.g. Module 3 — React Fundamentals"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-50 border-none rounded-xl focus:ring-primary min-h-[100px] resize-none"
                placeholder="Short description or instructions for students"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Batch</label>
                <Select
                  value={formData.batch}
                  onValueChange={(val) => setFormData({ ...formData, batch: val })}
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {batches.map((b) => (
                      <SelectItem key={b._id} value={b._id} className="rounded-lg">
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Due Date</label>
                <Input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Total Marks</label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-bold text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Duration (min)</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Max Attempts</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                />
              </div>
            </div>

            {/* Optional lesson metadata */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900">Lesson Info</label>
                <span className="text-[10px] text-slate-400 font-bold uppercase">(Optional — for organization)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  value={formData.moduleName}
                  onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm"
                  placeholder="Module / Unit"
                />
                <Input
                  value={formData.lessonName}
                  onChange={(e) => setFormData({ ...formData, lessonName: e.target.value })}
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm"
                  placeholder="Lesson Name"
                />
                <Input
                  value={formData.lessonId}
                  onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm"
                  placeholder="Lesson ID"
                />
              </div>
            </div>
          </form>

          {/* Sticky Footer — always visible */}
          <div className="shrink-0 px-8 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl hover:bg-slate-100 font-bold h-11 px-6 text-slate-500"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="createQuizForm"
              className="bg-[#0F4C5C] hover:bg-[#1a7a8f] text-white font-bold rounded-xl px-10 h-11 shadow-md shadow-[#0F4C5C]/20 transition-all"
            >
              Create Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scores Panel Dialog */}
      <Dialog
        open={!!scoresQuiz}
        onOpenChange={(open) => {
          if (!open) setScoresQuiz(null);
        }}
      >
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white">
            <DialogTitle className="text-xl font-bold">Quiz Scores</DialogTitle>
            <p className="text-teal-50/70 text-sm mt-0.5 truncate">{scoresQuiz?.title}</p>
          </DialogHeader>
          <div className="p-6 bg-white">
            {scoresLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <span className="w-5 h-5 border-2 border-slate-300 border-t-[#0F4C5C] rounded-full animate-spin mr-3" />
                Loading scores...
              </div>
            ) : scoresData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Attempts</p>
                    <p className="text-3xl font-black text-blue-700">{scoresData.submissionCount}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Avg Score</p>
                    <p className="text-3xl font-black text-emerald-700">
                      {Math.round(scoresData.averageMarks * 10) / 10}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-2">Completion</p>
                    <p className="text-3xl font-black text-purple-700">
                      {Math.round(scoresData.completionPercentage)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Out of <span className="font-bold text-slate-600">{scoresQuiz?.totalMarks}</span> total marks
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <BarChart2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No scores available yet</p>
                <p className="text-xs mt-1">Students haven't attempted this quiz</p>
              </div>
            )}
          </div>
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
          {/* Fixed Header */}
          <DialogHeader className="px-6 py-5 bg-slate-900 text-white shrink-0">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="p-2 bg-slate-800 rounded-lg">✍️</span>
              Manage Questions
            </DialogTitle>
            <p className="text-slate-400 text-sm mt-1 truncate">{questionEditorQuiz?.title}</p>
          </DialogHeader>

          {/* Scrollable Question List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <span className="text-4xl mb-3">📝</span>
                <p className="text-sm font-medium">No questions yet</p>
                <p className="text-xs mt-1">Click "Add New Question" below to get started</p>
              </div>
            )}
            {questions.map((q, index) => (
              <div
                key={q._id || index}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow"
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explanation for students</span>
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
          </div>

          {/* Fixed Footer — outside scroll area */}
          <div className="shrink-0 flex justify-between items-center bg-white border-t border-slate-100 px-6 py-4">
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
                className="rounded-xl font-medium h-11 text-slate-500"
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManagement;
