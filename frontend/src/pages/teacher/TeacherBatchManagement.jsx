import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Users, Calendar, BookOpen, Search, User, ChevronRight, Zap } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AttendanceModal from "@/components/teacher/AttendanceModal";

const TeacherBatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [attendanceBatch, setAttendanceBatch] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const filters = ["All", "Ongoing", "Completed", "Upcoming"];

  useEffect(() => {
    loadBatches();
    loadAllBatchesForCounts();
  }, [activeFilter, searchQuery]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = { search: searchQuery || undefined };
      if (activeFilter !== "All") {
        payload.status = activeFilter.toLowerCase();
      }

      const { data } = await api.get("/api/batches", { params: payload });
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

  const loadAllBatchesForCounts = async () => {
    try {
      const { data } = await api.get("/api/batches");
      const batchesList = data?.data?.batches || [];
      setAllBatches(batchesList);
    } catch (err) {
      console.error("Load all batches failed:", err);
    }
  };

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
    if (batch.progress) return Math.min(100, Math.max(0, batch.progress));
    if (!batch.startDate || !batch.endDate) return 0;
    const start = new Date(batch.startDate).getTime();
    const end = new Date(batch.endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
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
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Academic Batch Management
          </h1>
          <p className="text-slate-500 mt-1 text-xs xs:text-sm sm:text-base">
            Manage, monitor and control academic batches & attendance
          </p>
        </div>
      </div>

      {/* SUMMARY KPI SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Batches", value: allBatches.length, color: "bg-indigo-50 text-indigo-700" },
          { label: "Ongoing", value: allBatches.filter((b) => b.status === "ongoing").length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Completed", value: allBatches.filter((b) => b.status === "completed").length, color: "bg-slate-50 text-slate-700" },
          { label: "Upcoming", value: allBatches.filter((b) => b.status === "upcoming").length, color: "bg-blue-50 text-blue-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold rounded-md px-2 py-0.5 inline-block ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filters */}
        <div className="flex gap-2 bg-white rounded-lg p-1.5 shadow-sm border overflow-x-auto whitespace-nowrap scrollbar-thin">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition shrink-0 ${activeFilter === filter ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-16 text-slate-500 text-sm">Loading batches...</div>
      )}

      {/* Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
          {filteredBatches.map((batch) => (
            <Card key={batch._id} className="shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-200">
              {/* Image */}
              <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 overflow-hidden bg-slate-100">
                {batch.image ? (
                  <img
                    src={batch.image}
                    alt={batch.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-indigo-50/50">
                    <BookOpen className="w-12 h-12 text-indigo-200" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getStatusColor(batch.status)} font-semibold shadow-sm text-xs`}>
                    {batch.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4 flex flex-col flex-1">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{batch.name}</h3>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-xs sm:text-sm text-indigo-600 font-semibold">{batch.course}</p>
                    {batch.type && (
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Type: {batch.type}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{batch.enrolledStudents ?? batch.students?.length ?? 0}</span> Students
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {batch.startDate ? new Date(batch.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium text-slate-700">
                    <span>Course Progress</span>
                    <span className="text-indigo-600">{computeProgress(batch)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 border border-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${computeProgress(batch)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/teacher-dashboard/batches/${batch._id}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Manage
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttendanceBatch(batch);
                        setIsAttendanceModalOpen(true);
                      }}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Attendance
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredBatches.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No batches found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
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
        onSaveSuccess={loadBatches}
      />
    </div>
  );
};

export default TeacherBatchManagement;
