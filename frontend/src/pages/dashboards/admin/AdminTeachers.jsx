import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/admin/AdminModal";
import TeacherForm from "@/components/admin/AdminTeacherForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Avatar from "@/components/shared/Avatar";

const TeacherManagement = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
    }
  }, [searchParams]);

  /* ---------------- COUNTS ---------------- */
  const total = counts.total;
  const activeCount = counts.active;
  const inactiveCount = counts.inactive;

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const isTargetStatus =
        activeTab === "ACTIVE"
          ? teacher.status === "active"
          : teacher.status !== "active";

      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      return isTargetStatus && matchesSearch;
    });
  }, [teachers, activeTab, searchTerm]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [totalRes, activeRes, inactiveRes] = await Promise.all([
          api.get("/api/teachers", { params: { limit: 1 } }),
          api.get("/api/teachers", { params: { limit: 1, status: "active" } }),
          api.get("/api/teachers", {
            params: { limit: 1, status: "inactive" },
          }),
        ]);
        setCounts({
          total: totalRes?.data?.data?.pagination?.total || 0,
          active: activeRes?.data?.data?.pagination?.total || 0,
          inactive: inactiveRes?.data?.data?.pagination?.total || 0,
        });
      } catch (err) {
        console.error("Load teacher counts failed:", err);
      }
    };
    loadCounts();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const loadTeachers = async () => {
    try {
      setLoading(true);
      const status = activeTab === "ACTIVE" ? "active" : undefined;
      const { data } = await api.get("/api/teachers", {
        params: {
          status: status,
          search: searchTerm || undefined,
        },
      });
      const list = data?.data?.teachers || [];

      const mapped = list.map((teacher) => ({
        id: teacher._id,
        name: teacher.user?.fullName || "Unknown",
        email: teacher.user?.email || "N/A",
        phone: teacher.phone || "N/A",
        employeeId: teacher.employeeId,
        joiningDate: teacher.joiningDate,
        status: teacher.status,
      }));

      setTeachers(mapped);
      setError("");
    } catch (err) {
      console.error("Load teachers failed:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load teachers. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [activeTab, searchTerm]);

  const handleTeacherFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (modalMode === "create") {
        await api.post("/api/teachers", data);
        toast.success("Teacher created successfully");
      } else {
        await api.put(`/api/teachers/${selectedTeacher.id}`, data);
        toast.success("Teacher updated successfully");
      }

      setIsModalOpen(false);
      await loadTeachers();

      // Reload counts
      const [totalRes, activeRes, inactiveRes] = await Promise.all([
        api.get("/api/teachers", { params: { limit: 1 } }),
        api.get("/api/teachers", { params: { limit: 1, status: "active" } }),
        api.get("/api/teachers", { params: { limit: 1, status: "inactive" } }),
      ]);
      setCounts({
        total: totalRes?.data?.data?.pagination?.total || 0,
        active: activeRes?.data?.data?.pagination?.total || 0,
        inactive: inactiveRes?.data?.data?.pagination?.total || 0,
      });
    } catch (err) {
      console.error("Teacher submit failed:", err);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mapped = backendErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFormErrors(mapped);
      }
      toast.error(err.response?.data?.message || "Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedTeacher(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setModalMode("edit");
    setSelectedTeacher(teacher);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/teachers/${teacherToDelete.id}`);
      toast.success("Teacher deleted successfully");
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      await loadTeachers();

      // Reload counts
      const [totalRes, activeRes, inactiveRes] = await Promise.all([
        api.get("/api/teachers", { params: { limit: 1 } }),
        api.get("/api/teachers", { params: { limit: 1, status: "active" } }),
        api.get("/api/teachers", { params: { limit: 1, status: "inactive" } }),
      ]);
      setCounts({
        total: totalRes?.data?.data?.pagination?.total || 0,
        active: activeRes?.data?.data?.pagination?.total || 0,
        inactive: inactiveRes?.data?.data?.pagination?.total || 0,
      });
    } catch (err) {
      console.error("Delete teacher failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete teacher");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "inactive":
        return "bg-amber-100 text-amber-700";
      case "resigned":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="p-8 space-y-6">
        {loading && (
          <div className="text-sm text-slate-500">Loading teachers...</div>
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
              Teacher Management
            </h1>
            <p className="text-slate-500">
              Manage instructors and their credentials
            </p>
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2"
            onClick={openCreateModal}
          >
            <Plus className="w-5 h-5" />
            <span>Add Teacher</span>
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
              value={activeCount}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-slate-600" />}
              label="INACTIVE"
              value={inactiveCount}
            />
          </div>
        </div>

        {/* FILTER SECTION */}
        <Card className="bg-white shadow-sm rounded-xl">
          <CardContent className="p-6 flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search by Name, ID, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border rounded-lg bg-slate-50 text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <ToggleButton
                active={activeTab === "ACTIVE"}
                onClick={() => setActiveTab("ACTIVE")}
              >
                Active Teachers
              </ToggleButton>

              <ToggleButton
                active={activeTab !== "ACTIVE"}
                onClick={() => setActiveTab("INACTIVE")}
              >
                Inactive/Resigned
              </ToggleButton>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="bg-white shadow-sm rounded-xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-slate-500 border-b">
              <div className="col-span-5">TEACHER DETAILS</div>
              <div className="col-span-3">EMPLOYEE ID</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No teachers found.
              </div>
            )}

            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50 transition"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <Avatar
                    name={teacher.name}
                    email={teacher.email}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {teacher.name}
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {teacher.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {teacher.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <p className="font-medium text-slate-700">
                    {teacher.employeeId}
                  </p>
                </div>

                <div className="col-span-2">
                  <Badge
                    className={`${getStatusColor(teacher.status)} px-3 py-1 capitalize`}
                  >
                    {teacher.status}
                  </Badge>
                </div>

                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 text-blue-600"
                    onClick={() => openEditModal(teacher)}
                    title="Edit Teacher"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 text-red-600"
                    onClick={() => openDeleteDialog(teacher)}
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === "create" ? "Add New Teacher" : "Edit Teacher"}
          description={
            modalMode === "create"
              ? "Enter teacher details to create a new profile. They will use their email to log in."
              : "Update teacher profile information."
          }
        >
          <TeacherForm
            initialData={selectedTeacher}
            onSubmit={handleTeacherFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isSubmitting}
            errors={formErrors}
          />
        </Modal>

        {/* Delete Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Teacher"
          description={`Are you sure you want to delete "${teacherToDelete?.name}"? This will deactivate their profile and they will lose dashboard access. This action cannot be undone.`}
          isLoading={isDeleting}
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

export default TeacherManagement;
