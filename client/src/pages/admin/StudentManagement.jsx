import React, { useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ---------------- SAMPLE DATA ---------------- */
const studentsData = [
  {
    id: 1,
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "+1 (555) 004-5678",
    course: "Data Science",
    enrollmentId: "ENR-2025-098",
    attendance: 98,
    modules: ["Python", "Machine Learning"],
    status: "ONGOING",
  },
  {
    id: 2,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    phone: "+1 (555) 002-1123",
    course: "Web Development",
    enrollmentId: "ENR-2025-102",
    attendance: 82,
    modules: ["React", "Node"],
    status: "ONGOING",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.c@example.com",
    phone: "+1 (555) 009-7788",
    course: "Data Science",
    enrollmentId: "ENR-2024-087",
    attendance: 74,
    modules: ["Python", "Statistics"],
    status: "COMPLETED",
  },
];

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState("ONGOING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");

  /* ---------------- COUNTS ---------------- */
  const total = studentsData.length;
  const ongoing = studentsData.filter((s) => s.status === "ONGOING").length;
  const completed = studentsData.filter((s) => s.status === "COMPLETED").length;

  /* ---------------- UNIQUE COURSES ---------------- */
  const uniqueCourses = useMemo(() => {
    return ["All", ...new Set(studentsData.map((s) => s.course))];
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesTab = student.status === activeTab;

      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === "All" || student.course === selectedCourse;

      return matchesTab && matchesSearch && matchesCourse;
    });
  }, [activeTab, searchTerm, selectedCourse]);

  const getAttendanceStyle = (attendance) => {
    if (attendance >= 85)
      return "bg-emerald-100 text-emerald-700";
    if (attendance >= 75)
      return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-white px-8 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">
          Good Afternoon, <span className="text-blue-600">Sarah</span>
        </h2>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search students, batches..."
              className="pl-9 pr-4 py-2 w-72 border rounded-lg bg-slate-50 text-sm focus:outline-none"
            />
          </div>

          <Bell className="w-5 h-5 text-slate-500 cursor-pointer" />

          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="https://i.pravatar.cc/40?img=5"
              alt="Dr. Sarah Jenkins"
              className="w-9 h-9 rounded-full"
            />
            <div className="text-right">
              <p className="text-sm font-medium">Dr. Sarah Jenkins</p>
              <p className="text-xs text-slate-500">
                Senior Faculty, CS Department
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* ---------------- PAGE CONTENT ---------------- */}
      <div className="p-8 space-y-6">
        {/* Title + Stats */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Student Management
            </h1>
            <p className="text-slate-500">
              Track and manage student performance and profiles
            </p>
          </div>

          <div className="flex gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="TOTAL"
              value={total}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
              label="ONGOING"
              value={ongoing}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-slate-600" />}
              label="COMPLETED"
              value={completed}
            />
          </div>
        </div>

        {/* FILTER SECTION */}
        <Card className="bg-white shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search by Name, ID, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border rounded-lg bg-slate-50 text-sm focus:outline-none"
                />
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-slate-50 text-sm"
              >
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <ToggleButton
                active={activeTab === "ONGOING"}
                onClick={() => setActiveTab("ONGOING")}
              >
                Ongoing Students
              </ToggleButton>

              <ToggleButton
                active={activeTab === "COMPLETED"}
                onClick={() => setActiveTab("COMPLETED")}
              >
                Completed Students
              </ToggleButton>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="bg-white shadow-sm rounded-xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-slate-500 border-b">
              <div className="col-span-4">STUDENT DETAILS</div>
              <div className="col-span-3">COURSE & ID</div>
              <div className="col-span-2">ATTENDANCE</div>
              <div className="col-span-2">MODULES</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No students found.
              </div>
            )}

            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50 transition"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <img
                    src={`https://i.pravatar.cc/50?u=${student.email}`}
                    alt={student.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.name}
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <p className="font-medium">{student.course}</p>
                  <p className="text-sm text-slate-500">
                    {student.enrollmentId}
                  </p>
                </div>

                <div className="col-span-2">
                  <Badge
                    className={`${getAttendanceStyle(
                      student.attendance
                    )} px-3 py-1`}
                  >
                    {student.attendance}%
                  </Badge>
                </div>

                <div className="col-span-2 flex gap-2 flex-wrap">
                  {student.modules.map((mod) => (
                    <Badge
                      key={mod}
                      className="bg-slate-200 text-slate-700 text-xs"
                    >
                      {mod.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                <div className="col-span-1 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ---------------- REUSABLE COMPONENTS ---------------- */

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white shadow-sm rounded-xl px-6 py-4 flex items-center gap-4 min-w-35">
    <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const ToggleButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
      active ? "bg-slate-200" : "bg-white border"
    }`}
  >
    {children}
  </button>
);

export default StudentManagement;
