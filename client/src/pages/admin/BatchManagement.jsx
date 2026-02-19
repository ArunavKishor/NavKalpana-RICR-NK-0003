import React, { useState } from "react";
import { Plus, Search, Users, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Sample batch data
const batchesData = [
  {
    id: 1,
    name: "Full Stack Web (MERN)",
    type: "WEB BATCH",
    students: 45,
    date: "Jan 15, 2026",
    progress: 75,
    status: "ONGOING",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
  },
  {
    id: 2,
    name: "Data Structures & Algos",
    type: "DSA BATCH",
    students: 32,
    date: "Feb 10, 2026",
    progress: 40,
    status: "ONGOING",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    id: 3,
    name: "Advanced React Design",
    type: "WEB BATCH",
    students: 28,
    date: "Nov 05, 2025",
    progress: 100,
    status: "COMPLETED",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  },
  {
    id: 4,
    name: "Machine Learning Basics",
    type: "ML BATCH",
    students: 38,
    date: "Mar 01, 2026",
    progress: 0,
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&q=80",
  },
  {
    id: 5,
    name: "Python for Beginners",
    type: "PYTHON BATCH",
    students: 52,
    date: "Jan 20, 2026",
    progress: 65,
    status: "ONGOING",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
  },
  {
    id: 6,
    name: "UI/UX Design Bootcamp",
    type: "DESIGN BATCH",
    students: 24,
    date: "Dec 15, 2025",
    progress: 100,
    status: "COMPLETED",
    image:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80",
  },
];

const BatchManagement = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["All", "Ongoing", "Completed", "Upcoming"];

  // Filter batches based on active filter and search query
  const filteredBatches = batchesData.filter((batch) => {
    const matchesFilter =
      activeFilter === "All" || batch.status === activeFilter.toUpperCase();
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get status badge color
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Batch Management
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor and manage your active learning groups
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Batch
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <Card
            key={batch.id}
            className="border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            {/* Batch Image with Status Badge */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={batch.image}
                alt={batch.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <Badge
                  className={`${getStatusColor(batch.status)} border px-3 py-1 font-semibold text-xs shadow-sm`}
                >
                  {batch.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Batch Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {batch.name}
                </h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {batch.type}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{batch.students} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{batch.date}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {batch.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      batch.progress === 100 ? "bg-slate-400" : "bg-blue-600"
                    }`}
                    style={{ width: `${batch.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  navigate(`/admin/batches/${batch.id}/attendance`)
                }
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 group/btn"
              >
                Manage Attendance
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {filteredBatches.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No batches found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
