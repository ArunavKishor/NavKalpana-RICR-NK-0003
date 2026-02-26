import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import api from "@/config/Api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const getAttachmentType = (url) => {
  if (!url) return "link";
  const lower = url.toLowerCase().split("?")[0];
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) return "image";
  if (/\.pdf$/.test(lower)) return "pdf";
  return "link";
};

const TeacherSupport = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [solutionUrl, setSolutionUrl] = useState("");
  const [solutionFile, setSolutionFile] = useState(null);
  const [backupData, setBackupData] = useState({
    date: "",
    topic: "",
    meetingLink: "",
  });
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: "",
    subject: "",
    description: "",
    category: "academic",
    priority: "medium",
  });
  const [students, setStudents] = useState([]);
  const [supportStats, setSupportStats] = useState({
    avgResponseTime: "—",
    resolutionRate: 0,
    inProgressCount: 0,
    resolvedCount: 0,
  });

  const filters = ["All", "OPEN", "IN_PROGRESS", "RESOLVED"];
  const priorities = ["All", "URGENT", "HIGH", "MEDIUM", "LOW"];
  const categories = [
    "All",
    "TECHNICAL",
    "ACADEMIC",
    "ADMINISTRATIVE",
    "OTHER",
  ];

  const normalizeStatus = (status) =>
    status ? status.toUpperCase().replace("-", "_") : "";

  useEffect(() => {
    loadSupportRequests();
    loadSupportStats();
  }, [
    activeFilter,
    selectedPriority,
    selectedCategory,
    searchQuery,
    filterCourse,
    filterTopic,
  ]);

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/api/students", {
        params: { limit: 100, status: "active" },
      });
      setStudents(data?.data?.students || []);
    } catch (err) {
      console.error("Load students failed:", err);
    }
  };

  const loadSupportStats = async () => {
    try {
      const { data } = await api.get("/api/support/statistics");
      const d = data?.data || {};
      const avgMs = d.averageResponseTimeMs || 0;
      const avgHours = avgMs > 0 ? (avgMs / 3600000).toFixed(1) : "—";
      setSupportStats({
        avgResponseTime: avgMs > 0 ? `${avgHours}h` : "—",
        resolutionRate: Math.round(d.resolutionRate || 0),
        inProgressCount: d.statusCounts?.["in-progress"] || 0,
        resolvedCount: d.statusCounts?.resolved || 0,
      });
    } catch {
      // keep defaults
    }
  };

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
      const categoryParam =
        selectedCategory === "All" ? undefined : selectedCategory.toLowerCase();

      const { data: requestsRes } = await api.get("/api/support", {
        params: {
          status: statusParam,
          priority: priorityParam,
          category: categoryParam,
          search: searchQuery || undefined,
          course: filterCourse.trim() || undefined,
          topic: filterTopic.trim() || undefined,
        },
      });

      const list = requestsRes?.data?.requests || [];
      setRequests(list);

      setStats((prev) => ({
        ...prev,
        total: list.length,
        urgent: list.filter((r) => r.priority === "urgent").length,
        inProgress: list.filter((r) => r.status === "in-progress").length,
        resolved: list.filter((r) => r.status === "resolved").length,
      }));
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
    const matchesCategory =
      selectedCategory === "All" ||
      request.category?.toUpperCase() === selectedCategory;
    return matchesFilter && matchesSearch && matchesPriority && matchesCategory;
  });

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

  const openReplyDialog = (request) => {
    setActiveRequest(request);
    setReplyMessage("");
    setReplyDialogOpen(true);
  };

  const openResolveDialog = (request) => {
    setActiveRequest(request);
    setSolutionUrl("");
    setSolutionFile(null);
    setResolveDialogOpen(true);
  };

  const openBackupDialog = (request) => {
    setActiveRequest(request);
    setBackupData({
      date: "",
      topic: request.subject || "",
      meetingLink: "",
    });
    setBackupDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCreateForm({
      studentId: "",
      subject: "",
      description: "",
      category: "academic",
      priority: "medium",
      course: "",
      topic: "",
    });
    setCreateDialogOpen(true);
    loadStudents();
  };

  const handleCreate = async () => {
    const subject = createForm.subject.trim();
    const description = createForm.description.trim();

    if (!createForm.studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!subject) {
      toast.error("Subject is required");
      return;
    }
    if (subject.length < 5) {
      toast.error("Subject must be at least 5 characters");
      return;
    }
    if (!description) {
      toast.error("Description is required");
      return;
    }
    if (description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    try {
      setDialogSubmitting(true);
      await api.post("/api/support", {
        student: createForm.studentId,
        subject,
        description,
        category: createForm.category,
        priority: createForm.priority,
        course: createForm.course.trim() || undefined,
        topic: createForm.topic.trim() || undefined,
      });
      toast.success("Support request created");
      setCreateDialogOpen(false);
      await loadSupportRequests();
    } catch (err) {
      console.error("Create support request failed:", err);
      const errData = err.response?.data;
      if (errData?.errors && Array.isArray(errData.errors)) {
        errData.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(errData?.message || "Failed to create support request");
      }
    } finally {
      setDialogSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!activeRequest || !replyMessage.trim()) return;
    try {
      setDialogSubmitting(true);
      await api.post(`/api/support/${activeRequest._id}/respond`, {
        message: replyMessage.trim(),
      });
      toast.success("Reply sent");
      const newReply = {
        message: replyMessage.trim(),
        createdAt: new Date().toISOString(),
      };

      // Optimistically update local state so the reply shows immediately
      setRequests((prev) =>
        prev.map((req) =>
          req._id === activeRequest._id
            ? {
              ...req,
              responses: [...(req.responses || []), newReply],
            }
            : req,
        ),
      );

      setActiveRequest((prev) =>
        prev
          ? {
            ...prev,
            responses: [...(prev.responses || []), newReply],
          }
          : prev,
      );

      setReplyDialogOpen(false);
      setReplyMessage("");
      // Also refresh from server in background to stay in sync
      loadSupportRequests();
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error("Failed to send reply");
    } finally {
      setDialogSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!activeRequest) return;
    try {
      setDialogSubmitting(true);
      if (solutionFile) {
        const formData = new FormData();
        formData.append("file", solutionFile);
        await api.put(`/api/support/${activeRequest._id}/resolve`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/api/support/${activeRequest._id}/resolve`, {
          solutionFileUrl: solutionUrl || undefined,
        });
      }
      toast.success("Request marked as resolved");
      setResolveDialogOpen(false);
      await loadSupportRequests();
    } catch (err) {
      console.error("Resolve failed:", err);
      toast.error("Failed to resolve request");
    } finally {
      setDialogSubmitting(false);
    }
  };

  const handleScheduleBackup = async () => {
    if (!activeRequest || !backupData.date || !backupData.topic.trim()) {
      return;
    }
    try {
      setDialogSubmitting(true);
      await api.post(
        `/api/support/${activeRequest._id}/schedule-backup-class`,
        backupData,
      );
      toast.success("Backup class scheduled");
      setBackupDialogOpen(false);
      await loadSupportRequests();
    } catch (err) {
      console.error("Schedule backup failed:", err);
      toast.error("Failed to schedule backup class");
    } finally {
      setDialogSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Requests</h1>
          <p className="text-slate-500 mt-1 text-sm">
            l
          </p>
        </div>
        <Button
          className="w-full sm:w-auto bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] hover:shadow-lg text-white px-7 py-6 rounded-2xl font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5"
          onClick={openCreateDialog}
        >
          <MessageSquare className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          iconBg="from-blue-500 to-blue-600"
          shadowColor="shadow-blue-200"
          label="Total Requests"
          value={stats.total}
          loading={loading}
        />
        <StatsCard
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          iconBg="from-red-500 to-red-600"
          shadowColor="shadow-red-200"
          label="Urgent"
          value={stats.urgent}
          loading={loading}
        />
        <StatsCard
          icon={<Clock className="w-6 h-6 text-white" />}
          iconBg="from-amber-500 to-amber-600"
          shadowColor="shadow-amber-200"
          label="Avg Response"
          value={supportStats.avgResponseTime}
          loading={loading}
        />
        <StatsCard
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          iconBg="from-emerald-500 to-emerald-600"
          shadowColor="shadow-emerald-200"
          label="Resolution Rate"
          value={`${supportStats.resolutionRate}%`}
          loading={loading}
        />
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by subject, student name, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-11 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0F4C5C]/30"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeFilter === filter
                  ? "bg-[#0F4C5C] text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
              >
                {filter === "IN_PROGRESS" ? "IN PROGRESS" : filter}
              </button>
            ))}
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>

          <input
            type="text"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            placeholder="Course..."
            className="h-9 px-3 border border-slate-200 rounded-xl text-xs bg-white w-32 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
          />
          <input
            type="text"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            placeholder="Topic..."
            className="h-9 px-3 border border-slate-200 rounded-xl text-xs bg-white w-32 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-slate-100" />
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-3.5 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-xl" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No requests found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const statusNorm = normalizeStatus(request.status);
            const priorityUp = request.priority?.toUpperCase();
            return (
              <div
                key={request._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0F4C5C]/20 transition-all duration-300 overflow-hidden"
              >
                {/* Accent bar keyed to priority */}
                <div className={`h-1 w-full ${priorityUp === "URGENT" ? "bg-red-500" :
                  priorityUp === "HIGH" ? "bg-orange-400" :
                    priorityUp === "MEDIUM" ? "bg-amber-400" :
                      "bg-slate-300"
                  }`} />

                <div className="p-5 sm:p-6">
                  {/* Title row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F4C5C] to-[#1a7a8f] flex items-center justify-center shrink-0 shadow-md shadow-[#0F4C5C]/20">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">{request.subject}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700">{request.student?.user?.fullName || "Unknown"}</span>
                          {request.student?.user?.email && (
                            <span className="text-slate-400"> · {request.student.user.email}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(statusNorm)} border px-3 py-1 font-bold text-[11px] flex items-center gap-1 shrink-0 uppercase`}>
                      {getStatusIcon(statusNorm)}
                      {statusNorm.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Pill badges row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${getPriorityColor(priorityUp)} px-2.5 py-1 text-[11px] font-black uppercase`}>
                      {priorityUp}
                    </Badge>
                    {request.category && (
                      <Badge className="bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-bold uppercase">
                        {request.category}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                      <MessageSquare className="w-3 h-3 text-blue-500" />
                      {request.responses?.length || 0} replies
                    </span>
                    <span className="flex items-center gap-1 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                      <Calendar className="w-3 h-3 text-violet-500" />
                      {new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {request.backupClassSchedule && (
                      <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        Backup: {new Date(request.backupClassSchedule.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{request.description}</p>

                  {/* Latest Reply Preview */}
                  {request.responses?.length > 0 && (() => {
                    const lastReply = request.responses[request.responses.length - 1];
                    return (
                      <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Latest reply</span>
                          <span className="text-[10px] text-slate-400">
                            {lastReply.createdAt ? new Date(lastReply.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : ""}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2">{lastReply.message}</p>
                      </div>
                    );
                  })()}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-slate-200 text-slate-700 hover:bg-[#0F4C5C] hover:text-white hover:border-[#0F4C5C] font-semibold transition-all"
                      onClick={() => openReplyDialog(request)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-semibold transition-all"
                      onClick={() => openResolveDialog(request)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-semibold transition-all"
                      onClick={() => openBackupDialog(request)}
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Schedule Backup
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <DialogHeader className="px-7 py-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white">
            <DialogTitle className="text-xl font-bold">Reply to Student</DialogTitle>
            <p className="text-teal-50/70 text-sm mt-0.5 truncate">{activeRequest?.subject}</p>
          </DialogHeader>
          <div className="p-6 space-y-4 bg-white">
            {activeRequest?.responses?.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                {activeRequest.responses.map((resp, idx) => (
                  <div key={idx} className="rounded-xl bg-white px-4 py-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#0F4C5C] uppercase tracking-wide">Teacher reply</span>
                      <span className="text-[10px] text-slate-400">
                        {resp.createdAt ? new Date(resp.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{resp.message}</p>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              rows={4}
              placeholder="Type your response..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="bg-slate-50 border-none rounded-xl resize-none focus:ring-2 focus:ring-[#0F4C5C]/30"
            />
          </div>
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" type="button" className="rounded-xl font-bold text-slate-500" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleReply} disabled={dialogSubmitting} className="bg-[#0F4C5C] hover:bg-[#1a7a8f] text-white rounded-xl px-8 font-bold">
              {dialogSubmitting ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <DialogHeader className="px-7 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
            <DialogTitle className="text-xl font-bold">Mark as Resolved</DialogTitle>
            <p className="text-emerald-50/70 text-sm mt-0.5">Attach a solution or simply confirm resolution</p>
          </DialogHeader>
          <div className="p-6 bg-white space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Solution File</label>
              <Input
                type="file"
                onChange={(e) => {
                  setSolutionFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setSolutionUrl("");
                }}
                className="bg-slate-50 border-none rounded-xl h-11"
              />
              {solutionFile && (
                <p className="text-xs text-slate-500 pl-1">Selected: {solutionFile.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs font-bold text-slate-400">OR</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Solution URL</label>
              <Input
                placeholder="Paste a Drive, GitHub, or other link"
                value={solutionUrl}
                onChange={(e) => { setSolutionUrl(e.target.value); if (e.target.value) setSolutionFile(null); }}
                disabled={!!solutionFile}
                className="bg-slate-50 border-none rounded-xl h-11"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" type="button" className="rounded-xl font-bold text-slate-500" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleResolve} disabled={dialogSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-bold">
              {dialogSubmitting ? "Resolving..." : "Mark Resolved"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Class Dialog */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <DialogHeader className="px-7 py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <DialogTitle className="text-xl font-bold">Schedule Backup Class</DialogTitle>
            <p className="text-blue-50/70 text-sm mt-0.5 truncate">{activeRequest?.subject}</p>
          </DialogHeader>
          <div className="p-6 bg-white space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date</label>
              <Input type="date" value={backupData.date} onChange={(e) => setBackupData({ ...backupData, date: e.target.value })} className="bg-slate-50 border-none rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Topic</label>
              <Input placeholder="e.g. React Hooks, Chapter 5" value={backupData.topic} onChange={(e) => setBackupData({ ...backupData, topic: e.target.value })} className="bg-slate-50 border-none rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Meeting Link <span className="text-slate-300 font-normal">(optional)</span></label>
              <Input placeholder="Zoom / Meet link" value={backupData.meetingLink} onChange={(e) => setBackupData({ ...backupData, meetingLink: e.target.value })} className="bg-slate-50 border-none rounded-xl h-11" />
            </div>
          </div>
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" type="button" className="rounded-xl font-bold text-slate-500" onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleScheduleBackup} disabled={dialogSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold">
              {dialogSubmitting ? "Scheduling..." : "Schedule Class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[90vh]">
          <DialogHeader className="px-7 py-6 bg-gradient-to-r from-[#0F4C5C] to-[#1a7a8f] text-white shrink-0">
            <DialogTitle className="text-xl font-bold">Create Support Request</DialogTitle>
            <p className="text-teal-50/70 text-sm mt-0.5">Log a new support ticket on behalf of a student.</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Student</label>
              <select
                className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
                value={createForm.studentId}
                onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.user?.fullName || "Unnamed"} ({s.user?.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject <span className="text-slate-300 font-normal normal-case">(min 5 chars)</span></label>
              <Input value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} placeholder="Short summary of the issue" minLength={5} maxLength={200} className="bg-slate-50 border-none rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description <span className="text-slate-300 font-normal normal-case">(min 10 chars)</span></label>
              <Textarea rows={4} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Detailed description of the doubt or issue" minLength={10} maxLength={2000} className="bg-slate-50 border-none rounded-xl resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                <select className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30" value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}>
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Priority</label>
                <select className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30" value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Course <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
                <Input value={createForm.course} onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })} placeholder="e.g. Full Stack Web" className="bg-slate-50 border-none rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Topic <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
                <Input value={createForm.topic} onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })} placeholder="e.g. React Hooks" className="bg-slate-50 border-none rounded-xl h-11" />
              </div>
            </div>
          </div>
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
            <Button type="button" variant="ghost" className="rounded-xl font-bold text-slate-500" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreate} disabled={dialogSubmitting} className="bg-[#0F4C5C] hover:bg-[#1a7a8f] text-white rounded-xl px-10 font-bold shadow-md shadow-[#0F4C5C]/20">
              {dialogSubmitting ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatsCard = ({ icon, iconBg, shadowColor, label, value, loading }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${iconBg || "from-slate-400 to-slate-500"} flex items-center justify-center shrink-0 shadow-md ${shadowColor || ""} p-3`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-16 mt-1" />
      ) : (
        <p className="text-2xl font-black text-slate-900">{value}</p>
      )}
    </div>
  </div>
);

export default TeacherSupport;
