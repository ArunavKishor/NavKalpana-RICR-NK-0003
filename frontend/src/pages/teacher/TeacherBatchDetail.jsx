import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  BookOpen,
  Zap,
  Download,
  PenTool,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import AttendanceModal from "@/components/teacher/AttendanceModal";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const TeacherBatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [attendanceForm, setAttendanceForm] = useState({});
  const [attendanceRemarks, setAttendanceRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendancePagination, setAttendancePagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [contentList, setContentList] = useState([]);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const [batchRes, studentsRes] = await Promise.all([
        api.get(`/api/batches/${batchId}`),
        api.get(`/api/batches/${batchId}/students`),
      ]);

      await fetchAttendanceHistory(1);

      const batchData = batchRes?.data?.data;
      setBatch(batchData);
      const studentsList = studentsRes?.data?.data?.students || [];
      setStudents(studentsList);
      setContentList(batchData?.content || []);

      // Initialize attendance form with "present" for all students
      const initialForm = {};
      studentsList.forEach((s) => {
        initialForm[s._id] = "present";
      });
      setAttendanceForm(initialForm);
    } catch (err) {
      console.error("Load batch detail failed:", err);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceRemarks.trim()) {
      toast.error("Please add remarks before submitting attendance");
      return;
    }

    try {
      setIsSaving(true);
      const records = students.map((s) => ({
        student: s._id,
        batch: batchId,
        date: attendanceDate,
        status: attendanceForm[s._id] || "present",
        remarks: attendanceRemarks,
      }));

      // Create attendance records in one batch request
      await api.post("/api/attendance", { records });

      toast.success("Attendance saved successfully");
      setAttendanceRemarks("");
      await loadBatchData();
      setActiveTab("attendance-history");
    } catch (err) {
      console.error("Save attendance failed:", err);
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      setIsSavingContent(true);
      await api.put(`/api/batches/${batchId}`, { content: contentList });
      toast.success("Content updated successfully");
    } catch (err) {
      toast.error("Failed to update content");
    } finally {
      setIsSavingContent(false);
    }
  };

  const addContentSection = () => {
    setContentList([...contentList, { title: "New Section", body: "Section content..." }]);
  };

  const updateContentItem = (index, field, value) => {
    const newList = [...contentList];
    newList[index][field] = value;
    setContentList(newList);
  };

  const removeContentItem = (index) => {
    setContentList(contentList.filter((_, i) => i !== index));
  };

  const handleExportAttendance = async () => {
    try {
      const response = await api.get(
        `/api/attendance/export?batch=${batchId}`,
        {
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_${batch?.name || batchId}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Attendance exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(err.response?.data?.message || "Failed to export attendance");
    }
  };

  const getAttendanceStats = () => {
    const stats = { present: 0, absent: 0, late: 0 };
    attendanceHistory.forEach((r) => {
      stats[r.status] = (stats[r.status] || 0) + 1;
    });
    return [
      { name: "Present", value: stats.present, color: "#10b981" },
      { name: "Absent", value: stats.absent, color: "#ef4444" },
      { name: "Late", value: stats.late, color: "#f59e0b" },
    ].filter((s) => s.value > 0);
  };

  const getBatchAnalytics = () => {
    const uniqueDates = new Set(
      attendanceHistory.map((r) => new Date(r.date).toDateString()),
    );
    const sessionCount = uniqueDates.size;
    const presentCount = attendanceHistory.filter(
      (r) => r.status === "present",
    ).length;
    const attendanceRate =
      attendanceHistory.length > 0
        ? Math.round((presentCount / attendanceHistory.length) * 100)
        : 0;
    return { sessionCount, attendanceRate };
  };

  const fetchAttendanceHistory = async (page = 1) => {
    try {
      setIsAttendanceLoading(true);
      const { data } = await api.get(`/api/attendance?batch=${batchId}&page=${page}&limit=10`);
      setAttendanceHistory(data?.data?.records || []);
      setAttendancePagination(data?.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error("Fetch attendance history failed:", err);
      toast.error("Failed to load attendance history");
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="ml-auto h-10 w-40 rounded-lg" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-slate-200">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Batch not found</p>
        <Button
          onClick={() => navigate("/teacher-dashboard/batches")}
          variant="outline"
          className="mt-4"
        >
          Back to Batches
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => navigate("/teacher-dashboard/batches")}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{batch.name}</h1>
          <p className="text-slate-500">{batch.course}</p>
        </div>
        <Button
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setIsAttendanceModalOpen(true)}
        >
          <Zap className="w-4 h-4 mr-2" />
          Quick Attendance
        </Button>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">
                {students.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {batch.status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {batch.progress || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "details"
              ? "text-blue-600 border-blue-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Batch Details
          </button>
          <button
            onClick={() => setActiveTab("mark-attendance")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "mark-attendance"
              ? "text-blue-600 border-blue-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab("manage-content")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "manage-content"
              ? "text-blue-600 border-blue-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Manage Content
          </button>
          <button
            onClick={() => setActiveTab("attendance-history")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "attendance-history"
              ? "text-blue-600 border-blue-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "analytics"
              ? "text-blue-600 border-blue-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Start Date</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(batch.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">End Date</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(batch.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Instructor</p>
              <p className="text-lg font-semibold text-slate-900">
                {batch.instructorName ||
                  batch.instructor?.user?.fullName ||
                  "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Type</p>
              <p className="text-lg font-semibold text-slate-900">
                {batch.type || "Standard"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "mark-attendance" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Mark Attendance
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-slate-700">Date:</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-48"
              />
            </div>

            {students.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No students enrolled in this batch
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {student.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.enrollmentId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {["present", "absent", "late"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleAttendanceStatusChange(student._id, status)
                          }
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${attendanceForm[student._id] === status
                            ? status === "present"
                              ? "bg-emerald-500 text-white"
                              : status === "absent"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Remarks Section */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={attendanceRemarks}
                onChange={(e) => setAttendanceRemarks(e.target.value)}
                placeholder="Add any remarks about today's session (mandatory)..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <p className="text-xs text-slate-500">
                (Remarks are mandatory before submission)
              </p>
            </div>

            <Button
              onClick={handleSaveAttendance}
              disabled={isSaving || students.length === 0}
              className="mt-6 w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "manage-content" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Course Content</h2>
            <Button
              onClick={handleSaveContent}
              disabled={isSavingContent}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSavingContent ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Content</>}
            </Button>
          </div>
          <div className="space-y-6">
            {contentList.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border relative group">
                <button
                  onClick={() => removeContentItem(index)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded hidden group-hover:block"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <Input
                  value={item.title}
                  onChange={(e) => updateContentItem(index, 'title', e.target.value)}
                  className="font-semibold mb-2 bg-white"
                  placeholder="Section Title"
                />
                <textarea
                  value={item.body}
                  onChange={(e) => updateContentItem(index, 'body', e.target.value)}
                  className="w-full p-2 text-sm text-slate-600 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Section content..."
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addContentSection}
              className="w-full border-dashed border-2 py-8 hover:bg-slate-50 transition"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Add New Section
            </Button>
          </div>
        </div>
      )}

      {activeTab === "attendance-history" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Attendance History</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAttendance}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
          {attendanceHistory.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No attendance records yet
            </p>
          ) : (
            <div className={`overflow-x-auto relative ${isAttendanceLoading ? "opacity-50" : ""}`}>
              {isAttendanceLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {record.student?.user?.fullName || "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {attendancePagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing page {attendancePagination.page} of {attendancePagination.totalPages} ({attendancePagination.total} records)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={attendancePagination.page === 1 || isAttendanceLoading}
                  onClick={() => fetchAttendanceHistory(attendancePagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={attendancePagination.page === attendancePagination.totalPages || isAttendanceLoading}
                  onClick={() => fetchAttendanceHistory(attendancePagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-6 text-center">
              Batch Attendance Distribution
            </h3>
            <div className="h-64 w-full" style={{ minHeight: "250px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={getAttendanceStats()}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getAttendanceStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                Present
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Absent
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Late
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">
              Module-wise Breakdown
            </h3>
            <div className="space-y-4">
              {(batch.content || []).map((module, idx) => {
                const { sessionCount, attendanceRate } = getBatchAnalytics();
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold">{module.title}</p>
                      <Badge variant="outline">Module {idx + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-center">
                      <div className="p-2 bg-white rounded border border-slate-100">
                        <p className="text-slate-400">Sessions</p>
                        <p className="text-slate-900">{sessionCount}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-100">
                        <p className="text-emerald-400">Avg Presence</p>
                        <p className="text-emerald-600">{attendanceRate}%</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-100">
                        <p className="text-slate-400">Content</p>
                        <p className="text-slate-900">
                          {module.body.length > 20
                            ? module.body.substring(0, 20) + "..."
                            : module.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!batch.content || batch.content.length === 0) && (
                <p className="text-center text-slate-500 py-8">
                  No course content/modules defined
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        batch={batch}
        onSaveSuccess={loadBatchData}
      />
    </div>
  );
};

export default TeacherBatchDetail;
