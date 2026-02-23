import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Modal from "@/components/admin/AdminModal";
import SupportRequestForm from "@/components/admin/AdminSupportForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";

const SupportRequests = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyRequest, setReplyRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
    }
  }, [searchParams]);

  const filters = ["All", "OPEN", "IN_PROGRESS", "RESOLVED"];
  const priorities = ["All", "URGENT", "HIGH", "MEDIUM", "LOW"];

  const normalizeStatus = (status) =>
    status ? status.toUpperCase().replace("-", "_") : "";

  const loadSupportRequests = async () => {
    try {
      setLoading(true);
      const statusParam =
        activeFilter === "All"
          ? undefined
          : activeFilter === "IN_PROGRESS"
            ? "in-progress"
            : activeFilter.toLowerCase();
      const priorityParam =
        selectedPriority === "All" ? undefined : selectedPriority.toLowerCase();

      const { data: requestsRes } = await api.get("/api/support", {
        params: {
          status: statusParam,
          priority: priorityParam,
          search: searchQuery || undefined,
        },
      });

      const list = requestsRes?.data?.requests || [];
      setRequests(list);

      setStats({
        total: list.length,
        urgent: list.filter((r) => r.priority === "urgent").length,
        inProgress: list.filter((r) => r.status === "in-progress").length,
        resolved: list.filter((r) => r.status === "resolved").length,
      });
      setError("");
    } catch (err) {
      console.error("Load support requests failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load support requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportRequests();
  }, [activeFilter, selectedPriority, searchQuery]);

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/api/students", {
        params: { limit: 100, status: "active" },
      });
      setStudentOptions(data?.data?.students || []);
    } catch (err) {
      console.error("Load students failed:", err);
    }
  };

  const handleSupportFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (modalMode === "create") {
        await api.post("/api/support", data);
        toast.success("Support request created successfully");
      } else {
        await api.put(`/api/support/${selectedRequest._id}`, data);
        toast.success("Support request updated successfully");
      }

      setIsModalOpen(false);
      await loadSupportRequests();
    } catch (err) {
      console.error("Support submit failed:", err);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mapped = backendErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFormErrors(mapped);
      }
      toast.error(
        err.response?.data?.message || "Failed to save support request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedRequest(null);
    setFormErrors({});
    setIsModalOpen(true);
    loadStudents();
  };

  const openEditModal = (request) => {
    setModalMode("edit");
    setSelectedRequest(request);
    setFormErrors({});
    setIsModalOpen(true);
    loadStudents();
  };

  const openDeleteDialog = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/support/${requestToDelete._id}`);
      setRequests((prev) =>
        prev.filter((item) => item._id !== requestToDelete._id),
      );
      toast.success("Deleted successfully", { duration: 5000 });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    } catch (err) {
      console.error("Delete support request failed:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to delete support request. Please try again.",
        { duration: 5000 },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResolve = async (request) => {
    if (!window.confirm(`Mark "${request.subject}" as resolved?`)) return;
    try {
      await api.put(`/api/support/${request._id}/resolve`);
      toast.success("Request marked as resolved");
      await loadSupportRequests();
    } catch (err) {
      console.error("Resolve failed:", err);
      toast.error(err.response?.data?.message || "Failed to resolve request");
    }
  };

  const openReplyModal = async (request) => {
    try {
      const { data } = await api.get(`/api/support/${request._id}`);
      setReplyRequest(data?.data || request);
    } catch {
      setReplyRequest(request);
    }
    setReplyMessage("");
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    try {
      setIsSendingReply(true);
      const { data } = await api.post(
        `/api/support/${replyRequest._id}/respond`,
        {
          message: replyMessage.trim(),
        },
      );
      toast.success("Reply sent successfully");
      setReplyRequest(data?.data || replyRequest);
      setReplyMessage("");
      await loadSupportRequests();
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      activeFilter === "All" ||
      normalizeStatus(request.status) === activeFilter;
    const matchesSearch =
      request.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student?.user?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      String(request._id || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === "All" ||
      request.priority?.toUpperCase() === selectedPriority;
    return matchesFilter && matchesSearch && matchesPriority;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-sm text-slate-500">Loading requests...</div>
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
            Support Requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage and respond to student support requests
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
          label="Total"
          value={stats.total}
        />
        <StatsCard
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          label="Urgent"
          value={stats.urgent}
        />
        <StatsCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          label="In Progress"
          value={stats.inProgress}
        />
        <StatsCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          label="Resolved"
          value={stats.resolved}
        />
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject, student name, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "All"
                  ? "All Priorities"
                  : `Priority: ${priority}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No requests found
              </h3>
              <p className="text-slate-500">
                Try adjusting your filters or search terms.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request._id}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-5 sm:p-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold">
                        {request._id}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(
                          request.priority?.toUpperCase(),
                        )} px-2.5 py-1 text-xs font-semibold`}
                      >
                        {request.priority?.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                      {request.subject}
                    </h3>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      normalizeStatus(request.status),
                    )} border px-3 py-1 font-semibold text-xs flex items-center gap-1 shrink-0`}
                  >
                    {getStatusIcon(normalizeStatus(request.status))}
                    {normalizeStatus(request.status)}
                  </Badge>
                </div>

                {/* Student Info */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {request.student?.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {request.student?.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{request.responses?.length || 0} replies</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-4 text-sm line-clamp-2">
                  {request.description}
                </p>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created:{" "}
                      {new Date(request.createdAt).toLocaleDateString("en-US")}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      Updated:{" "}
                      {new Date(request.updatedAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-semibold text-sm"
                      onClick={() => openReplyModal(request)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reply
                    </button>
                    {normalizeStatus(request.status) !== "RESOLVED" &&
                      normalizeStatus(request.status) !== "CLOSED" && (
                        <button
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                          onClick={() => handleResolve(request)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                    <button
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      onClick={() => openEditModal(request)}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm"
                      onClick={() => openDeleteDialog(request)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "New Support Request"
            : "Edit Support Request"
        }
        description={
          modalMode === "create"
            ? "Create a new support ticket on behalf of a student."
            : "Update the support ticket details."
        }
      >
        <SupportRequestForm
          initialData={selectedRequest}
          onSubmit={handleSupportFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          students={studentOptions}
          errors={formErrors}
        />
      </Modal>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Support Request"
        description={`Are you sure you want to delete "${requestToDelete?.subject}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Reply Thread Modal */}
      {replyModalOpen && replyRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setReplyModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {replyRequest.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">
                    {replyRequest.student?.user?.fullName || "Student"}
                  </span>
                  <Badge
                    className={`${getPriorityColor(replyRequest.priority?.toUpperCase())} text-xs`}
                  >
                    {replyRequest.priority?.toUpperCase()}
                  </Badge>
                  <Badge
                    className={`${getStatusColor(normalizeStatus(replyRequest.status))} border text-xs`}
                  >
                    {normalizeStatus(replyRequest.status)}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 ml-2"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            {/* Original Description */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Original Request
              </p>
              <p className="text-sm text-slate-700">
                {replyRequest.description}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(replyRequest.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Responses Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {!replyRequest.responses ||
              replyRequest.responses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No replies yet. Be the first to respond.
                  </p>
                </div>
              ) : (
                replyRequest.responses.map((resp, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">
                          Teacher / Admin
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(resp.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{resp.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors self-end"
                >
                  <Send className="w-4 h-4" />
                  {isSendingReply ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ icon, label, value }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
      <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default SupportRequests;
