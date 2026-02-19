import React, { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  CheckSquare,
  Calendar,
  Target,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Modal from "@/components/admin/Modal";
import AssessmentForm from "@/components/admin/AssessmentForm";
import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";

const AssessmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedLesson, setSelectedLesson] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [batchOptions, setBatchOptions] = useState([]);

  // Get data based on active tab
  const filteredData =
    activeTab === "assignments" ? assignments : quizzes;

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const [assignRes, quizRes] = await Promise.all([
        api.get("/api/assessments", { params: { type: "assignment" } }),
        api.get("/api/assessments", { params: { type: "quiz" } }),
      ]);

      const enrich = async (items) => {
        const stats = await Promise.all(
          items.map(async (item) => {
            try {
              const { data } = await api.get(
                `/api/assessments/${item._id}/statistics`,
              );
              return { id: item._id, stats: data?.data };
            } catch (err) {
              return { id: item._id, stats: null };
            }
          }),
        );
        const statMap = new Map(stats.map((s) => [s.id, s.stats]));
        return items.map((item) => ({ ...item, stats: statMap.get(item._id) }));
      };

      const assignmentList = assignRes?.data?.data?.assessments || [];
      const quizList = quizRes?.data?.data?.assessments || [];

      setAssignments(await enrich(assignmentList));
      setQuizzes(await enrich(quizList));
      setError("");
    } catch (err) {
      console.error("Load assessments failed:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load assessments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/batches", {
        params: { limit: 100 },
      });
      setBatchOptions(data?.data?.batches || []);
    } catch (err) {
      console.error("Load batches failed:", err);
    }
  };

  const handleAssessmentFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (modalMode === "create") {
        await api.post("/api/assessments", data);
        toast.success("Assessment created successfully");
      } else {
        await api.put(`/api/assessments/${selectedAssessment._id}`, data);
        toast.success("Assessment updated successfully");
      }

      setIsModalOpen(false);
      await loadAssessments();
    } catch (err) {
      console.error("Assessment submit failed:", err);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mapped = backendErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFormErrors(mapped);
      }
      toast.error(
        err.response?.data?.message || "Failed to save assessment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAssessment(null);
    setFormErrors({});
    setIsModalOpen(true);
    loadBatches();
  };

  const openEditModal = (assessment) => {
    setModalMode("edit");
    setSelectedAssessment(assessment);
    setFormErrors({});
    setIsModalOpen(true);
    loadBatches();
  };

  const openDeleteDialog = (assessment) => {
    setAssessmentToDelete(assessment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!assessmentToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/assessments/${assessmentToDelete._id}`);
      if (assessmentToDelete.type === "assignment") {
        setAssignments((prev) =>
          prev.filter((item) => item._id !== assessmentToDelete._id),
        );
      } else {
        setQuizzes((prev) =>
          prev.filter((item) => item._id !== assessmentToDelete._id),
        );
      }
      toast.success("Deleted successfully", { duration: 5000 });
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    } catch (err) {
      console.error("Delete assessment failed:", err);
      toast.error(
        err.response?.data?.message ||
        "Failed to delete assessment. Please try again.",
        { duration: 5000 },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ONGOING":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "EVALUATING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-sm text-slate-500">Loading assessments...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Assessment Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage assignments and quizzes across your lessons
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          <span>
            {activeTab === "quizzes" ? "Create Quiz" : "Create Assignment"}
          </span>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial justify-center ${activeTab === "assignments"
              ? "bg-blue-50 text-blue-600 shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <FileText className="w-4 h-4" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial justify-center ${activeTab === "quizzes"
              ? "bg-blue-50 text-blue-600 shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <CheckSquare className="w-4 h-4" />
            Quizzes
          </button>
        </div>

        {/* Lesson Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            <option value="all">All Lessons</option>
            <option value="react">React Lessons</option>
            <option value="redux">Redux Lessons</option>
            <option value="javascript">JavaScript Lessons</option>
            <option value="nodejs">Node.js Lessons</option>
          </select>
        </div>
      </div>

      {/* Content - Conditional rendering based on tab */}
      {activeTab === "assignments" ? (
        /* Assignments Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredData.map((assignment) => (
            <Card
              key={assignment._id}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-6 space-y-5">
                {/* Header with Title and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        Batch: {assignment.batch?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(assignment.status)} border px-3 py-1 font-semibold text-xs shrink-0`}
                  >
                    {assignment.status?.toUpperCase()}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {assignment.description || "No description provided."}
                </p>

                {/* Deadline and Max Marks */}
                <div className="flex items-center gap-6">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Deadline
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Max Marks
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {assignment.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Completion Rate
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(assignment.stats?.completionPercentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          assignment.stats?.completionPercentage || 0,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats and Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">
                        {assignment.stats?.submissionCount || 0}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Submissions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {Math.round(assignment.stats?.averageMarks || 0)}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Avg Marks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {Math.round(assignment.stats?.completionPercentage || 0)}%
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Completion
                      </div>
                    </div>
                  </div>

                  {/* View All Link */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
                      onClick={() => openEditModal(assignment)}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm"
                      onClick={() => openDeleteDialog(assignment)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Quizzes Table */
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 py-4 px-6 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Quiz Title</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Stats</div>
              <div className="col-span-2">Avg Score</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-200">
              {filteredData.map((quiz) => (
                <div
                  key={quiz._id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  {/* Quiz Title */}
                  <div className="col-span-1 md:col-span-3 flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        Batch: {quiz.batch?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase">
                      Duration:
                    </div>
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {quiz.dueDate
                        ? new Date(quiz.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })
                        : "N/A"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase mb-1">
                      Stats:
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-bold text-slate-900">
                          {quiz.stats?.submissionCount || 0}
                        </span>{" "}
                        <span className="text-slate-500">Attempts</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {quiz.totalMarks}{" "}
                        <span className="text-orange-500">TOTAL MARKS</span>
                      </p>
                    </div>
                  </div>

                  {/* Avg Score */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase mr-2">
                      Avg Score:
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {Math.round(quiz.stats?.averageMarks || 0)}
                    </span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-sm text-slate-500">
                      {quiz.totalMarks}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <Badge
                      className={`${getStatusColor(quiz.status)} border px-3 py-1.5 font-semibold text-xs`}
                    >
                      {quiz.status?.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-start md:justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => openEditModal(quiz)}
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => openDeleteDialog(quiz)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {filteredData.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-slate-500">
            Create your first{" "}
            {activeTab === "assignments" ? "assignment" : "quiz"} to get
            started.
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title={modalMode === "create" ? "Create Assessment" : "Edit Assessment"}
        description={modalMode === "create" ? "Create a new assignment or quiz for a batch." : "Update the assessment details."}
      >
        <AssessmentForm
          initialData={modalMode === "edit" ? selectedAssessment : null}
          onSubmit={handleAssessmentFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          batches={batchOptions}
          errors={formErrors}
        />
      </Modal>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Assessment"
        description={`Are you sure you want to delete "${assessmentToDelete?.title}"? This will also remove any student submissions associated with it.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AssessmentManagement;
