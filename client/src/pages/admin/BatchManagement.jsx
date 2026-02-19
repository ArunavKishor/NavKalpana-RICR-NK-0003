import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Search,
  Plus,
  ChevronRight,
} from "lucide-react";
import api from "@/config/Api";


// -------------------- Component --------------------

const BatchManagement = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = ["All", "Ongoing", "Completed", "Upcoming"];

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/batches", {
          params: {
            search: searchQuery || undefined,
            status:
              activeFilter === "All"
                ? undefined
                : activeFilter.toLowerCase(),
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

    loadBatches();
  }, [activeFilter, searchQuery]);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {loading && (
        <div className="text-sm text-slate-500">Loading batches...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Batch Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Monitor and manage your learning batches
          </p>
        </div>

        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Batch
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Filters */}
        <div className="flex gap-2 bg-white rounded-lg p-1.5 shadow-sm border overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <Card
            key={batch._id}
            className="shadow-sm hover:shadow-lg transition overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                alt={batch.name}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className={`${getStatusColor(batch.status?.toUpperCase())} border`}
                >
                  {batch.status?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold">
                  {batch.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium uppercase">
                  {batch.course}
                </p>
              </div>

              <div className="flex justify-between text-sm text-slate-600">
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
                <div className="flex justify-between text-sm mb-1">
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

              <button
                onClick={() =>
                  navigate(`/admin/batches/${batch._id}`)
                }
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                Manage
                <ChevronRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600">
            No batches found
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
