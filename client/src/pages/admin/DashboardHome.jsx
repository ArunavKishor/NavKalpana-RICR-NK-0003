import React, { useEffect, useState } from "react";
import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/Api";
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
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
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
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {loading && (
        <div className="text-sm text-slate-500">Loading dashboard...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-none shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stat.value}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm sm:text-lg font-bold text-slate-800">
                    Class Performance Analytics
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Average test scores vs Attendance trends
                  </p>
                </div>

                <select className="w-full sm:w-auto text-xs sm:text-sm border rounded-md p-2 bg-slate-50">
                  <option>Last 6 Weeks</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-56 sm:h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-slate-800">
              Upcoming Deadlines
            </h3>
            <button className="text-xs sm:text-sm text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {deadlines.map((item, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-3 flex gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {item.date} • {item.type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Navigation */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
              Quick Navigation
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-semibold">All Batches</span>
              </button>

              <button className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-600 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-semibold">Student List</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
