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
import api from "@/config/Api";
import toast from "react-hot-toast";
import Modal from "@/components/admin/AdminModal";
import AssessmentForm from "@/components/admin/AdminAssessmentForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";
import SubmissionListModal from "@/components/admin/AdminSubmissionListModal";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [batches, setBatches] = useState([]);

  const filteredData = activeTab === "assignments" ? assignments : quizzes;

  useEffect(() => {
    loadAssessments();
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await api.get("/api/batches");
      setBatches(res.data?.data?.batches || []);
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  };

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const [assignRes, quizRes] = await Promise.all([
        api.get("/api/assessments", { params: { type: "assignment" } }),
        api.get("/api/assessments", { params: { type: "quiz" } }),
      ]);

      setAssignments(assignRes?.data?.data?.assessments || []);
      setQuizzes(quizRes?.data?.data?.assessments || []);
      setError("");
    } catch (err) {
      setError("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAssessment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assessment) => {
    setModalMode("edit");
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
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
      loadAssessments();
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAssessmentSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "pdfFile") {
          if (data.pdfFile) formDataToSend.append("pdf", data.pdfFile);
        } else if (key === "questions") {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== undefined && data[key] !== null) {
          formDataToSend.append(key, data[key]);
        }
      });

      if (modalMode === "create") {
        await api.post("/api/assessments", formDataToSend);
        toast.success("Assessment created successfully");
      } else {
        await api.put(`/api/assessments/${selectedAssessment._id}`, formDataToSend);
        toast.success("Assessment updated successfully");
      }

      setIsModalOpen(false);
      loadAssessments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Assessment Management
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Manage assignments and quizzes
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          {activeTab === "quizzes" ? "Create Quiz" : "Create Assignment"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex bg-white border rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 px-4 py-2 rounded-md text-sm ${activeTab === "assignments"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600"
              }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex-1 px-4 py-2 rounded-md text-sm ${activeTab === "quizzes"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600"
              }`}
          >
            Quizzes
          </button>
        </div>

        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className="w-full sm:w-64 border rounded-lg px-4 py-2"
        >
          <option value="all">All Lessons</option>
          <option value="react">React</option>
          <option value="redux">Redux</option>
        </select>
      </div>

      {/* Assignments Grid */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredData.map((item) => (
            <Card
              key={item._id}
              className="shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <div className="flex justify-between gap-3">
                  <h3 className="font-bold text-lg truncate">{item.title}</h3>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-500">
                  {item.description || "No description"}
                </p>

                {/* Info */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      {item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{item.totalMarks} Marks</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Table */}
      {activeTab === "quizzes" && (
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {filteredData.map((quiz) => (
              <div
                key={quiz._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b"
              >
                <div className="md:col-span-4">
                  <h3 className="font-bold">{quiz.title}</h3>
                </div>

                <div className="md:col-span-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {quiz.dueDate
                    ? new Date(quiz.dueDate).toLocaleDateString()
                    : "N/A"}
                </div>

                <div className="md:col-span-3">
                  <Badge className={getStatusColor(quiz.status)}>
                    {quiz.status}
                  </Badge>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button onClick={() => openEditModal(quiz)}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDeleteDialog(quiz)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AssessmentForm
          initialData={selectedAssessment}
          onSubmit={handleAssessmentSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          batches={batches}
        />
      </Modal>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />

      <SubmissionListModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        assessmentId={selectedAssessmentId}
      />
    </div>
  );
};

export default AssessmentManagement;
