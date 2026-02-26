import React, { useEffect, useState, useRef } from "react";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  GraduationCap,
  PlusCircle,
  MessageSquarePlus,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import api from "@/config/Api";
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

import { Skeleton } from "@/components/ui/skeleton";

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
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    intervalRef.current = setInterval(() => {
      loadDashboard(true);
    }, 60000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading && stats.length === 0) {
    return (
      <div className="p-5 lg:p-7 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl shadow-premium" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl shadow-premium" />
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl shadow-premium" />
            <Skeleton className="h-40 rounded-2xl shadow-premium" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-7 space-y-6 max-w-7xl mx-auto">
      {/* ---------------- HEADER ---------------- */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
          {greeting}, {user?.fullName?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening across your institution today.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border rounded-lg p-3">
          {error}
        </div>
      )}

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-card border border-border/50 shadow-premium hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </div>

              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------------- MAIN GRID ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* -------- CHART -------- */}
        <div className="lg:col-span-2">
          <Card className="bg-card shadow-premium border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Class Performance Analytics
              </CardTitle>
              <p className="text-xs text-slate-500">
                Average scores vs attendance trends
              </p>
            </CardHeader>

            <CardContent>
              {/* ✅ REDUCED HEIGHT */}
              <div className="h-44 sm:h-52 md:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={false}
                      name="Avg Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Attendance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* legend */}
              <div className="flex justify-end gap-5 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-purple-500 rounded" />
                  Avg Score
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-emerald-500 rounded" />
                  Attendance
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* -------- RIGHT PANEL -------- */}
        <div className="flex flex-col gap-5">
          {/* Deadlines */}
          <Card className="bg-card shadow-premium border border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {deadlines.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">
                  No upcoming deadlines
                </p>
              ) : (
                deadlines.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors"
                  >
                    <div className={`p-1.5 rounded ${item.color}`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.date} · {item.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card shadow-premium border border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-1">
              <Link
                to="/admin/batches?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Create New Batch</span>
              </Link>

              <Link
                to="/admin/students?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">Add New Student</span>
              </Link>

              <Link
                to="/admin/support?action=create"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4 text-orange-600" />
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
