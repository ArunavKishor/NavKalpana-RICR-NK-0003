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
import { motion, AnimatePresence } from "framer-motion";

const TeacherAssessmentManagement = () => {
  const [activeTab] = useState("assignments");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
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
    const names = assessments
      .map((a) => a.moduleName)
      .filter(Boolean);
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
        return matchesSearch && matchesModule;
      }),
    [assessments, searchQuery, selectedModule],
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
      const payload = {
        ...formData,
        type: activeTab === "assignments" ? "assignment" : "quiz",
        totalMarks: Number(formData.totalMarks),
        submissionType: formData.submissionType,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
      };

      console.log("Sending payload:", payload);

      const res = await api.post("/api/assessments", payload);

      toast.success("Assessment created successfully");

      setShowForm(false);
      loadAssessments();
    } catch (err) {
      console.error("Create Assessment Error:", err.response?.data || err);

      toast.error(err.response?.data?.message || "Failed to create assessment");
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Assessment Management
          </h1>
          <p className="text-slate-500 mt-1">
            Create and manage assignments and quizzes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Single Tab Header (Assignments Only) */}
      <div className="flex gap-4 border-b border-slate-200 pb-0">
        <div className="px-4 py-3 font-medium border-b-2 text-blue-600 border-blue-600">
          Assignments
        </div>
      </div>

      {/* Search + Module Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        {moduleOptions.length > 1 && (
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="sm:w-52 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {moduleOptions.map((m) => (
              <option key={m} value={m}>
                {m === "All" ? "All Modules" : m}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded mb-2 w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
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
                whileHover={{ x: 4 }}
                className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {assessment.title}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            assessment.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : assessment.status === "draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {assessment.status || "active"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {activeTab === "assignments" ? "Assignment" : "Quiz"}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">
                        {assessment.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                        <span>
                          Due:{" "}
                          {new Date(assessment.dueDate).toLocaleDateString()}
                        </span>
                        <span>Marks: {assessment.totalMarks}</span>
                        {activeTab === "assignments" && (
                          <span>
                            Type: {assessment.submissionType || "PDF"}
                          </span>
                        )}
                        {activeTab === "quizzes" && (
                          <span>Duration: {assessment.duration || 0} mins</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                      <Button
                        onClick={() => handleViewSubmissions(assessment)}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDelete(assessment._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Submissions Stats */}
                  {activeTab === "assignments" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs">
                      <div>
                        <p className="text-slate-600">Submitted</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {assessment.submissionStats?.submitted || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Pending</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {assessment.submissionStats?.pending || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Evaluated</p>
                        <p className="text-lg font-bold text-blue-600">
                          {assessment.submissionStats?.evaluated || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quiz Stats */}
                  {activeTab === "quizzes" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs">
                      <div>
                        <p className="text-slate-600">Attempts</p>
                        <p className="text-lg font-bold">
                          {assessment.attempts || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Avg Score</p>
                        <p className="text-lg font-bold">
                          {assessment.averageScore?.toFixed(1) || "N/A"}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Questions</p>
                        <p className="text-lg font-bold">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Quiz creation and management is available in
          the Quiz Management section.
        </p>
      </div>

      {/* Create Assessment Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create New {activeTab === "assignments" ? "Assignment" : "Quiz"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAssessment} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Assessment title"
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
                placeholder="Instructions for students"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  required
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: e.target.value })
                  }
                />
              </div>
              {activeTab === "assignments" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Allowed File Type
                  </label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, submissionType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Only</SelectItem>
                      <SelectItem value="Image">Image Only</SelectItem>
                      <SelectItem value="Any">Any File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              <Button type="submit">Create Assessment</Button>
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
                    ${
                      isActive
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

                          <Badge
                            className={
                              sub.status === "evaluated"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {sub.status}
                          </Badge>
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
