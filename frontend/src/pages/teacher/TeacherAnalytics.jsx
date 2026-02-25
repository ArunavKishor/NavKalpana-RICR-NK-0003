import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Trophy, Users, Activity, Flame, FileText } from "lucide-react";
import api from "@/config/Api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StudentDetailModal from "@/components/teacher/StudentDetailModal";

const StatCard = ({ icon, label, value, suffix = "" }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white shadow-sm rounded-xl px-5 py-4 flex items-center gap-3 border border-slate-100"
  >
    <div className="p-3 rounded-xl bg-slate-50 text-slate-700">{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">
        {value}
        {suffix}
      </p>
    </div>
  </motion.div>
);

const TeacherAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({
    batchId: "ALL",
    sortBy: "ogi",
    order: "desc",
  });
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const leaderboardInterval = useRef(null);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (leaderboardInterval.current) clearInterval(leaderboardInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      loadLeaderboard();

      // Auto-refresh leaderboard every 60 seconds
      if (leaderboardInterval.current) clearInterval(leaderboardInterval.current);
      leaderboardInterval.current = setInterval(() => {
        loadLeaderboard();
      }, 60000);
    }
    return () => {
      if (leaderboardInterval.current) clearInterval(leaderboardInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.batchId, filters.sortBy, filters.order]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [batchRes, analyticsRes] = await Promise.all([
        api.get("/api/batches"),
        api.get("/api/dashboard/teacher/analytics"),
      ]);

      const batchList = batchRes?.data?.data?.batches || [];
      setBatches(batchList);

      setAnalytics(analyticsRes?.data?.data || null);
      await loadLeaderboard(batchList, analyticsRes?.data?.data);
    } catch (err) {
      console.error("Load analytics failed:", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (existingBatches, existingAnalytics) => {
    try {
      const params = {};
      if (filters.batchId && filters.batchId !== "ALL") {
        params.batchId = filters.batchId;
      }
      params.sortBy = filters.sortBy;
      params.order = filters.order;

      const { data } = await api.get("/api/dashboard/teacher/leaderboard", {
        params,
      });
      const list = data?.data?.leaderboard || [];
      setLeaderboard(list);

      if (!analytics && existingAnalytics) {
        setAnalytics(existingAnalytics);
      }
      if (!batches.length && existingBatches) {
        setBatches(existingBatches);
      }
    } catch (err) {
      console.error("Load leaderboard failed:", err);
      toast.error("Failed to load leaderboard");
    }
  };

  const classMetrics = analytics?.classMetrics || {};
  const weeklyTrend = analytics?.weeklyActivityTrend || [];
  const moduleAttendance = analytics?.moduleAttendanceComparison || [];
  const attendanceHeatmap = analytics?.attendanceHeatmap || [];
  const students = analytics?.students || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Performance Analytics & Leaderboard
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Monitor class performance, growth trends, and top performers in real
          time.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Average Quiz Score"
          value={Math.round(classMetrics.averageQuizScore || 0)}
          suffix="%"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Average Assignment Score"
          value={Math.round(classMetrics.averageAssignmentScore || 0)}
          suffix="%"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Submission Consistency"
          value={Math.round(classMetrics.submissionConsistency || 0)}
          suffix="%"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Overall Class OGI"
          value={Math.round(classMetrics.overallClassOgi || 0)}
          suffix="%"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Activity Trend
            </h3>
          </div>
          <div className="h-64 w-full" style={{ minHeight: "250px" }}>
            {weeklyTrend.length ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickFormatter={(v) => v?.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendancePercentage"
                    stroke="#0ea5e9"
                    name="Attendance %"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ogi"
                    stroke="#4f46e5"
                    name="OGI"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Module-wise attendance comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Module-wise Attendance
          </h3>
          <div className="h-64 w-full" style={{ minHeight: "250px" }}>
            {moduleAttendance.length ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={moduleAttendance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar
                    dataKey="attendancePercentage"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No attendance summary available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student monitoring + leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student performance monitoring */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Student Performance Monitoring
            </h3>
            <p className="text-xs text-slate-500">
              Click a row to open detailed insights
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>OGI</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Module Completion</TableHead>
                  <TableHead>Weekly Hours</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Streak (weeks)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500"
                    >
                      No students found for your batches.
                    </TableCell>
                  </TableRow>
                )}
                {students.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => {
                      setSelectedStudent({
                        _id: s.id,
                        user: { fullName: s.name, email: s.email },
                      });
                      setSelectedBatch(
                        batches.find((b) =>
                          (b.students || []).some(
                            (stId) => stId.toString() === s.id,
                          ),
                        ) || null,
                      );
                    }}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{Math.round(s.ogi || 0)}%</TableCell>
                    <TableCell>{s.growthClassification}</TableCell>
                    <TableCell>
                      {Math.round(s.moduleCompletionProgress || 0)}%
                    </TableCell>
                    <TableCell>{s.weeklyLearningHours || 0}</TableCell>
                    <TableCell>{s.skillAcquisitionCount || 0}</TableCell>
                    <TableCell>{s.learningStreak || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Class Leaderboard
              </h3>
            </div>
          </div>

          {/* Course filter */}
          {(() => {
            const uniqueCourses = [
              "ALL",
              ...new Set(batches.map((b) => b.course).filter(Boolean)),
            ];
            const courseBatches =
              courseFilter === "ALL"
                ? batches
                : batches.filter((b) => b.course === courseFilter);
            return (
              <>
                {uniqueCourses.length > 2 && (
                  <div className="mb-2">
                    <Select
                      value={courseFilter}
                      onValueChange={(val) => {
                        setCourseFilter(val);
                        setFilters((prev) => ({ ...prev, batchId: "ALL" }));
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Filter by course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Courses</SelectItem>
                        {uniqueCourses
                          .filter((c) => c !== "ALL")
                          .map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <Select
                    value={filters.batchId}
                    onValueChange={(val) =>
                      setFilters((prev) => ({ ...prev, batchId: val }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Filter by batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Batches</SelectItem>
                      {courseBatches.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortBy}
                    onValueChange={(val) =>
                      setFilters((prev) => ({ ...prev, sortBy: val }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-28">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ogi">OGI</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="assignmentScore">
                        Assignment Score
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        order: prev.order === "asc" ? "desc" : "asc",
                      }))
                    }
                  >
                    {filters.order === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </>
            );
          })()}

          <div className="space-y-2 flex-1 overflow-y-auto">
            {leaderboard.length === 0 && (
              <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
                No leaderboard data yet.
              </div>
            )}
            {leaderboard.slice(0, 10).map((row, idx) => (
              <div
                key={row.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  setSelectedStudent({
                    _id: row.id,
                    user: { fullName: row.name, email: row.email },
                  });
                  setSelectedBatch(
                    batches.find((b) =>
                      (b.students || []).some(
                        (stId) => stId.toString() === row.id,
                      ),
                    ) || null,
                  );
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {row.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      OGI {Math.round(row.ogi || 0)}% • Att{" "}
                      {Math.round(row.attendance || 0)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-600">
                    {Math.round(row.assignmentScore || 0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance heatmap as simple sparkline list */}
      {attendanceHeatmap.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Attendance Heatmap (Last {attendanceHeatmap.length} days)
          </h3>
          <div className="flex gap-1 flex-wrap">
            {attendanceHeatmap.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${Math.round(d.intensity)}% attendance`}
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor:
                    d.intensity === 0
                      ? "#E5E7EB"
                      : `rgba(34,197,94,${0.2 + d.intensity / 120})`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Student insights modal */}
      <StudentDetailModal
        student={selectedStudent}
        batch={selectedBatch}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};

export default TeacherAnalytics;
