import React, { useEffect, useState } from "react";
import { Plus, Trash2, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
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
            className="py-3 px-6 bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create New Quiz
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalQuizzes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Active Quizzes
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {activeQuizzes}
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
                <p className="text-slate-600 text-sm font-medium">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalAttempts}
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
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
              <p className="text-slate-600">Loading quizzes...</p>
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
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Batch: {quiz.batch?.name || "N/A"} • Course:{" "}
                        {quiz.batch?.course || "N/A"}
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
                      {quiz.status || "published"}
                    </span>
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

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openQuestionEditor(quiz)}
                    >
                      Manage Questions
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={() => openScoresPanel(quiz)}
                    >
                      <BarChart2 className="w-4 h-4 mr-2" />
                      View Scores
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Quiz</Button>
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
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Questions • {questionEditorQuiz?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {questions.length === 0 && (
                <p className="text-sm text-slate-500">
                  No questions yet. Start by adding a question.
                </p>
              )}
              {questions.map((q, index) => (
                <div
                  key={q._id || index}
                  className="border border-slate-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Question {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={q.prompt}
                    onChange={(e) =>
                      handleQuestionChange(index, { prompt: e.target.value })
                    }
                    placeholder="Question text"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {(q.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!opt.isCorrect}
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
                          placeholder={`Option ${optIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = [
                          ...(q.options || []),
                          { label: "", isCorrect: false },
                        ];
                        handleQuestionChange(index, { options: newOptions });
                      }}
                    >
                      Add Option
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Marks:</span>
                      <Input
                        type="number"
                        className="w-20"
                        value={q.marks ?? 1}
                        onChange={(e) =>
                          handleQuestionChange(index, {
                            marks: Number(e.target.value || 1),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">
                      Explanation (shown after submission)
                    </label>
                    <Textarea
                      rows={2}
                      value={q.explanation ?? ""}
                      onChange={(e) =>
                        handleQuestionChange(index, {
                          explanation: e.target.value,
                        })
                      }
                      placeholder="Optional: explain why the correct answer is correct"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={addEmptyQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button
                  onClick={handleSaveQuestions}
                  disabled={isSavingQuestions}
                >
                  {isSavingQuestions ? "Saving..." : "Save Questions"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QuizManagement;
