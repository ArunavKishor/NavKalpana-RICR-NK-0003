import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  Search,
  Plus,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Modal from "@/components/admin/AdminModal";
import BatchForm from "@/components/admin/AdminBatchForm";
import DeleteConfirmationDialog from "@/components/admin/AdminDeleteConfirmationDialog";


// -------------------- Component --------------------

const BatchManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = ["All", "Ongoing", "Completed", "Upcoming"];

  const loadBatches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/batches", {
        params: {
          search: searchQuery || undefined,
          status:
            activeFilter === "All" ? undefined : activeFilter.toLowerCase(),
        },
      });
      setBatches(data?.data?.batches || []);
      setError("");
    } catch (err) {
      console.error("Load batches failed:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load batches. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
    }
  }, [searchParams]);

  const filteredBatches = useMemo(() => {
    if (!searchQuery) return batches;
    return batches.filter((batch) => {
      const matchesSearch =
        batch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.course?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [batches, searchQuery]);

  const computeProgress = (batch) => {
    if (!batch.startDate || !batch.endDate) return 0;
    const start = new Date(batch.startDate).getTime();
    const end = new Date(batch.endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  };

  const resetForm = () => {
    setFormErrors({});
    setSelectedBatch(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setModalMode("edit");
    setSelectedBatch(batch);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }
    if (!data.course) {
      errors.course = "Course is required";
    }
    if (!data.startDate) {
      errors.startDate = "Start date is required";
    }
    if (!data.endDate) {
      errors.endDate = "End date is required";
    }
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
      }
    }
    if (!data.maxStudents || data.maxStudents < 1 || data.maxStudents > 500) {
      errors.maxStudents = "Max students must be between 1 and 500";
    }
    return errors;
  };

  const handleBatchFormSubmit = async (data) => {
    const errors = validateForm(data);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'imageFile') {
          if (data.imageFile) formDataToSend.append('image', data.imageFile);
        } else if (key === 'maxStudents') {
          formDataToSend.append(key, Number(data[key]));
        } else if (data[key] !== undefined && data[key] !== null) {
          formDataToSend.append(key, data[key]);
        }
      });

      if (modalMode === "create") {
        await api.post("/api/batches", formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Batch created successfully");
      } else {
        await api.put(`/api/batches/${selectedBatch._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Batch updated successfully");
      }
      setIsModalOpen(false);
      resetForm();
      await loadBatches();
    } catch (err) {
      console.error("Batch submit failed:", err);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mapped = backendErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFormErrors(mapped);
      }
      toast.error(
        err.response?.data?.message ||
        "Failed to save batch. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (batch) => {
    setBatchToDelete(batch);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/batches/${batchToDelete._id}`);
      setBatches((prev) =>
        prev.filter((batch) => batch._id !== batchToDelete._id),
      );
      toast.success("Deleted successfully", { duration: 5000 });
      setDeleteDialogOpen(false);
      setBatchToDelete(null);
    } catch (err) {
      console.error("Delete batch failed:", err);
      toast.error(
        err.response?.data?.message ||
        "Failed to delete batch. Please try again.",
        { duration: 5000 },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "UPCOMING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  return (
    <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 py-6 max-w-[1600px] mx-auto space-y-8">

      {loading && (
        <div className="text-sm text-slate-500">Loading batches...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="text-center md:text-left">
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Batch Management
          </h1>
          <p className="text-slate-500 mt-1 text-xs xs:text-sm sm:text-base">
            Monitor and manage your learning batches
          </p>
        </div>

        <Button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          Create Batch
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Filters */}
        <div className="flex gap-2 bg-white rounded-lg p-1.5 shadow-sm border overflow-x-auto whitespace-nowrap scrollbar-thin">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition shrink-0 ${activeFilter === filter
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-full md:w-72 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">

        {filteredBatches.map((batch) => (
          <Card
            key={batch._id}
            className="shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
          >
            {/* Image */}
            <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 overflow-hidden bg-slate-100">
              {batch.image ? (
                <img
                  src={batch.image}
                  alt={batch.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge
                  className={`${getStatusColor(batch.status?.toUpperCase())} border text-xs`}
                >
                  {batch.status?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-4 flex flex-col flex-1">

              <div>
                <h3 className="text-base sm:text-lg font-bold line-clamp-1">
                  {batch.name}
                </h3>
                <p className="text-xs sm:text-sm text-blue-600 font-medium uppercase">
                  {batch.course}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {batch.enrolledStudents ?? batch.students?.length ?? 0} Students
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {batch.startDate
                    ? new Date(batch.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>Progress</span>
                  <span>{computeProgress(batch)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${computeProgress(batch)}%` }}
                  ></div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-auto space-y-2">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/admin/batches/${batch._id}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    Manage
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(batch)}
                    className="w-full bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <button
                  onClick={() => openDeleteDialog(batch)}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600 text-sm">
            No batches found
          </p>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Create New Batch" : "Edit Batch"}
      >
        <BatchForm
          initialData={selectedBatch}
          onSubmit={handleBatchFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          errors={formErrors}
        />
      </Modal>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Batch"
        description={<>Are you sure you want to delete <strong>{batchToDelete?.name}</strong>? This action cannot be undone.</>}
        isDeleting={isDeleting}
      />

    </div>
  );
};

export default BatchManagement;
