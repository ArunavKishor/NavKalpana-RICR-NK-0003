import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Zap, Archive } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const TeacherBatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ONGOING");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Batch Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and monitor your course batches
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {["ONGOING", "COMPLETED", "UPCOMING"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeFilter === status
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded mb-3 w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded mb-3"></div>
              <div className="h-2 bg-slate-100 rounded-full mb-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-slate-50 rounded-xl p-12">
                <p className="text-slate-500 font-medium">No batches found</p>
                <p className="text-slate-400 text-sm mt-2">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No batches available in this category"}
                </p>
              </div>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <motion.div
                key={batch._id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Card Header */}
                <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                      {batch.name}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(batch.status)}`}
                    >
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{batch.course}</p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Students */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Total Students
                    </span>
                    <span className="font-bold text-slate-900">
                      {batch.students?.length || 0}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Progress</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {batch.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${batch.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-slate-500 space-y-1 pt-2">
                    <p>
                      Start: {new Date(batch.startDate).toLocaleDateString()}
                    </p>
                    <p>End: {new Date(batch.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                  <Button
                    onClick={() =>
                      navigate(`/teacher-dashboard/batches/${batch._id}`)
                    }
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  {batch.status === "ongoing" && (
                    <Button
                      onClick={() => handleEndBatch(batch._id)}
                      variant="ghost"
                      className="flex-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      End
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherBatchManagement;
