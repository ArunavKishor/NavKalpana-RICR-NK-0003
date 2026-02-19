import React, { useState } from "react";
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

// Sample student data
const studentsData = [
  {
    id: "S001",
    name: "James Wilson",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: null,
  },
  {
    id: "S002",
    name: "Elena Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: null,
  },
  {
    id: "S003",
    name: "Marcus Chen",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: null,
  },
  {
    id: "S004",
    name: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?img=9",
    status: null,
  },
  {
    id: "S005",
    name: "Devin Page",
    avatar: "https://i.pravatar.cc/150?img=15",
    status: null,
  },
  {
    id: "S006",
    name: "Sophia Lane",
    avatar: "https://i.pravatar.cc/150?img=10",
    status: null,
  },
];

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [students, setStudents] = useState(studentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionRemarks, setSessionRemarks] = useState("");

  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle attendance marking
  const markAttendance = (studentId, status) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
  };

  // Count marked students
  const markedCount = students.filter((s) => s.status !== null).length;
  const totalStudents = students.length;

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate attendance percentage
  const presentCount = students.filter((s) => s.status === "present").length;
  const attendancePercentage =
    markedCount > 0 ? ((presentCount / markedCount) * 100).toFixed(1) : 0;

  // Handle submit
  const handleSubmit = () => {
    if (markedCount === totalStudents) {
      console.log("Submitting attendance:", students, sessionRemarks);
      alert("Attendance submitted successfully!");
    } else {
      alert(
        `Please mark attendance for all students (${markedCount}/${totalStudents})`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/batches")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">
                Attendance Management
              </h1>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 border px-3 py-1 font-semibold text-xs">
                BATCH: B{batchId || "001"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="text-slate-400">📅</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Edit3 className="w-4 h-4" />
            Mark
          </Button>
          <Button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <FileDown className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Roster - Left Side */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              {/* Student Roster Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Student Roster
                </h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Students List */}
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-500">{student.id}</p>
                      </div>
                    </div>

                    {/* Attendance Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAttendance(student.id, "present")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          student.status === "present"
                            ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, "absent")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          student.status === "absent"
                            ? "bg-red-100 text-red-700 border-2 border-red-500"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, "late")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          student.status === "late"
                            ? "bg-orange-100 text-orange-700 border-2 border-orange-500"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Late
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Session Remarks Card */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Session Remarks <span className="text-red-500">*</span>
                </h3>
                <textarea
                  value={sessionRemarks}
                  onChange={(e) => setSessionRemarks(e.target.value)}
                  placeholder="E.g., Covered Chapter 4, React Hooks. Group activity completed."
                  className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span>ℹ️</span>
                <span>VISIBLE IN BATCH CONTEXT & STUDENT PROFILE</span>
              </div>

              {/* Marked Counter */}
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Marked:</span>
                <span className="text-lg font-bold text-slate-900">
                  {markedCount} / {totalStudents}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-5 h-5" />
                Submit Attendance
              </Button>
            </CardContent>
          </Card>

          {/* Growth Intelligence Card */}
          <Card className="border-none shadow-sm  bg-blue-50 text-black overflow-hidden relative">
            <CardContent className="p-6">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">
                    Growth Intelligence
                  </h3>
                </div>

                <div className="mb-3">
                  <div className="text-5xl font-bold mb-1">
                    {attendancePercentage}%
                  </div>
                  <div className="text-xs opacity-80 uppercase tracking-wide">
                    Batch Attendance Index
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${attendancePercentage}%` }}
                  ></div>
                </div>

                <p className="text-sm opacity-90">
                  This session will boost the Overall Average
                </p>
              </div>

              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
