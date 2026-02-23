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
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAssignments: 0,
    completedGrades: 0,
    activeBatches: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [lowPerformingStudents, setLowPerformingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch batches
      const batchesRes = await api.get("/api/batches");
      const batches = batchesRes?.data?.data?.batches || [];

      // Calculate total students across all batches
      const totalStudents = batches.reduce(
        (sum, b) => sum + (b.students?.length || 0),
        0,
      );

      // Fetch assessments for pending count
      const assessmentsRes = await api.get("/api/assessments");
      const assessments = assessmentsRes?.data?.data?.assessments || [];

      // Count pending assignments (not evaluated)
      const pendingAssignments = assessments.filter(
        (a) =>
          a.type === "assignment" &&
          a.submissions?.filter((s) => s.status !== "evaluated").length > 0,
      ).length;

      // Count evaluated submissions
      const completedGrades = assessments.reduce((sum, a) => {
        return (
          sum +
          (a.submissions?.filter((s) => s.status === "evaluated").length || 0)
        );
      }, 0);

      setStats({
        totalStudents,
        pendingAssignments,
        completedGrades,
        activeBatches: batches.filter((b) => b.status === "ongoing").length,
      });

      // Prepare performance data (weekly average scores)
      const weeks = [];
      for (let i = 0; i < 5; i++) {
        const weekNum = i + 1;
        const average = 75 + Math.random() * 20; // Dummy calculation
        weeks.push({ name: `Week ${weekNum}`, score: Math.round(average) });
      }
      setPerformanceData(weeks);

      // Fetch and process deadlines (next 7 days)
      const deadlinesData = assessments
        .filter((a) => {
          const dueDate = new Date(a.dueDate);
          const today = new Date();
          const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
          return daysUntilDue > 0 && daysUntilDue <= 7;
        })
        .slice(0, 5)
        .map((a) => ({
          title: a.title,
          dueDate: new Date(a.dueDate).toLocaleDateString(),
          type: a.type,
        }));
      setUpcomingDeadlines(deadlinesData);

      // Fetch and process low performing students (avg score < 65)
      try {
        const performanceRes = await api.get("/api/dashboard/performance");
        const studentPerformance =
          performanceRes?.data?.data?.studentPerformance || [];

        const lowPerformers = studentPerformance
          .filter((sp) => sp.averageScore < 65)
          .slice(0, 3)
          .map((sp) => ({
            name: sp.student?.fullName || "Unknown",
            course: sp.student?.batches?.[0]?.name || "Unassigned",
            score: Math.round(sp.averageScore),
          }));
        setLowPerformingStudents(lowPerformers);
      } catch (err) {
        console.log("Could not fetch performance metrics");
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

      {/* Quick Actions & Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Class Performance (Weekly)
          </h3>
          <div className="h-64 w-full flex-1">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
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
