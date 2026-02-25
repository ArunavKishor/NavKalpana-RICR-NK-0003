import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  FileText,
  CheckCircle,
  Users,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/config/Api";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getGreeting } from "@/lib/utils";

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white shadow-sm rounded-xl px-6 py-6 flex items-center gap-4 border border-slate-100"
  >
    <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </motion.div>
);

const TeacherDashboardHome = () => {
  const { user } = useAuth();
  const greeting = getGreeting();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAssignments: 0,
    completedGrades: 0,
    activeBatches: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [lowPerformingStudents, setLowPerformingStudents] = useState([]);
  const [classSummary, setClassSummary] = useState({
    averageOgi: 0,
    averageAttendance: 0,
    averageAssignmentScore: 0,
  });
  const [alerts, setAlerts] = useState({
    overdueAssignments: 0,
    veryLowOgiStudents: 0,
    attendanceDrops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch teacher-scoped KPI stats
      const teacherStatsRes = await api.get(
        "/api/dashboard/teacher/stats",
      );
      const teacherStats = teacherStatsRes?.data?.data || {};

      setStats({
        totalStudents: teacherStats.totalStudents || 0,
        pendingAssignments: teacherStats.pendingAssignments || 0,
        completedGrades: teacherStats.completedGrades || 0,
        activeBatches: teacherStats.activeBatches || 0,
      });

      // Fetch teacher performance data (weekly average scores)
      try {
        const performanceRes = await api.get("/api/dashboard/teacher/performance");
        const performanceData = performanceRes?.data?.data?.performanceData || [];

        // Transform the data to match the chart format
        const chartData = performanceData.map((item, index) => ({
          name: item.week ? `Week ${item.week.slice(-2)}` : `Week ${index + 1}`,
          score: Math.round(item.averageScore || 0),
        }));

        setPerformanceData(chartData);
      } catch (err) {
        console.log("Could not fetch performance data");
        setPerformanceData([]);
      }

      // Fetch and process upcoming deadlines for teacher's batches
      try {
        const deadlinesRes = await api.get("/api/dashboard/deadlines");
        const upcoming =
          deadlinesRes?.data?.data?.assessments?.slice(0, 5)?.map((a) => ({
            title: a.title,
            dueDate: new Date(a.dueDate).toLocaleDateString(),
            type: a.type,
          })) || [];
        setUpcomingDeadlines(upcoming);
      } catch (err) {
        console.log("Could not fetch upcoming deadlines");
        setUpcomingDeadlines([]);
      }

      // Fetch and process low performing students (using teacher analytics)
      try {
        const analyticsRes = await api.get("/api/dashboard/teacher/analytics");
        const analyticsData = analyticsRes?.data?.data || {};
        const students = analyticsData.students || [];

        const lowPerformers = students
          .filter((st) => (st.academicAverage || st.ogi || 0) < 65)
          .slice(0, 3)
          .map((st) => ({
            name: st.name || st.fullName || "Unknown",
            course: st.email || st.course || "Unassigned",
            score: Math.round(st.academicAverage || st.ogi || 0),
          }));
        setLowPerformingStudents(lowPerformers);

        // Class-level summary from analytics
        const classMetrics = analyticsData.classMetrics || {};
        setClassSummary({
          averageOgi: Math.round(classMetrics.averageOgi || 0),
          averageAttendance: Math.round(classMetrics.averageAttendance || 0),
          averageAssignmentScore: Math.round(
            classMetrics.averageAssignmentScore || 0,
          ),
        });

        // Simple alerts based on analytics
        setAlerts({
          overdueAssignments: analyticsData.overdueAssignments || 0,
          veryLowOgiStudents: (students || []).filter(
            (st) => (st.ogi || st.academicAverage || 0) < 50,
          ).length,
          attendanceDrops: analyticsData.attendanceDropCount || 0,
        });
      } catch (err) {
        console.log("Could not fetch teacher analytics metrics");
      }
    } catch (err) {
      console.error("Load dashboard data failed:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {greeting}, {user?.fullName || "Teacher"}! 👋
        </h1>
        <p className="text-slate-500 font-medium">
          Here's what's happening in your classes today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Students"
          value={stats.totalStudents}
          color="bg-blue-50"
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-orange-600" />}
          label="Pending Assignments"
          value={stats.pendingAssignments}
          color="bg-orange-50"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
          label="Completed Grades"
          value={stats.completedGrades}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
          label="Active Batches"
          value={stats.activeBatches}
          color="bg-purple-50"
        />
      </div>

      {/* Class Summary + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Average Class Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Overall OGI
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {classSummary.averageOgi}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Blended attendance and academic scores
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Avg Attendance
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {classSummary.averageAttendance}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across your active batches
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Avg Assignment Score
              </p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">
                {classSummary.averageAssignmentScore}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Evaluated assignments only
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Alerts & Risks
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div>
                <p className="font-semibold text-amber-800">
                  Overdue assignments
                </p>
                <p className="text-xs text-amber-700">
                  Assessments past due with pending submissions.
                </p>
              </div>
              <span className="text-lg font-bold text-amber-800">
                {alerts.overdueAssignments}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
              <div>
                <p className="font-semibold text-red-800">
                  Very low OGI students
                </p>
                <p className="text-xs text-red-700">
                  Students under 50 OGI in your classes.
                </p>
              </div>
              <span className="text-lg font-bold text-red-800">
                {alerts.veryLowOgiStudents}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
              <div>
                <p className="font-semibold text-sky-800">
                  Attendance drops
                </p>
                <p className="text-xs text-sky-700">
                  Batches with recent attendance decline.
                </p>
              </div>
              <span className="text-lg font-bold text-sky-800">
                {alerts.attendanceDrops}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Class Performance (Weekly)
          </h3>
          <div className="h-64 w-full" style={{ minHeight: '250px' }}>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={performanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center h-full flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Upcoming Deadlines
            </h3>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl flex-1 flex items-center justify-center">
              <p>No upcoming deadlines in the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {upcomingDeadlines.map((deadline, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                >
                  <p className="font-medium text-sm text-slate-900 line-clamp-1">
                    {deadline.title}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-600">{deadline.dueDate}</span>
                    <span
                      className={`px-2 py-1 rounded font-semibold ${deadline.type === "assignment" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {deadline.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Low Performing Students
          </h3>
          {lowPerformingStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl flex-1 flex items-center justify-center">
              All students are performing well.
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {lowPerformingStudents.map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {student.course}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-600">
                      {student.score}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation & Actions Row */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
              Quick Navigation
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/teacher-dashboard/batches"
                className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-blue-200"
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-semibold">Batches</span>
              </a>

              <a
                href="/teacher-dashboard/assessments"
                className="w-full bg-slate-50 hover:bg-orange-50 hover:text-orange-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-orange-200"
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm font-semibold">Assessments</span>
              </a>

              <a
                href="/teacher-dashboard/students"
                className="w-full bg-slate-50 hover:bg-green-50 hover:text-green-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-green-200"
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-semibold">Students</span>
              </a>

              <a
                href="/teacher-dashboard/support"
                className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-purple-200"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm font-semibold">Support</span>
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/teacher-dashboard/assessments"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-orange-600 group transition-all"
              >
                <div className="p-2.5 rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-100">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Create Assessment</span>
              </a>

              <a
                href="/teacher-dashboard/batches"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-blue-600 group transition-all"
              >
                <div className="p-2.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Mark Attendance</span>
              </a>

              <a
                href="/teacher-dashboard/support"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-purple-600 group transition-all"
              >
                <div className="p-2.5 rounded-md bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Support Requests</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardHome;
