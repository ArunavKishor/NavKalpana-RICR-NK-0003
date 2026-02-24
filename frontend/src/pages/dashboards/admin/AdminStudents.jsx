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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  GraduationCap,
  Filter,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Star,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/admin/AdminModal";
import StudentForm from "@/components/admin/AdminStudentForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";
import StudentDetailModal from "@/components/admin/AdminStudentDetailModal";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Avatar from "@/components/shared/Avatar";
import AssignBatchModal from "@/components/admin/AssignBatchModal";
import QuickAttendanceModal from "@/components/admin/QuickAttendanceModal";

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
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [isAssignBatchModalOpen, setIsAssignBatchModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState(null);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
    }
  }, [searchParams]);

  const uniqueCourses = useMemo(() => {
    return ["All", ...new Set(students.map((s) => s.course).filter(Boolean))];
  }, [students]);

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
        console.error("Load counts failed:", err);
      }
    };
    loadCounts();
  }, []);

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

      const performanceRes = await api.get("/api/dashboard/performance");
      const performanceData =
        performanceRes?.data?.data?.studentPerformance || [];

      const performanceMap = new Map(
        performanceData.map((item) => [item.student.id, item]),
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
          batches: student.batches || [],
          profilePhoto: student.user?.profilePicture || null,
        };
      });

      setStudents(mapped);
      setError("");
    } catch (err) {
      console.error("Load students failed:", err);
      setError("Failed to load students. Please try again.");
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
    } catch (err) {
      console.error("Student submit failed:", err);
      toast.error(err.response?.data?.message || "Failed to save student");
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
      await loadStudents();
    } catch (err) {
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const getAttendanceStyle = (attendance) => {
    if (attendance >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (attendance >= 75) return "text-indigo-600 bg-indigo-50 border-indigo-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 space-y-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/20 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/20 blur-[120px] rounded-full -z-10" />

      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50/50">
                LMS Enterprise
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
              Scholar <span className="text-indigo-600">Index</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage student performance, enrollment, and profiles.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button
              onClick={openCreateModal}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl shadow-xl shadow-slate-200 group h-auto"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold">Add Scholar</span>
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Total Scholars", value: counts.total, icon: Users, color: "rose", bg: "bg-rose-500" },
            { label: "Active Scholars", value: counts.active, icon: UserCheck, color: "indigo", bg: "bg-indigo-500" },
            { label: "Graduated", value: counts.completed, icon: GraduationCap, color: "emerald", bg: "bg-emerald-500" },
            { label: "Avg. Attendance", value: "88%", icon: Star, color: "orange", bg: "bg-orange-500" },
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

      {/* Modern Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-20 z-10"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700 font-bold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl">
              {["ONGOING", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "ONGOING" ? "Enrolled" : "Alumni"}
                </button>
              ))}
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Scholars Table / List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500 font-medium italic">Synchronizing Student Records...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] py-20 text-center">
             <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-900">Virtual Classroom Empty</h3>
             <p className="text-slate-500">No scholars matching your refined search.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                      {/* Identity Card Part */}
                      <div className="lg:w-80 p-8 flex flex-col items-center text-center bg-slate-50/50 group-hover:bg-indigo-50/20 transition-colors">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                          <div className="relative">
                             <Avatar name={student.name} src={student.profilePhoto} size="xl" className="border-4 border-white shadow-xl rounded-3xl" />
                             <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                             </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{student.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">#{student.enrollmentId}</p>
                        
                        <div className="flex flex-col gap-2 w-full">
                           <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-left">
                              <Mail className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="text-xs font-bold text-slate-600 truncate">{student.email}</span>
                           </div>
                           <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-left">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-xs font-bold text-slate-600">{student.phone}</span>
                           </div>
                        </div>
                      </div>

                      {/* Performance & Academic Part */}
                      <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                           <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Academic Program</p>
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.course}</p>
                                    <p className="text-xs text-slate-500 font-medium">Standard Curriculum</p>
                                </div>
                              </div>
                           </div>

                           <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Module Mastery</p>
                              <div className="flex flex-wrap gap-2">
                                {student.modules.map((m, i) => (
                                    <Badge key={i} className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 rounded-lg">
                                        {m}
                                    </Badge>
                                ))}
                                {student.modules.length === 0 && <span className="text-xs text-slate-400 italic">No modules assigned</span>}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Consistency</p>
                                 <p className="text-2xl font-black text-slate-900">{student.attendance}%</p>
                              </div>
                              <Badge className={`${getAttendanceStyle(student.attendance)} border-none py-1.5 px-4 rounded-xl font-bold`}>
                                 Attendance
                              </Badge>
                           </div>
                           
                           <div className="grid grid-cols-3 gap-2">
                              {/* Quick Stats Mini */}
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Quiz</p>
                                 <p className="font-bold text-indigo-600">8.2</p>
                              </div>
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Assgn</p>
                                 <p className="font-bold text-emerald-600">12</p>
                              </div>
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Rank</p>
                                 <p className="font-bold text-orange-600">#4</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      {/* Control Panel Part */}
                      <div className="lg:w-48 p-8 flex lg:flex-col items-center justify-center gap-3 bg-slate-50/30">
                        <Button 
                          onClick={() => {
                            setStudentToView(student);
                            setIsDetailModalOpen(true);
                          }}
                          className="w-full bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border-none shadow-sm h-12 rounded-2xl font-bold transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        <div className="flex gap-2 w-full">
                           <button 
                            onClick={() => openEditModal(student)}
                            className="flex-1 p-3 bg-white hover:bg-amber-50 rounded-2xl border border-slate-100 text-amber-600 transition-colors shadow-sm flex justify-center"
                           >
                              <Pencil className="w-4 h-4" />
                           </button>
                           <button 
                            onClick={() => openDeleteDialog(student)}
                            className="flex-1 p-3 bg-white hover:bg-rose-50 rounded-2xl border border-slate-100 text-rose-600 transition-colors shadow-sm flex justify-center"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>

                        <div className="w-full h-px bg-slate-200/50 my-1 hidden lg:block" />
                        
                        <div className="flex gap-2 w-full">
                           <button 
                            onClick={() => {
                                setSelectedStudentForAction(student);
                                setIsAssignBatchModalOpen(true);
                            }}
                            className="flex-1 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-emerald-700 transition-colors flex justify-center"
                           >
                                <Plus className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => {
                                setSelectedStudentForAction(student);
                                setIsAttendanceModalOpen(true);
                            }}
                            className="flex-1 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl text-indigo-700 transition-colors flex justify-center"
                           >
                                <CheckCircle className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Add New Scholar" : "Modify Scholar profile"}
        className="max-w-2xl rounded-[3rem] p-0"
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
        title="Scholarly Expulsion?"
        description={`Are you certain you wish to deactivate ${studentToDelete?.name}'s profile and access tokens?`}
        isLoading={isDeleting}
      />

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        studentId={studentToView?.id}
      />

      <QuickAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        student={selectedStudentForAction}
      />

      <AssignBatchModal
        isOpen={isAssignBatchModalOpen}
        onClose={() => setIsAssignBatchModalOpen(false)}
        student={selectedStudentForAction}
        onAssignmentSuccess={loadStudents}
      />
    </div>
  );
};

export default StudentManagement;
