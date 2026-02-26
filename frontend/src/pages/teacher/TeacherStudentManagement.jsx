import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Mail,
  Phone,
  Download,
  Github,
  Linkedin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/config/Api";
import toast from "react-hot-toast";
import StudentDetailModal from "@/components/teacher/StudentDetailModal";

const TeacherStudentManagement = () => {
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState([]);
  const [teacherBatches, setTeacherBatches] = useState([]);
  const [activeTab, setActiveTab] = useState("ONGOING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState(null);
  // Cache analytics so we never re-fetch it when just switching tabs/searching
  const analyticsMapRef = useRef(new Map());
  const isFirstRender = useRef(true);

  // Initial load: fetch everything in parallel
  useEffect(() => {
    loadAll();
  }, []);

  // Tab change only re-fetches the student list (analytics is cached)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadStudentsForTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const mapStudents = (studentList) =>
    studentList.map((student) => {
      const primaryBatch = student.batches?.[0];
      const course = primaryBatch?.course || "Unassigned";
      const modules = student.batches?.map((b) => b.name) || [];
      const analytics = analyticsMapRef.current.get(student._id?.toString());
      return {
        raw: student,
        id: student._id,
        name: student.user?.fullName || "Unknown",
        email: student.user?.email || "N/A",
        phone: student.phone || "N/A",
        github: student.github || "",
        linkedin: student.linkedin || "",
        course,
        enrollmentId: student.enrollmentId || "",
        modules,
        status: student.status === "completed" ? "COMPLETED" : "ONGOING",
        ogi: analytics?.ogi || 0,
        growthClassification: analytics?.growthClassification || "N/A",
        attendancePercentage: analytics?.attendancePercentage || 0,
      };
    });

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      // All 4 in parallel; use allSettled so one failure doesn't kill everything
      const [activeRes, completedRes, analyticsRes, batchRes] =
        await Promise.allSettled([
          api.get("/api/students", { params: { status: "active" } }),
          api.get("/api/students", { params: { status: "completed" } }),
          api.get("/api/dashboard/teacher/analytics"),
          api.get("/api/batches"),
        ]);

      // Cache analytics map
      const analyticsStudents =
        analyticsRes.status === "fulfilled"
          ? analyticsRes.value?.data?.data?.students || []
          : [];
      analyticsMapRef.current = new Map(
        analyticsStudents.map((s) => [s.id, s]),
      );

      setTeacherBatches(
        batchRes.status === "fulfilled"
          ? batchRes.value?.data?.data?.batches || []
          : [],
      );

      const activeList =
        activeRes.status === "fulfilled"
          ? activeRes.value?.data?.data?.students || []
          : [];
      const completedList =
        completedRes.status === "fulfilled"
          ? completedRes.value?.data?.data?.students || []
          : [];
      setAllStudents(mapStudents([...activeList, ...completedList]));
    } catch (err) {
      console.error("Load students failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load students. Please try again.",
      );
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForTab = async (tab) => {
    try {
      setTabLoading(true);
      const status = tab === "COMPLETED" ? "completed" : "active";
      const { data } = await api.get("/api/students", { params: { status } });
      const studentList = data?.data?.students || [];
      // Merge with existing students of the other tab to preserve all data
      const otherStatus = tab === "COMPLETED" ? "ONGOING" : "COMPLETED";
      const kept = allStudents.filter((s) => s.status === otherStatus);
      setAllStudents([...kept, ...mapStudents(studentList)]);
    } catch (err) {
      console.error("Load students for tab failed:", err);
      toast.error("Failed to refresh students");
    } finally {
      setTabLoading(false);
    }
  };

  const uniqueCourses = useMemo(() => {
    return [
      "All",
      ...new Set(allStudents.map((s) => s.course).filter(Boolean)),
    ];
  }, [allStudents]);

  const filteredStudents = useMemo(
    () =>
      allStudents.filter((student) => {
        const matchesTab = student.status === activeTab;
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse =
          selectedCourse === "All" || student.course === selectedCourse;
        return matchesTab && matchesSearch && matchesCourse;
      }),
    [allStudents, activeTab, searchTerm, selectedCourse],
  );

  const total = allStudents.length;
  const ongoing = allStudents.filter((s) => s.status === "ONGOING").length;
  const completed = allStudents.filter((s) => s.status === "COMPLETED").length;

  const getAttendanceStyle = (attendance) => {
    if (attendance >= 85) return "bg-emerald-100 text-emerald-700";
    if (attendance >= 75) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Enrollment ID",
      "Course",
      "Status",
      "OGI (%)",
      "Growth",
      "Attendance (%)",
    ];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.email,
      s.enrollmentId,
      s.course,
      s.status,
      s.ogi,
      s.growthClassification,
      s.attendancePercentage,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${activeTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* SKELETON LOADING STATE */}
        {loading && (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-4 w-80 rounded-lg" />
              </div>
              <div className="flex flex-wrap gap-3 justify-center xl:justify-end">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white shadow-sm rounded-xl px-6 py-4 flex items-center gap-4 min-w-[150px]"
                  >
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>

            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-full md:w-56 rounded-lg" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-10 w-40 rounded-lg" />
                  <Skeleton className="h-10 w-40 rounded-lg" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-0">
                <div className="hidden lg:grid grid-cols-12 px-6 py-4 border-b gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className={
                        i === 1
                          ? "col-span-3"
                          : i === 2 || i === 3 || i === 5
                            ? "col-span-2"
                            : "col-span-1"
                      }
                    >
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-6 py-5 border-b last:border-0">
                    <div className="hidden lg:grid grid-cols-12 items-center gap-4">
                      <div className="col-span-3 flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <div className="col-span-1">
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="col-span-1 flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                      <div className="col-span-1 text-right">
                        <Skeleton className="h-8 w-16 ml-auto rounded-lg" />
                      </div>
                    </div>
                    <div className="lg:hidden space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Title + Stats */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="text-center xl:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Student Management
                </h1>
                <p className="text-slate-500 text-sm sm:text-base">
                  View and monitor students across your batches
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center xl:justify-end">
                <StatCard
                  icon={<Users className="w-5 h-5 text-blue-600" />}
                  label="TOTAL"
                  value={total}
                />
                <StatCard
                  icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                  label="ACTIVE"
                  value={ongoing}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-slate-600" />}
                  label="COMPLETED"
                  value={completed}
                />
                <button
                  onClick={downloadCSV}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Export current view as CSV"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
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
                    className="w-full md:w-56 px-4 py-2 border rounded-lg bg-slate-50 text-sm"
                  >
                    {uniqueCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
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

            {/* Table */}
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-0">
                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-12 px-6 py-4 text-sm font-semibold text-slate-500 border-b gap-4">
                  <div className="col-span-3">STUDENT DETAILS</div>
                  <div className="col-span-2">COURSE & ID</div>
                  <div className="col-span-2">PERFORMANCE</div>
                  <div className="col-span-1">ATTENDANCE</div>
                  <div className="col-span-2">PHONE</div>
                  <div className="col-span-1">MODULES</div>
                  <div className="col-span-1 text-right">ACTIONS</div>
                </div>

                {tabLoading ? (
                  <div className="px-6 py-8 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 animate-pulse"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                        <div className="h-6 w-16 bg-slate-200 rounded-full" />
                        <div className="h-6 w-12 bg-slate-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">
                    No students found.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id} className="border-b last:border-0">
                      {/* Desktop Row */}
                      <div className="hidden lg:grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50 transition gap-4">
                        <div className="col-span-3 flex items-center gap-4">
                          <img
                            src={`https://i.pravatar.cc/50?u=${student.email}`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="overflow-hidden">
                            <p className="font-semibold text-slate-900 truncate">
                              {student.name}
                            </p>
                            <div className="text-xs text-slate-500 truncate">
                              {student.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {student.github && (
                                <a
                                  href={
                                    student.github.startsWith("http")
                                      ? student.github
                                      : `https://github.com/${student.github}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="GitHub"
                                  className="text-slate-500 hover:text-slate-900 transition"
                                >
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {student.linkedin && (
                                <a
                                  href={
                                    student.linkedin.startsWith("http")
                                      ? student.linkedin
                                      : `https://linkedin.com/in/${student.linkedin}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="LinkedIn"
                                  className="text-slate-500 hover:text-blue-600 transition"
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <p className="font-medium text-sm truncate">
                            {student.course}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {student.enrollmentId}
                          </p>
                        </div>

                        <div className="col-span-2 flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {student.ogi}% OGI
                            </span>
                          </div>
                          <Badge
                            className={`text-[10px] uppercase font-semibold tracking-wider ${
                              student.growthClassification === "Excellent"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : student.growthClassification === "Improving"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : student.growthClassification === "Stable"
                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                    : "bg-red-100 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {student.growthClassification}
                          </Badge>
                        </div>

                        <div className="col-span-1">
                          <Badge
                            className={getAttendanceStyle(
                              student.attendancePercentage,
                            )}
                          >
                            {student.attendancePercentage}%
                          </Badge>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{student.phone}</span>
                          </div>
                        </div>

                        <div className="col-span-1 flex gap-1 flex-wrap">
                          {student.modules.map((mod) => (
                            <Badge
                              key={mod}
                              className="bg-slate-100 text-slate-600 text-[10px] font-medium border-slate-200"
                            >
                              {mod.length > 8 ? mod.substring(0, 8) + "…" : mod}
                            </Badge>
                          ))}
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            onClick={() => {
                              setStudentToView(student.raw);
                              setIsDetailModalOpen(true);
                            }}
                            title="View Details"
                          >
                            View
                          </button>
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.pravatar.cc/50?u=${student.email}`}
                            alt={student.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-slate-500">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-slate-600">
                          <p>
                            <strong>Course:</strong> {student.course}
                          </p>
                          <p>
                            <strong>ID:</strong> {student.enrollmentId}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {student.modules.map((mod) => (
                            <Badge
                              key={mod}
                              className="bg-slate-200 text-slate-700 text-xs"
                            >
                              {mod.toUpperCase()}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                            onClick={() => {
                              setStudentToView(student.raw);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <StudentDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              student={studentToView}
              batch={
                teacherBatches.find((b) =>
                  (studentToView?.batches || []).some(
                    (sb) => sb._id?.toString() === b._id?.toString(),
                  ),
                ) || null
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

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

export default TeacherStudentManagement;
