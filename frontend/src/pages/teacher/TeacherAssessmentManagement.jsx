import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  Edit,
  X,
  FileText,
  Download,
  CheckCircle,
  Clock,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const TeacherAssessmentManagement = () => {
  const [activeTab] = useState("assignments");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedLesson, setSelectedLesson] = useState("All");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "assignment",
    batch: "",
    dueDate: "",
    totalMarks: 100,
    submissionType: "PDF",
    moduleName: "",
    lessonName: "",
    lessonId: "",
  });
  const [evalData, setEvalData] = useState({
    marks: "",
    feedback: "",
    currentSubmission: null,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadAssessments();
    loadBatches();
  }, [activeTab]);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/batches");
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error("Load batches failed:", err);
    }
  };

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/assessments", {
        params: {
          type: activeTab === "assignments" ? "assignment" : "quiz",
        },
      });
      setAssessments(data?.data?.assessments || []);
    } catch (err) {
      console.error("Load assessments failed:", err);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const moduleOptions = useMemo(() => {
    const names = assessments.map((a) => a.moduleName).filter(Boolean);
    return ["All", ...new Set(names)];
  }, [assessments]);

  const lessonOptions = useMemo(() => {
    const names = assessments.map((a) => a.lessonName).filter(Boolean);
    return ["All", ...new Set(names)];
  }, [assessments]);

  const filteredAssessments = useMemo(
    () =>
      assessments.filter((a) => {
        const matchesSearch =
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule =
          selectedModule === "All" || a.moduleName === selectedModule;
        const matchesLesson =
          selectedLesson === "All" || a.lessonName === selectedLesson;
        return matchesSearch && matchesModule && matchesLesson;
      }),
    [assessments, searchQuery, selectedModule, selectedLesson],
  );

  const handleDelete = async (assessmentId) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      await api.delete(`/api/assessments/${assessmentId}`);
      toast.success("Assessment deleted successfully");
      await loadAssessments();
    } catch (err) {
      console.error("Delete assessment failed:", err);
      toast.error("Failed to delete assessment");
    }
  };

  const handleViewSubmissions = async (assessment) => {
    setSelectedAssessment(assessment);
    try {
      const { data } = await api.get(
        `/api/assessments/${assessment._id}/submissions`,
      );
      setSubmissions(data?.data?.submissions || []);
      setShowEvaluation(true);
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("type", activeTab === "assignments" ? "assignment" : "quiz");
      fd.append("batch", formData.batch);
      fd.append("dueDate", formData.dueDate ? new Date(formData.dueDate).toISOString() : "");
      fd.append("totalMarks", Number(formData.totalMarks));
      fd.append("submissionType", formData.submissionType);
      if (formData.moduleName) fd.append("moduleName", formData.moduleName);
      if (formData.lessonName) fd.append("lessonName", formData.lessonName);
      if (formData.lessonId) fd.append("lessonId", formData.lessonId);
      if (imageFile) fd.append("image", imageFile);

      await api.post("/api/assessments", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Assessment created successfully");
      setShowForm(false);
      setImageFile(null);
      loadAssessments();
    } catch (err) {
      console.error("Create Assessment Error:", err.response?.data || err);
      const errors = err.response?.data?.errors;
      let errMsg = err.response?.data?.message || "Failed to create assessment";

      if (errors && Array.isArray(errors) && errors.length > 0) {
        errMsg = errors.map(e => e.message || e.msg || JSON.stringify(e)).join(", ");
      } else if (errors && typeof errors === 'object') {
        errMsg = Object.values(errors).map(e => e.message || e).join(", ");
      }

      toast.error(errMsg);
    }
  };

  const handleEvaluate = async () => {
    if (!evalData.currentSubmission) return;
    try {
      await api.post(
        `/api/assessments/${selectedAssessment._id}/submissions/${evalData.currentSubmission._id}/evaluate`,
        {
          marksObtained: Number(evalData.marks),
          feedback: evalData.feedback,
        },
      );
      toast.success("Submission graded");
      setEvalData({ marks: "", feedback: "", currentSubmission: null });
      handleViewSubmissions(selectedAssessment);
    } catch (err) {
      toast.error("Evaluation failed");
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-heading">
            Assessment Management
          </h1>
          <p className="text-slate-500 mt-1">
            Create, track and evaluate student assignments
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto py-6 px-8 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] hover:shadow-lg text-white font-bold rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Assessment
        </Button>
      </div>

      {/* Single Tab Header (Assignments Only) */}
      <div className="flex gap-4 border-b border-slate-200 pb-0">
        <div className="px-4 py-3 font-medium border-b-2 text-blue-600 border-blue-600">
          Assignments
        </div>
      </div>

      {/* Search + Module + Lesson Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-primary focus-visible:bg-white transition-all"
          />
        </div>
        <div className="sm:col-span-3">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              {moduleOptions.map((m) => (
                <SelectItem key={m} value={m} className="rounded-lg">
                  {m === "All" ? "All Modules" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary">
              <SelectValue placeholder="All Lessons" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              {lessonOptions.map((l) => (
                <SelectItem key={l} value={l} className="rounded-lg">
                  {l === "All" ? "All Lessons" : l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-full max-w-[16rem] rounded-lg" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-2xl rounded" />
                    <Skeleton className="h-4 w-3/4 max-w-xl rounded" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-8 w-40 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-3">
                  <Skeleton className="h-11 w-32 rounded-xl" />
                  <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assessment List */}
      {!loading && (
        <div className="space-y-3">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500 font-medium">No {activeTab} found</p>
              <p className="text-slate-400 text-sm mt-2">
                {searchQuery
                  ? "Try adjusting your search"
                  : `Create your first ${activeTab.slice(0, -1)} to get started`}
              </p>
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <motion.div
                key={assessment._id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-premium border border-slate-100/50 hover:border-primary/20 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          {assessment.title}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${assessment.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : assessment.status === "draft"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-50 text-slate-500"
                              }`}
                          >
                            {assessment.status || "active"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary">
                            {activeTab === "assignments" ? "Assignment" : "Quiz"}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                        {assessment.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Due: {new Date(assessment.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{assessment.totalMarks} Marks</span>
                        </div>
                        {activeTab === "assignments" && (
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tighter">
                            <span>Format: {assessment.submissionType || "PDF"}</span>
                          </div>
                        )}
                        {activeTab === "quizzes" && (
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span>{assessment.duration || 0} mins</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3">
                      <Button
                        onClick={() => handleViewSubmissions(assessment)}
                        variant="outline"
                        className="rounded-xl border-slate-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all font-bold h-11 px-6 shadow-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Submissions
                      </Button>
                      <Button
                        onClick={() => handleDelete(assessment._id)}
                        variant="ghost"
                        className="rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold h-11 px-6"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Submissions Stats */}
                  {activeTab === "assignments" && (
                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600/70 mb-1">Submitted</p>
                        <p className="text-2xl font-black text-emerald-600">
                          {assessment.submissionStats?.submitted || 0}
                        </p>
                      </div>
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-600/70 mb-1">Pending</p>
                        <p className="text-2xl font-black text-amber-600">
                          {assessment.submissionStats?.pending || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-600/70 mb-1">Evaluated</p>
                        <p className="text-2xl font-black text-blue-600">
                          {assessment.submissionStats?.evaluated || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quiz Stats */}
                  {activeTab === "quizzes" && (
                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Attempts</p>
                        <p className="text-2xl font-black text-slate-900">
                          {assessment.attempts || 0}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Avg Score</p>
                        <p className="text-2xl font-black text-slate-900">
                          {assessment.averageScore?.toFixed(1) || "N/A"}%
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Questions</p>
                        <p className="text-2xl font-black text-slate-900">
                          {assessment.questions?.length || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-[#0F4C5C]/5 border border-[#0F4C5C]/10 rounded-2xl p-6 flex items-start gap-4"
      >
        <div className="p-2 bg-[#0F4C5C] rounded-lg text-white">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-[#0F4C5C] leading-relaxed">
            <strong className="font-bold">Pro Tip:</strong> Use Assessment Management for file-based submissions.
            For interactive testing, visit the <span className="font-bold underline cursor-pointer">Quiz Management</span> section to create automated lesson-based quizzes.
          </p>
        </div>
      </motion.div>

      {/* Create Assessment Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-premium rounded-3xl">
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white">
            <DialogTitle className="text-2xl font-bold font-heading">
              New {activeTab === "assignments" ? "Assignment" : "Quiz"}
            </DialogTitle>
            <p className="text-teal-50/70 text-sm mt-1">Set up clear objectives and deadlines for your students</p>
          </DialogHeader>
          <form onSubmit={handleCreateAssessment} className="p-8 space-y-6 bg-white overflow-y-auto max-h-[75vh]">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Assignment Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                placeholder="e.g. Introduction to React Fundamentals"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Detailed Instructions</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-50 border-none rounded-xl focus:ring-primary min-h-[120px] resize-none"
                placeholder="What exactly should students do? Mention submission requirements..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Batch</label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, batch: val })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Maximum Marks</label>
                <Input
                  type="number"
                  required
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: e.target.value })
                  }
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-bold text-primary"
                />
              </div>
              {activeTab === "assignments" && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Submission Format
                  </label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, submissionType: val })
                    }
                  >
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary font-medium">
                      <SelectValue placeholder="PDF Default" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="PDF" className="rounded-lg">PDF Document</SelectItem>
                      <SelectItem value="Image" className="rounded-lg">Image File</SelectItem>
                      <SelectItem value="Any" className="rounded-lg">Any Attachment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900">Module & Lesson Info</label>
                <span className="text-[10px] text-slate-400 font-bold uppercase">(For organization)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={formData.moduleName}
                  onChange={(e) =>
                    setFormData({ ...formData, moduleName: e.target.value })
                  }
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm font-medium"
                  placeholder="Module Name"
                />
                <Input
                  value={formData.lessonName}
                  onChange={(e) =>
                    setFormData({ ...formData, lessonName: e.target.value })
                  }
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm font-medium"
                  placeholder="Lesson Name"
                />
                <Input
                  value={formData.lessonId}
                  onChange={(e) =>
                    setFormData({ ...formData, lessonId: e.target.value })
                  }
                  className="h-11 bg-slate-50 border-none rounded-xl focus:ring-primary text-sm font-medium"
                  placeholder="Lesson ID"
                />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Cover Image (Recommended)
              </label>
              <div className="mt-2 text-center">
                <Input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 transition-all"
                >
                  <Download className="w-8 h-8 text-primary/40 mb-2" />
                  <span className="text-sm font-bold text-primary/60">
                    {imageFile ? imageFile.name : "Click to upload banner image"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase">Supports JPG, PNG (Max 5MB)</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="h-12 rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="h-12 rounded-xl px-10 bg-[#0F4C5C] hover:bg-[#1a7a8f] text-white font-black shadow-lg shadow-[#0F4C5C]/20 transition-all"
              >
                Publish Assessment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submissions/Evaluation Modal */}
      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-white">
            <DialogTitle className="text-lg font-semibold">
              Submissions • {selectedAssessment?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* ================= SUBMISSION LIST ================= */}
            <div className="border-r bg-slate-50/40 h-full overflow-y-auto">
              <div className="p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">
                  Student Submissions
                </h4>

                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <FileText className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm">No submissions yet</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const isActive =
                      evalData.currentSubmission?._id === sub._id;

                    return (
                      <div
                        key={sub._id}
                        onClick={() =>
                          setEvalData({
                            ...evalData,
                            currentSubmission: sub,
                            marks: sub.marksObtained || "",
                            feedback: sub.feedback || "",
                          })
                        }
                        className={`group p-4 rounded-xl border cursor-pointer transition-all bg-white
                    ${isActive
                            ? "border-blue-500 shadow-sm ring-2 ring-blue-100"
                            : "hover:border-slate-300 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {sub.student?.user?.fullName || "Student"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(sub.submittedAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={
                                sub.status === "evaluated"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }
                            >
                              {sub.status}
                            </Badge>
                            {selectedAssessment?.dueDate &&
                              sub.submittedAt &&
                              new Date(sub.submittedAt) >
                              new Date(selectedAssessment.dueDate) && (
                                <Badge className="bg-red-100 text-red-700 text-[10px]">
                                  Late
                                </Badge>
                              )}
                          </div>
                        </div>

                        {sub.marksObtained !== undefined && (
                          <p className="text-xs text-slate-500 mt-2">
                            Marks:{" "}
                            <span className="font-medium">
                              {sub.marksObtained}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ================= EVALUATION PANEL ================= */}
            <div className="h-full overflow-y-auto bg-white">
              <div className="p-6 space-y-5">
                <h4 className="text-sm font-semibold text-slate-700">
                  Evaluation Panel
                </h4>

                {evalData.currentSubmission ? (
                  <>
                    {/* File Card */}
                    <div className="rounded-xl border bg-slate-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium">Submission File</p>
                          <p className="text-xs text-slate-500 uppercase">
                            {evalData.currentSubmission.fileType || "File"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            evalData.currentSubmission.fileUrl,
                            "_blank",
                          )
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>

                    {/* Marks */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Marks (Max: {selectedAssessment.totalMarks})
                      </label>
                      <Input
                        type="number"
                        max={selectedAssessment.totalMarks}
                        value={evalData.marks}
                        onChange={(e) =>
                          setEvalData({
                            ...evalData,
                            marks: e.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feedback</label>
                      <Textarea
                        rows={5}
                        value={evalData.feedback}
                        onChange={(e) =>
                          setEvalData({
                            ...evalData,
                            feedback: e.target.value,
                          })
                        }
                        placeholder="Provide constructive feedback..."
                      />
                    </div>

                    <Button className="w-full" onClick={handleEvaluate}>
                      Submit Evaluation
                    </Button>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-slate-400">
                    Select a submission to evaluate
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssessmentManagement;
