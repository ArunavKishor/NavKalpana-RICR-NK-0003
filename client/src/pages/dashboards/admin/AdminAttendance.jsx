import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  History,
  FileDown,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/Api";

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionRemarks, setSessionRemarks] = useState("");
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const markAttendance = (id, status) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markedCount = students.filter((s) => s.status !== null).length;
  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.status === "present").length;
  const attendancePercentage =
    markedCount > 0 ? ((presentCount / markedCount) * 100).toFixed(1) : 0;

  useEffect(() => {
    const loadBatchStudents = async () => {
      try {
        setLoading(true);
        const [batchRes, studentsRes] = await Promise.all([
          api.get(`/api/batches/${batchId}`),
          api.get(`/api/batches/${batchId}/students`),
        ]);

        setBatchName(batchRes?.data?.data?.name || "");

        const list = studentsRes?.data?.data?.students || [];
        setStudents(
          list.map((student) => ({
            id: student._id,
            name: student.user?.fullName || "Unknown",
            avatar: `https://i.pravatar.cc/150?u=${student.user?.email || student._id}`,
            status: null,
          })),
        );
        setError("");
      } catch (err) {
        console.error("Load attendance data failed:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load batch attendance data.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      loadBatchStudents();
    }
  }, [batchId]);

  const handleSubmit = async () => {
    if (markedCount !== totalStudents) {
      alert(`Mark all students first (${markedCount}/${totalStudents})`);
      return;
    }
    try {
      const records = students.map((student) => ({
        student: student.id,
        batch: batchId,
        date: new Date().toISOString(),
        status: student.status,
        notes: sessionRemarks,
      }));

      await api.post("/api/attendance", { records });
      alert("Attendance Submitted Successfully");
    } catch (err) {
      console.error("Submit attendance failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to submit attendance. Please try again.",
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {loading && (
        <div className="text-sm text-slate-500">Loading attendance...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/admin/batches")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Attendance Management
              </h1>

              <Badge className="bg-blue-100 text-blue-700 border px-3 py-1 text-xs font-semibold">
                BATCH: {batchName || batchId || "N/A"}
              </Badge>
            </div>

            <p className="text-slate-500 text-sm mt-1">
              📅 {currentDate}
            </p>
          </div>
        </div>

        {/* Header Buttons */}
        <div className="grid grid-cols-3 sm:flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Mark</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Students Section */}
        <div className="xl:col-span-2">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">

              {/* Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold">Student Roster</h2>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Students List */}
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-slate-500">{student.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:flex gap-2 w-full lg:w-auto">
                      {["present", "absent", "late"].map((type) => (
                        <button
                          key={type}
                          onClick={() => markAttendance(student.id, type)}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                            student.status === type
                              ? type === "present"
                                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                                : type === "absent"
                                ? "bg-red-100 text-red-700 border-2 border-red-500"
                                : "bg-orange-100 text-orange-700 border-2 border-orange-500"
                              : "bg-white border border-slate-200 text-slate-600"
                          }`}
                        >
                          {type === "present" && <CheckCircle2 className="w-4 h-4" />}
                          {type === "absent" && <XCircle className="w-4 h-4" />}
                          {type === "late" && <Clock className="w-4 h-4" />}
                          <span className="capitalize hidden sm:inline">
                            {type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-semibold">Session Remarks *</h3>
              <textarea
                value={sessionRemarks}
                onChange={(e) => setSessionRemarks(e.target.value)}
                className="w-full h-28 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />

              <div className="flex justify-between border-t pt-4">
                <span className="font-medium">Marked:</span>
                <span className="font-bold">
                  {markedCount}/{totalStudents}
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Submit Attendance
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">
                  Growth Intelligence
                </span>
              </div>

              <div className="text-4xl font-bold mb-2">
                {attendancePercentage}%
              </div>

              <div className="w-full bg-white/40 h-2 rounded-full mb-4">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>

              <p className="text-sm">
                This session improves batch performance.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
