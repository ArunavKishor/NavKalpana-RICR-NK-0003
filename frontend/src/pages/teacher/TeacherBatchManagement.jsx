import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Zap, Archive } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import AttendanceModal from "@/components/teacher/AttendanceModal";

const TeacherBatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ONGOING");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceBatch, setAttendanceBatch] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  useEffect(() => {
    loadBatches();
  }, [activeFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (activeFilter === "ONGOING") params.status = "ongoing";
      else if (activeFilter === "COMPLETED") params.status = "completed";
      else if (activeFilter === "UPCOMING") params.status = "upcoming";

      const { data } = await api.get("/api/batches", { params });
      const batchesList = data?.data?.batches || [];
      setBatches(batchesList);
    } catch (err) {
      console.error("Load batches failed:", err);
      setError("Failed to load batches. Please try again.");
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEndBatch = async (batchId) => {
    if (
      !window.confirm(
        "Are you sure you want to end this batch? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await api.put(`/api/batches/${batchId}`, { status: "completed" });
      toast.success("Batch ended successfully");
      await loadBatches();
    } catch (err) {
      console.error("End batch failed:", err);
      toast.error("Failed to end batch. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="w-full space-y-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Academic Batch Management
        </h1>
        <p className="text-slate-500">
          Manage, monitor and control academic batches & attendance
        </p>
      </div>

      {/* SUMMARY KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="summary-card">
          <p>Total Batches</p>
          <h3>{batches.length}</h3>
        </div>

        <div className="summary-card">
          <p>Ongoing</p>
          <h3>
            {batches.filter((b) => b.status === "ongoing").length}
          </h3>
        </div>

        <div className="summary-card">
          <p>Completed</p>
          <h3>
            {batches.filter((b) => b.status === "completed").length}
          </h3>
        </div>

        <div className="summary-card">
          <p>Upcoming</p>
          <h3>
            {batches.filter((b) => b.status === "upcoming").length}
          </h3>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by batch name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-6 border-b">
        {["ONGOING", "COMPLETED", "UPCOMING"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`pb-3 font-semibold transition-all border-b-2 ${activeFilter === status
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-16 text-slate-500">
          Loading Batches...
        </div>
      )}

      {/* BATCH GRID */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredBatches.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-slate-50 rounded-xl">
              No batches found
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <motion.div
                key={batch._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all"
              >
                {/* CARD HEADER */}
                <div className="p-6 border-b bg-indigo-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {batch.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {batch.course}
                      </p>

                      {/* Batch Type (New Field Added) */}
                      {batch.type && (
                        <p className="text-xs mt-1 text-indigo-600 font-medium">
                          Type: {batch.type}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(batch.status)}`}
                    >
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-6 space-y-4">

                  <div className="flex justify-between text-sm">
                    <span>Total Students</span>
                    <span className="font-semibold">
                      {batch.students?.length || 0}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {batch.progress || 0}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-2 bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${batch.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-2">
                    <p>
                      Start:{" "}
                      {new Date(batch.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      End:{" "}
                      {new Date(batch.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="p-4 bg-slate-50 border-t flex gap-2">
                  <Button
                    onClick={() =>
                      navigate(`/teacher-dashboard/batches/${batch._id}`)
                    }
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendanceBatch(batch);
                      setIsAttendanceModalOpen(true);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Take Attendance
                  </Button>

                  {batch.status === "ongoing" && (
                    <Button
                      onClick={() => handleEndBatch(batch._id)}
                      variant="ghost"
                      className="flex-1 text-red-600 hover:bg-red-50"
                    >
                      End Batch
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setAttendanceBatch(null);
        }}
        batch={attendanceBatch}
      />
    </div>
  );
};

export default TeacherBatchManagement;
