import React, { useState } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  User,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample support requests data
const supportRequestsData = [
  {
    id: "SR-001",
    student: "Emily Davis",
    email: "emily.d@example.com",
    subject: "Assignment submission deadline extension request",
    description:
      "I need an extension for the React hooks assignment due to personal circumstances.",
    category: "Academic",
    priority: "HIGH",
    status: "OPEN",
    createdDate: "2026-02-18",
    updatedDate: "2026-02-19",
    replies: 2,
  },
  {
    id: "SR-002",
    student: "Alex Johnson",
    email: "alex.j@example.com",
    subject: "Technical issue with quiz platform",
    description: "Unable to submit quiz answers - browser compatibility issue.",
    category: "Technical",
    priority: "URGENT",
    status: "IN_PROGRESS",
    createdDate: "2026-02-17",
    updatedDate: "2026-02-18",
    replies: 5,
  },
  {
    id: "SR-003",
    student: "Michael Chen",
    email: "michael.c@example.com",
    subject: "Grade dispute for Data Science module",
    description:
      "I believe my evaluation score should be reconsidered based on the rubric.",
    category: "Grading",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdDate: "2026-02-15",
    updatedDate: "2026-02-19",
    replies: 3,
  },
  {
    id: "SR-004",
    student: "Sarah Miller",
    email: "sarah.m@example.com",
    subject: "Request for additional learning resources",
    description:
      "Could you recommend more resources for advanced React patterns?",
    category: "Resources",
    priority: "LOW",
    status: "OPEN",
    createdDate: "2026-02-16",
    updatedDate: "2026-02-16",
    replies: 1,
  },
];

const SupportRequests = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");

  const filters = ["All", "OPEN", "IN_PROGRESS", "RESOLVED"];
  const priorities = ["All", "URGENT", "HIGH", "MEDIUM", "LOW"];

  // Filter requests
  const filteredRequests = supportRequestsData.filter((request) => {
    const matchesFilter =
      activeFilter === "All" || request.status === activeFilter;
    const matchesSearch =
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === "All" || request.priority === selectedPriority;
    return matchesFilter && matchesSearch && matchesPriority;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Support Requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage and respond to student support requests
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
          label="Total"
          value={supportRequestsData.length}
        />
        <StatsCard
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          label="Urgent"
          value={
            supportRequestsData.filter((r) => r.priority === "URGENT").length
          }
        />
        <StatsCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          label="In Progress"
          value={
            supportRequestsData.filter((r) => r.status === "IN_PROGRESS").length
          }
        />
        <StatsCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          label="Resolved"
          value={
            supportRequestsData.filter((r) => r.status === "RESOLVED").length
          }
        />
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject, student name, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "All"
                  ? "All Priorities"
                  : `Priority: ${priority}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No requests found
              </h3>
              <p className="text-slate-500">
                Try adjusting your filters or search terms.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-5 sm:p-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold">
                        {request.id}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(request.priority)} px-2.5 py-1 text-xs font-semibold`}
                      >
                        {request.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                      {request.subject}
                    </h3>
                  </div>
                  <Badge
                    className={`${getStatusColor(request.status)} border px-3 py-1 font-semibold text-xs flex items-center gap-1 shrink-0`}
                  >
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </div>

                {/* Student Info */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {request.student}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{request.replies} replies</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-4 text-sm line-clamp-2">
                  {request.description}
                </p>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created: {request.createdDate}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      Updated: {request.updatedDate}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group">
                    View Details
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ icon, label, value }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
      <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default SupportRequests;
