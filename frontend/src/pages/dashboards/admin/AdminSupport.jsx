import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Pencil,
  Trash2,
  ChevronRight,
  User,
  Calendar,
  Send,
  Upload,
  FileText,
  X,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  HelpCircle,
  LifeBuoy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../config/Api";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/admin/AdminModal";
import SupportRequestForm from "@/components/admin/AdminSupportForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";

const normalizeStatus = (status) => {
  if (!status) return "OPEN";
  const s = status.toUpperCase().replace(/\s+/g, "_");
  if (s === "IN_PROGRESS" || s === "INPROGRESS") return "IN_PROGRESS";
  if (s === "RESOLVED") return "RESOLVED";
  if (s === "CLOSED") return "RESOLVED"; // Normalize closed to resolved for UI
  return "OPEN";
};

const getStatusConfig = (status) => {
  switch (normalizeStatus(status)) {
    case "OPEN":
      return {
        color: "text-rose-600 bg-rose-50 border-rose-100",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Open"
      };
    case "IN_PROGRESS":
      return {
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "In Progress"
      };
    case "RESOLVED":
      return {
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: "Resolved"
      };
    default:
      return {
        color: "text-slate-600 bg-slate-50 border-slate-100",
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        label: status
      };
  }
};

const getPriorityConfig = (priority) => {
  switch (priority?.toUpperCase()) {
    case "URGENT":
      return "bg-rose-500 text-white shadow-rose-100";
    case "HIGH":
      return "bg-orange-500 text-white shadow-orange-100";
    case "MEDIUM":
      return "bg-indigo-500 text-white shadow-indigo-100";
    case "LOW":
      return "bg-emerald-500 text-white shadow-emerald-100";
    default:
      return "bg-slate-500 text-white shadow-slate-100";
  }
};

const SupportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reply states
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyRequest, setReplyRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Resolution states
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveRequest, setResolveRequest] = useState(null);
  const [resolveMessage, setResolveMessage] = useState("");
  const [resolveFile, setResolveFile] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Backup Class states
  const [backupClassModalOpen, setBackupClassModalOpen] = useState(false);
  const [backupClassRequest, setBackupClassRequest] = useState(null);
  const [backupClassDate, setBackupClassDate] = useState("");
  const [backupClassTopic, setBackupClassTopic] = useState("");
  const [backupClassLink, setBackupClassLink] = useState("");
  const [isSchedulingBackupClass, setIsSchedulingBackupClass] = useState(false);

  // Dropdown options
  const [studentOptions, setStudentOptions] = useState([]);
  const filters = ["All", "OPEN", "IN_PROGRESS", "RESOLVED"];
  const priorities = ["All", "URGENT", "HIGH", "MEDIUM", "LOW"];

  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    loadSupportRequests();
    loadStudents();
  }, []);

  const loadSupportRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/support");
      const fetchedRequests = data?.data || [];
      setRequests(fetchedRequests);

      // Calculate stats
      const newStats = {
        total: fetchedRequests.length,
        urgent: fetchedRequests.filter((r) => r.priority === "URGENT").length,
        inProgress: fetchedRequests.filter(
          (r) => normalizeStatus(r.status) === "IN_PROGRESS",
        ).length,
        resolved: fetchedRequests.filter(
          (r) => normalizeStatus(r.status) === "RESOLVED",
        ).length,
      };
      setStats(newStats);
      setError(null);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Failed to fetch support requests. Please try again later.");
      toast.error("Error loading support requests");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/api/students");
      const students = Array.isArray(data) ? data : data?.data || [];
      setStudentOptions(
        students.map((s) => ({
          value: s._id,
          label: s.user?.fullName || "Unknown Student",
        })),
      );
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  const handleSupportFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (modalMode === "create") {
        await api.post("/api/support", formData);
        toast.success("Support request created successfully");
      } else {
        await api.put(`/api/support/${selectedRequest._id}`, formData);
        toast.success("Support request updated successfully");
      }

      setIsModalOpen(false);
      loadSupportRequests();
    } catch (err) {
      console.error("Submit failed:", err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || "Failed to save request");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/support/${requestToDelete._id}`);
      toast.success("Support request deleted successfully");
      setDeleteDialogOpen(false);
      loadSupportRequests();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete support request");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResolve = (request) => {
    setResolveRequest(request);
    setResolveMessage("");
    setResolveFile(null);
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    try {
      setIsResolving(true);
      const formData = new FormData();
      formData.append("message", resolveMessage.trim() || "Request resolved");
      if (resolveFile) {
        formData.append("file", resolveFile);
      }

      await api.post(`/api/support/${resolveRequest._id}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Request marked as resolved");
      setResolveModalOpen(false);
      loadSupportRequests();
    } catch (err) {
      console.error("Resolve failed:", err);
      toast.error(err.response?.data?.message || "Failed to resolve request");
    } finally {
      setIsResolving(false);
    }
  };

  const handleScheduleBackupClass = (request) => {
    setBackupClassRequest(request);
    setBackupClassDate("");
    setBackupClassTopic(request.subject || "");
    setBackupClassLink("");
    setBackupClassModalOpen(true);
  };

  const handleConfirmBackupClass = async () => {
    if (!backupClassDate || !backupClassTopic) {
      toast.error("Please fill in date and topic");
      return;
    }

    try {
      setIsSchedulingBackupClass(true);
      await api.post(`/api/support/${backupClassRequest._id}/schedule-backup`, {
        date: backupClassDate,
        topic: backupClassTopic,
        link: backupClassLink,
      });

      toast.success("Backup class scheduled successfully");
      setBackupClassModalOpen(false);
      loadSupportRequests();
    } catch (err) {
      console.error("Scheduling failed:", err);
      toast.error(err.response?.data?.message || "Failed to schedule class");
    } finally {
      setIsSchedulingBackupClass(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedRequest(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (request) => {
    setModalMode("edit");
    setSelectedRequest(request);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const openReplyModal = (request) => {
    setReplyRequest(request);
    setReplyMessage("");
    setReplyFile(null);
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() && !replyFile) return;

    try {
      setIsSendingReply(true);
      const formData = new FormData();
      formData.append("message", replyMessage.trim() || "");
      if (replyFile) {
        formData.append("file", replyFile);
      }

      const { data } = await api.post(
        `/api/support/${replyRequest._id}/respond`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success("Reply sent successfully");
      setReplyRequest(data?.data || replyRequest);
      setReplyMessage("");
      setReplyFile(null);
      await loadSupportRequests();
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 space-y-8">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-rose-100/30 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-indigo-100/30 blur-[120px] rounded-full -z-10" />

      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-200">
                <LifeBuoy className="w-6 h-6 text-white" />
              </div>
              <Badge variant="outline" className="border-rose-200 text-rose-600 bg-rose-50/50">
                Support Hub
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Support <span className="text-rose-600">Intelligence</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Manage student queries and service requests with efficiency.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={openCreateModal}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Request
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Total Queries", value: stats.total, icon: MessageSquare, color: "rose", bg: "bg-rose-500" },
            { label: "Urgent", value: stats.urgent, icon: AlertCircle, color: "orange", bg: "bg-orange-500" },
            { label: "Active", value: stats.inProgress, icon: Clock, color: "indigo", bg: "bg-indigo-500" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "emerald", bg: "bg-emerald-500" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-2xl shadow-lg shadow-${stat.color}-100 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-20 z-10"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by student, subject, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-rose-500/20 transition-all text-slate-700 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeFilter === filter
                      ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {filter === "All" ? "All Status" : filter.replace("_", " ")}
                </button>
              ))}
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p === "All" ? "All Priority" : p}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Synchronizing Support Data...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] py-20 text-center"
          >
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LifeBuoy className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Clean Slate</h3>
            <p className="text-slate-500 max-w-xs mx-auto">No support requests match your criteria.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request, idx) => {
              const statusConfig = getStatusConfig(request.status);
              return (
                <motion.div
                  key={request._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500 rounded-[2.5rem] bg-white">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        {/* Status Column */}
                        <div className="lg:w-72 p-8 flex flex-col justify-between bg-slate-50/50 group-hover:bg-rose-50/20 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge className={`${getPriorityConfig(request.priority)} border-none px-3 py-1 font-bold tracking-tight rounded-lg`}>
                                {request.priority}
                              </Badge>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{request._id?.slice(-6)}</span>
                            </div>
                            <Badge className={`${statusConfig.color} border-none font-bold py-1.5 px-4 rounded-xl flex items-center gap-2 w-fit mb-4`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                               <Calendar className="w-5 h-5 text-indigo-500" />
                             </div>
                             <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Submitted</p>
                               <p className="text-sm font-bold text-slate-700">{new Date(request.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 p-8">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                                {request.subject}
                              </h3>
                              <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                {request.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200 overflow-hidden">
                                {request.student?.user?.profilePicture ? (
                                    <img src={request.student.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-rose-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Requested By</p>
                                <p className="text-sm font-bold text-slate-900 italic">{request.student?.user?.fullName || "Anonymous Student"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Discussion</p>
                                <p className="text-sm font-bold text-slate-900">{request.responses?.length || 0} Responses</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Column */}
                        <div className="lg:w-48 p-8 flex lg:flex-col justify-center gap-3 bg-slate-50/30">
                          <Button 
                            onClick={() => openReplyModal(request)}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-5 rounded-2xl border-none shadow-none"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                          
                          {normalizeStatus(request.status) !== "RESOLVED" && (
                            <Button 
                              onClick={() => handleResolve(request)}
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-5 rounded-2xl border-none shadow-none"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          )}

                          <div className="flex gap-2">
                            <button 
                                onClick={() => openEditModal(request)}
                                className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex justify-center"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => openDeleteDialog(request)}
                                className="flex-1 p-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl transition-colors flex justify-center"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Open New Ticket" : "Refine Ticket"}
        className="max-w-2xl rounded-[3rem]"
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
        title="Burn Ticket?"
        description={`This will permanently delete the ticket "${requestToDelete?.subject}". This action is irreversible.`}
        isLoading={isDeleting}
      />

      {/* Modernized Reply Modal */}
      <AnimatePresence>
        {replyModalOpen && replyRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplyModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white"
            >
              {/* Reply Header */}
              <div className="p-8 pb-4 border-b border-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">{replyRequest.subject}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getPriorityConfig(replyRequest.priority)} border-none font-bold`}>
                        {replyRequest.priority}
                      </Badge>
                      <Badge variant="outline" className="text-slate-500 font-bold">
                        {replyRequest.student?.user?.fullName}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Chat-like Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                {/* Original Message */}
                <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-600 uppercase">Original Request</p>
                      <p className="text-xs font-bold text-rose-400">{new Date(replyRequest.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{replyRequest.description}</p>
                </div>

                {/* History */}
                <div className="space-y-4">
                   {replyRequest.responses?.map((resp, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100 ml-12"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
                          <LifeBuoy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase">Assistant Response</p>
                          <p className="text-xs font-bold text-indigo-400">{new Date(resp.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-slate-700 font-medium">{resp.message}</p>
                    </motion.div>
                  ))}
                  {(!replyRequest.responses || replyRequest.responses.length === 0) && (
                    <div className="py-8 text-center text-slate-400 italic font-medium">No prior responses.</div>
                  )}
                </div>
              </div>

              {/* Reply Input Area */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 rounded-b-[3rem]">
                <div className="relative mb-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Engage with the student..."
                    rows={3}
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-slate-700 font-medium placeholder:text-slate-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-500/5 transition-all outline-none resize-none"
                  />
                  
                  {/* Floating Action Buttons inside Input */}
                  <div className="flex items-center gap-2 mt-4">
                    <label className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl cursor-pointer transition-colors shadow-sm border border-slate-100">
                      <Upload className="w-4 h-4" />
                      {replyFile ? replyFile.name.slice(0, 15) + "..." : "Attach File"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    
                    {replyFile && (
                      <button onClick={() => setReplyFile(null)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex-1" />
                    
                    <Button
                      onClick={handleSendReply}
                      disabled={isSendingReply || (!replyMessage.trim() && !replyFile)}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-2xl shadow-lg shadow-rose-200 group h-full"
                    >
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {isSendingReply ? "Syncing..." : "Transmit Response"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simple Modals for Resolve and Backup (Condensed versions of above style) */}
      <AnimatePresence>
        {resolveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResolveModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Finalize Ticket</h3>
                            <p className="text-slate-500 text-sm font-medium">Summarize the resolution.</p>
                        </div>
                    </div>
                    
                    <textarea 
                        value={resolveMessage}
                        onChange={(e) => setResolveMessage(e.target.value)}
                        placeholder="What was the outcome?"
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 mb-4 h-24 resize-none"
                    />

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setResolveModalOpen(false)} className="flex-1 py-6 rounded-2xl font-bold">Cancel</Button>
                        <Button onClick={handleConfirmResolve} disabled={isResolving} className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200">
                            {isResolving ? "Resolving..." : "Confirm Closure"}
                        </Button>
                    </div>
                 </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportRequests;
