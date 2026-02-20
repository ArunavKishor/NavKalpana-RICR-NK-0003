import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import Modal from "@/components/admin/Modal";
import StudentForm from "@/components/admin/StudentForm";
import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import StudentDetailModal from "@/components/admin/StudentDetailModal";
import { Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";

const StudentManagement = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("ONGOING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState(null);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
    }
  }, [searchParams]);

  /* ---------------- COUNTS ---------------- */
  const total = counts.total;
  const ongoing = counts.active;
  const completed = counts.completed;

  /* ---------------- UNIQUE COURSES ---------------- */
  const uniqueCourses = useMemo(() => {
    return ["All", ...new Set(students.map((s) => s.course).filter(Boolean))];
  }, [students]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesTab = student.status === activeTab;

      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === "All" || student.course === selectedCourse;

      return matchesTab && matchesSearch && matchesCourse;
    });
  }, [students, activeTab, searchTerm, selectedCourse]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [totalRes, activeRes, completedRes] = await Promise.all([
          api.get("/api/students", { params: { limit: 1 } }),
          api.get("/api/students", { params: { limit: 1, status: "active" } }),
          api.get("/api/students", {
            params: { limit: 1, status: "completed" },
          }),
        ]);
        setCounts({
          total: totalRes?.data?.data?.pagination?.total || 0,
          active: activeRes?.data?.data?.pagination?.total || 0,
          completed: completedRes?.data?.data?.pagination?.total || 0,
        });
      } catch (err) {
        console.error("Load student counts failed:", err);
      }
    };

    loadCounts();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const loadStudents = async () => {
    try {
      setLoading(true);
      const status = activeTab === "COMPLETED" ? "completed" : "active";
      const { data } = await api.get("/api/students", {
        params: {
          status,
          search: searchTerm || undefined,
        },
      });
      const list = data?.data?.students || [];

      // Fetch performance data to map attendance
      const performanceRes = await api.get("/api/dashboard/performance");
      const performanceData =
        performanceRes?.data?.data?.studentPerformance || [];

      const performanceMap = new Map(
        performanceData.map((item) => [item.student.id, item])
      );

      const mapped = list.map((student) => {
        const course = student.batches?.[0]?.course || "Unassigned";
        const modules = student.batches?.map((b) => b.name) || [];
        const performance = performanceMap.get(student._id);
        const attendance = performance
          ? Math.round(performance.attendancePercentage)
          : 0;

        return {
          id: student._id,
          name: student.user?.fullName || "Unknown",
          email: student.user?.email || "N/A",
          phone: student.phone || "N/A",
          course,
          enrollmentId: student.enrollmentId,
          attendance,
          modules,
          status: student.status === "completed" ? "COMPLETED" : "ONGOING",
        };
      });

      setStudents(mapped);
      setError("");
    } catch (err) {
      console.error("Load students failed:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [activeTab, searchTerm]);

  const handleStudentFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (modalMode === "create") {
        await api.post("/api/students", data);
        toast.success("Student created successfully");
      } else {
        await api.put(`/api/students/${selectedStudent.id}`, data);
        toast.success("Student updated successfully");
      }

      setIsModalOpen(false);
      await loadStudents();
      // Reload counts too
      const [totalRes, activeRes, completedRes] = await Promise.all([
        api.get("/api/students", { params: { limit: 1 } }),
        api.get("/api/students", { params: { limit: 1, status: "active" } }),
        api.get("/api/students", {
          params: { limit: 1, status: "completed" },
        }),
      ]);
      setCounts({
        total: totalRes?.data?.data?.pagination?.total || 0,
        active: activeRes?.data?.data?.pagination?.total || 0,
        completed: completedRes?.data?.data?.pagination?.total || 0,
      });
    } catch (err) {
      console.error("Student submit failed:", err);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mapped = backendErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFormErrors(mapped);
      }
      toast.error(
        err.response?.data?.message || "Failed to save student",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedStudent(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode("edit");
    setSelectedStudent(student);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/students/${studentToDelete.id}`);
      toast.success("Student deleted successfully");
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      await loadStudents();
      // Reload counts
      const [totalRes, activeRes, completedRes] = await Promise.all([
        api.get("/api/students", { params: { limit: 1 } }),
        api.get("/api/students", { params: { limit: 1, status: "active" } }),
        api.get("/api/students", {
          params: { limit: 1, status: "completed" },
        }),
      ]);
      setCounts({
        total: totalRes?.data?.data?.pagination?.total || 0,
        active: activeRes?.data?.data?.pagination?.total || 0,
        completed: completedRes?.data?.data?.pagination?.total || 0,
      });
    } catch (err) {
      console.error("Delete student failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete student",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getAttendanceStyle = (attendance) => {
    if (attendance >= 85)
      return "bg-emerald-100 text-emerald-700";
    if (attendance >= 75)
      return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ---------------- PAGE CONTENT ---------------- */}
      <div className="p-8 space-y-6">
        {loading && (
          <div className="text-sm text-slate-500">Loading students...</div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

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

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2"
            onClick={openCreateModal}
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </Button>

          <div className="flex gap-4">
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
                Active Students
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

                <div className="col-span-1 text-right flex items-center justify-end gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 text-blue-600"
                    onClick={() => openEditModal(student)}
                    title="Edit Student"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 text-red-600"
                    onClick={() => openDeleteDialog(student)}
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    onClick={() => {
                      setStudentToView(student);
                      setIsDetailModalOpen(true);
                    }}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === "create" ? "Add New Student" : "Edit Student"}
          description={modalMode === "create" ? "Enter student details to create a new profile." : "Update student profile information."}
        >
          <StudentForm
            initialData={selectedStudent}
            onSubmit={handleStudentFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isSubmitting}
            errors={formErrors}
          />
        </Modal>

        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Student"
          description={`Are you sure you want to delete "${studentToDelete?.name}"? This will deactivate their student profile and access. This action cannot be undone.`}
          isLoading={isDeleting}
        />

        <StudentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          studentId={studentToView?.id}
        />
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
    className={`px-5 py-2 rounded-lg text-sm font-medium transition ${active ? "bg-slate-200" : "bg-white border"
      }`}
  >
    {children}
  </button>
);

export default StudentManagement;
