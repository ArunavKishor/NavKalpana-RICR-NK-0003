import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Eye, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const TeacherAssessmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, [activeTab]);

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

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleViewSubmissions = (assessment) => {
    setSelectedAssessment(assessment);
    // This would open a submissions modal/page
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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-0">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-3 font-medium transition-all border-b-2 ${
            activeTab === "assignments"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-3 font-medium transition-all border-b-2 ${
            activeTab === "quizzes"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          Quizzes
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search assessments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
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
                          {assessment.submissions?.filter(
                            (s) => s.status === "submitted",
                          ).length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Pending</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {assessment.submissions?.filter(
                            (s) => s.status === "pending",
                          ).length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Evaluated</p>
                        <p className="text-lg font-bold text-blue-600">
                          {assessment.submissions?.filter(
                            (s) => s.status === "evaluated",
                          ).length || 0}
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
          <strong>Note:</strong> Assessment creation form would open in a modal
          where teachers can create assignments with file upload requirements
          and quizzes with MCQ questions.
        </p>
      </div>
    </div>
  );
};

export default TeacherAssessmentManagement;
