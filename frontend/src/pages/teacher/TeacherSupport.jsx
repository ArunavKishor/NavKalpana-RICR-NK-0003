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
  }, [activeFilter, selectedPriority, selectedCategory, searchQuery]);

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
    });
    setCreateDialogOpen(true);
    loadStudents();
  };

  const handleCreate = async () => {
    if (
      !createForm.studentId ||
      !createForm.subject.trim() ||
      !createForm.description.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setDialogSubmitting(true);
      await api.post("/api/support", {
        student: createForm.studentId,
        subject: createForm.subject.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
        priority: createForm.priority,
      });
      toast.success("Support request created");
      setCreateDialogOpen(false);
      await loadSupportRequests();
    } catch (err) {
      console.error("Create support request failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to create support request",
      );
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
      setReplyDialogOpen(false);
      await loadSupportRequests();
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
      await api.put(`/api/support/${activeRequest._id}/resolve`, {
        solutionFileUrl: solutionUrl || undefined,
      });
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
            Review doubts, respond to students, and schedule backup classes.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={openCreateDialog}
        >
          <MessageSquare className="w-4 h-4" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
          label="Total (filtered)"
          value={stats.total}
        />
        <StatsCard
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          label="Urgent"
          value={stats.urgent}
        />
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All"
                  ? "All Categories"
                  : `Category: ${category}`}
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
                      <Badge
                        className={`${getPriorityColor(
                          request.priority?.toUpperCase(),
                        )} px-2.5 py-1 text-xs font-semibold`}
                      >
                        {request.priority?.toUpperCase()}
                      </Badge>
                      {request.category && (
                        <Badge className="bg-slate-100 text-slate-700 px-2 py-1 text-xs font-semibold">
                          {request.category.toUpperCase()}
                        </Badge>
                      )}
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

                {/* Attachment / solution preview */}
                {request.solutionFileUrl &&
                  (() => {
                    const fileType = getAttachmentType(request.solutionFileUrl);
                    return (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          Solution Attachment
                        </p>
                        {fileType === "image" ? (
                          <a
                            href={request.solutionFileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={request.solutionFileUrl}
                              alt="Solution preview"
                              className="max-h-40 rounded-lg border border-slate-200 object-contain cursor-pointer hover:opacity-90"
                            />
                          </a>
                        ) : (
                          <a
                            href={request.solutionFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            {fileType === "pdf" ? "View PDF" : "View File"}
                          </a>
                        )}
                      </div>
                    );
                  })()}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created:{" "}
                      {new Date(request.createdAt).toLocaleDateString("en-US")}
                    </span>
                    {request.backupClassSchedule && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Backup:{" "}
                        {new Date(
                          request.backupClassSchedule.date,
                        ).toLocaleDateString("en-US")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReplyDialog(request)}
                    >
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResolveDialog(request)}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBackupDialog(request)}
                    >
                      Schedule Backup Class
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{activeRequest?.subject}</p>
            <Textarea
              rows={5}
              placeholder="Type your response..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setReplyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReply}
              disabled={dialogSubmitting}
            >
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Resolved</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Optionally attach a solution link (Drive, GitHub, etc.)
            </p>
            <Input
              placeholder="Solution file URL (optional)"
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResolve}
              disabled={dialogSubmitting}
            >
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Class Dialog */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Backup Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={backupData.date}
              onChange={(e) =>
                setBackupData({ ...backupData, date: e.target.value })
              }
            />
            <Input
              placeholder="Topic"
              value={backupData.topic}
              onChange={(e) =>
                setBackupData({ ...backupData, topic: e.target.value })
              }
            />
            <Input
              placeholder="Meeting link (optional)"
              value={backupData.meetingLink}
              onChange={(e) =>
                setBackupData({
                  ...backupData,
                  meetingLink: e.target.value,
                })
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setBackupDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleScheduleBackup}
              disabled={dialogSubmitting}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Request</DialogTitle>
            <DialogDescription>
              Log a new support ticket on behalf of a student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Student</label>
              <select
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                value={createForm.studentId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, studentId: e.target.value })
                }
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.user?.fullName || "Unnamed"} ({s.user?.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={createForm.subject}
                onChange={(e) =>
                  setCreateForm({ ...createForm, subject: e.target.value })
                }
                placeholder="Short summary of the issue"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={4}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Detailed description of the doubt or issue"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, category: e.target.value })
                  }
                >
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  value={createForm.priority}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={dialogSubmitting}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

export default TeacherSupport;
