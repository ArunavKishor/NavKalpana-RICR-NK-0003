import React, { useEffect, useState, useRef } from "react";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import api from "@/config/Api";
import { PlusCircle, MessageSquarePlus, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getGreeting } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------ COMPONENT ------------------ */

const DashboardHome = () => {
  const { user } = useAuth();
  const greeting = getGreeting();
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadDashboard = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [statsRes, trendsRes, deadlinesRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/trends"),
          api.get("/api/dashboard/deadlines"),
        ]);

        const statsData = statsRes?.data?.data || {};
        setStats([
          {
            title: "Total Students",
            value: statsData.totalStudents ?? 0,
            change: "Active student profiles",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
          },
          {
            title: "Total Teachers",
            value: statsData.totalTeachers ?? 0,
            change: "Active teaching staff",
            icon: GraduationCap,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
          },
          {
            title: "Active Batches",
            value: statsData.activeBatches ?? 0,
            change: "Ongoing cohorts",
            icon: BookOpen,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
          },
          {
            title: "Pending Assessments",
            value: statsData.pendingAssessments ?? 0,
            change: "Due soon",
            icon: ClipboardCheck,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
          },
        ]);

        const trends = trendsRes?.data?.data?.trends || [];
        setChartData(
          trends.map((trend, index) => ({
            name: trend.week || `Week ${index + 1}`,
            score: Number(Number(trend.averageScore || 0).toFixed(1)),
            attendance: Number(
              Number(trend.attendancePercentage || 0).toFixed(1),
            ),
          })),
        );

        const deadlineItems = deadlinesRes?.data?.data?.assessments || [];
        setDeadlines(
          deadlineItems.map((item) => ({
            title: item.title,
            date: new Date(item.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            type: item.type === "quiz" ? "Quiz" : "Assignment",
            icon: Calendar,
            color:
              item.type === "quiz"
                ? "bg-orange-100 text-orange-600"
                : "bg-rose-100 text-rose-600",
          })),
        );
        setError("");
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      loadDashboard(true);
    }, 60000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.fullName?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-0.5">
            Here's what's happening across your institution today.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-slate-500 animate-pulse">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {stat.change}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl shrink-0 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid — Chart + Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-100 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
                    Class Performance Analytics
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Average test scores vs attendance trends
                  </p>
                </div>
                <select className="w-full sm:w-auto text-xs sm:text-sm border rounded-lg p-2 bg-slate-50 focus:outline-none">
                  <option>Last 6 Weeks</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56 sm:h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                      name="Avg Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Attendance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3 justify-end">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-purple-500 inline-block rounded" />
                  Avg Score
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />
                  Attendance
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          {/* Upcoming Deadlines */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-bold text-slate-800">
                  Upcoming Deadlines
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {deadlines.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No upcoming deadlines
                </p>
              )}
              {deadlines.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.date} · {item.type}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800">
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/admin/batches"
                  className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-colors border border-transparent hover:border-blue-200 text-slate-600"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xs font-semibold">All Batches</span>
                </Link>
                <Link
                  to="/admin/students"
                  className="bg-slate-50 hover:bg-purple-50 hover:text-purple-600 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-colors border border-transparent hover:border-purple-200 text-slate-600"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-semibold">Students</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              <Link
                to="/admin/batches?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-blue-600 group transition-all"
              >
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Create New Batch</span>
              </Link>
              <Link
                to="/admin/students?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-emerald-600 group transition-all"
              >
                <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Add New Student</span>
              </Link>
              <Link
                to="/admin/support?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-orange-600 group transition-all"
              >
                <div className="p-2 rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-100 shrink-0">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">New Support Ticket</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
