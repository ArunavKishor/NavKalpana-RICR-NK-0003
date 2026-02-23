import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Users, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const [batchRes, studentsRes, attendanceRes] = await Promise.all([
        api.get(`/api/batches/${batchId}`),
        api.get(`/api/batches/${batchId}/students`),
        api.get(`/api/attendance?batch=${batchId}`),
      ]);

      const batchData = batchRes?.data?.data;
      setBatch(batchData);
      const studentsList = studentsRes?.data?.data?.students || [];
      setStudents(studentsList);
      setAttendanceHistory(attendanceRes?.data?.data?.attendance || []);

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
      const today = new Date().toISOString().split("T")[0];
      const records = students.map((s) => ({
        student: s._id,
        batch: batchId,
        date: today,
        status: attendanceForm[s._id] || "present",
        remarks: attendanceRemarks,
      }));

      // Create attendance records
      await Promise.all(
        records.map((record) => api.post("/api/attendance", record)),
      );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading batch details...</p>
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
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "details"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            Batch Details
          </button>
          <button
            onClick={() => setActiveTab("mark-attendance")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "mark-attendance"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab("attendance-history")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "attendance-history"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            History
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
                {batch.instructor || "Not assigned"}
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
            <p className="text-sm text-slate-600 mb-4">
              Today: {new Date().toLocaleDateString()}
            </p>

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
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            attendanceForm[student._id] === status
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

      {activeTab === "attendance-history" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Attendance History
          </h3>
          {attendanceHistory.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No attendance records yet
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            record.status === "present"
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
        </div>
      )}
    </div>
  );
};

export default TeacherBatchDetail;
