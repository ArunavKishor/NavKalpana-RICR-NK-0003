import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Legend,
} from "recharts";
import api from "@/config/Api";
import { TrendingUp, TrendingDown, Minus, User, Download, Github, Linkedin, Flame, Star } from "lucide-react";

const StudentDetailModal = ({ student, batch, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [weeklySnapshots, setWeeklySnapshots] = useState([]);

  useEffect(() => {
    if (isOpen && student?._id) {
      loadStudentDetails();
    }
  }, [isOpen, student?._id]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const [progressRes, attendanceRes, snapshotsRes] = await Promise.all([
        api.get(`/api/students/${student._id}/progress`),
        api.get(`/api/attendance?student=${student._id}&batch=${batch?._id}`),
        api
          .get(`/api/dashboard/students/${student._id}/weekly-snapshots`, {
            params: { weeks: 8 },
          })
          .catch(() => ({ data: { data: { snapshots: [] } } })),
      ]);
      setProgressData(progressRes.data.data);
      setAttendanceRecords(attendanceRes.data.data.records || []);
      setWeeklySnapshots(snapshotsRes.data?.data?.snapshots || []);
    } catch (err) {
      console.error("Failed to load student details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const rows = [["Date", "Status", "Remarks"]];
    attendanceRecords.forEach((r) => {
      rows.push([
        new Date(r.date).toLocaleDateString(),
        r.status,
        r.remarks || "",
      ]);
    });
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${student?.user?.fullName?.replace(/\s+/g, "_") || "student"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute learning streak: consecutive recent weeks with ogi > 0
  const learningStreak = (() => {
    const sorted = [...weeklySnapshots].sort(
      (a, b) => new Date(b.weekStart) - new Date(a.weekStart),
    );
    let streak = 0;
    for (const snap of sorted) {
      if ((snap.ogi || 0) > 0) streak++;
      else break;
    }
    return streak;
  })();

  const latestSkills =
    weeklySnapshots.length > 0
      ? weeklySnapshots[weeklySnapshots.length - 1].skillAcquisitionCount || 0
      : 0;

  // Chart data: weekly snapshots sorted oldest→newest, label by week number
  const weeklyChartData = [...weeklySnapshots]
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart))
    .map((s) => ({
      week: new Date(s.weekStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      OGI: Math.round(s.ogi || 0),
      Attendance: Math.round(s.attendancePercentage || 0),
      Quiz: Math.round(s.quizAverage || 0),
      Assignment: Math.round(s.assignmentAverage || 0),
      Hours: Math.round((s.weeklyLearningHours || 0) * 10) / 10,
    }));

  // Attendance calendar modifiers
  const modifiers = {
    present: attendanceRecords
      .filter((r) => r.status === "present")
      .map((r) => new Date(r.date)),
    absent: attendanceRecords
      .filter((r) => r.status === "absent")
      .map((r) => new Date(r.date)),
    late: attendanceRecords
      .filter((r) => r.status === "late")
      .map((r) => new Date(r.date)),
  };

  const modifierStyles = {
    present: { color: "white", backgroundColor: "#10b981" },
    absent: { color: "white", backgroundColor: "#ef4444" },
    late: { color: "white", backgroundColor: "#f59e0b" },
  };

  const attPct = progressData?.attendance?.percentage || 0;
  const acadPct = progressData?.academics?.averageGrade || 0;
  const attContrib = Math.round(attPct * 0.4 * 10) / 10;
  const acadContrib = Math.round(acadPct * 0.6 * 10) / 10;

  // Week-over-week comparison: latest 2 snapshots with deltas
  const sortedSnapshots = [...weeklySnapshots].sort(
    (a, b) => new Date(a.weekStart) - new Date(b.weekStart),
  );
  const latestSnap = sortedSnapshots[sortedSnapshots.length - 1];
  const prevSnap = sortedSnapshots.length >= 2 ? sortedSnapshots[sortedSnapshots.length - 2] : null;
  const latestDelta = latestSnap?.delta || null;

  const DeltaIndicator = ({ value }) => {
    if (value == null || value === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
          <Minus className="w-3 h-3" /> 0
        </span>
      );
    }
    if (value > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-semibold">
          <TrendingUp className="w-3 h-3" /> +{value}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-red-600 font-semibold">
        <TrendingDown className="w-3 h-3" /> {value}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {student?.user?.fullName}
              </DialogTitle>
              {batch?.course && (
                <p className="text-sm text-slate-500 mt-0.5">{batch.course}</p>
              )}
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{student?.enrollmentId}</Badge>
                <Badge
                  variant={
                    student?.status === "active" ? "success" : "secondary"
                  }
                >
                  {student?.status}
                </Badge>
                {attPct > 0 && (
                  <Badge
                    className={`${
                      attPct >= 75
                        ? "bg-emerald-100 text-emerald-700"
                        : attPct >= 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {attPct}% Attendance
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="progress" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Course Info</TabsTrigger>
            <TabsTrigger value="progress">Academic Progress</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* ── Course Info Tab (#5, #11) ── */}
          <TabsContent value="info" className="space-y-4">
            {/* Batch / Course grid */}
            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Batch Name</p>
                <p className="font-semibold">{batch?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Course</p>
                <p className="font-semibold">{batch?.course || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Instructor</p>
                <p className="font-semibold">
                  {batch?.instructorName ||
                    batch?.instructor?.user?.fullName ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Joined Date</p>
                <p className="font-semibold">
                  {student?.createdAt
                    ? new Date(student.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* GitHub */}
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </p>
                {student?.github ? (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium truncate block"
                  >
                    {student.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">Not provided</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </p>
                {student?.linkedin ? (
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium truncate block"
                  >
                    {student.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">Not provided</p>
                )}
              </div>
            </div>

            {/* Skills + Streak badges */}
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs text-amber-600 font-semibold uppercase">
                    Skills Acquired
                  </p>
                  <p className="text-2xl font-black text-amber-700">
                    {latestSkills}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs text-orange-600 font-semibold uppercase">
                    Learning Streak
                  </p>
                  <p className="text-2xl font-black text-orange-700">
                    {learningStreak}{" "}
                    <span className="text-sm font-medium">weeks</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly learning hours chart */}
            {weeklyChartData.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">
                  Weekly Learning Hours
                </h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10 }} width={28} />
                      <Tooltip />
                      <Bar
                        dataKey="Hours"
                        fill="#f97316"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Academic Progress Tab (#4, #9) ── */}
          <TabsContent value="progress" className="space-y-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                Loading progress...
              </div>
            ) : (
              <>
                {/* Top 3 stat cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Overall OGI
                    </p>
                    <p className="text-3xl font-black text-blue-700">
                      {progressData?.ogi}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-emerald-50">
                    <p className="text-xs text-emerald-600 font-bold uppercase">
                      Avg Grade
                    </p>
                    <p className="text-3xl font-black text-emerald-700">
                      {progressData?.academics?.averageGrade}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <p className="text-xs text-orange-600 font-bold uppercase">
                      Attendance
                    </p>
                    <p className="text-3xl font-black text-orange-700">
                      {progressData?.attendance?.percentage}%
                    </p>
                  </div>
                </div>

                {/* OGI Formula Breakdown */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    OGI Breakdown (40% Attendance + 60% Academic)
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Attendance contribution (40%)</span>
                        <span className="font-semibold text-blue-700">
                          +{attContrib} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(attPct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Academic contribution (60%)</span>
                        <span className="font-semibold text-emerald-700">
                          +{acadContrib} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(acadPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Statistics */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Submitted",
                      value: progressData?.academics?.totalSubmissions ?? 0,
                      color: "text-slate-700",
                    },
                    {
                      label: "Evaluated",
                      value: progressData?.academics?.evaluated ?? 0,
                      color: "text-blue-700",
                    },
                    {
                      label: "Score Earned",
                      value: progressData?.academics?.totalScore ?? 0,
                      color: "text-emerald-700",
                    },
                    {
                      label: "Max Possible",
                      value: progressData?.academics?.maxPossibleScore ?? 0,
                      color: "text-slate-500",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="p-3 border rounded-lg text-center bg-white"
                    >
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                        {label}
                      </p>
                      <p className={`text-xl font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Weekly trend line chart (#9) */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Weekly Performance Trend
                  </h4>
                  {weeklyChartData.length > 0 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E2E8F0"
                          />
                          <XAxis
                            dataKey="week"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            domain={[0, 100]}
                            width={28}
                          />
                          <Tooltip />
                          <Legend
                            wrapperStyle={{ fontSize: "11px" }}
                            iconSize={10}
                          />
                          <Line
                            type="monotone"
                            dataKey="OGI"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="Attendance"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="Quiz"
                            stroke="#f59e0b"
                            strokeWidth={1.5}
                            dot={false}
                            strokeDasharray="4 2"
                          />
                          <Line
                            type="monotone"
                            dataKey="Assignment"
                            stroke="#8b5cf6"
                            strokeWidth={1.5}
                            dot={false}
                            strokeDasharray="4 2"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                      No weekly snapshot data available yet.
                    </p>
                  )}
                </div>

                {/* Week-over-Week Comparison */}
                {latestSnap && prevSnap && latestDelta && (
                  <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Week-over-Week Comparison
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-white rounded-lg border">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                          Previous Week
                        </p>
                        <p className="text-xs text-slate-400 mb-2">
                          {new Date(prevSnap.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between"><span>OGI</span><span className="font-bold">{Math.round(prevSnap.ogi || 0)}%</span></div>
                          <div className="flex justify-between"><span>Attendance</span><span className="font-bold">{Math.round(prevSnap.attendancePercentage || 0)}%</span></div>
                          <div className="flex justify-between"><span>Quiz Avg</span><span className="font-bold">{Math.round(prevSnap.quizAverage || 0)}%</span></div>
                          <div className="flex justify-between"><span>Assignment Avg</span><span className="font-bold">{Math.round(prevSnap.assignmentAverage || 0)}%</span></div>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                          Current Week
                        </p>
                        <p className="text-xs text-slate-400 mb-2">
                          {new Date(latestSnap.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between"><span>OGI</span><span className="font-bold">{Math.round(latestSnap.ogi || 0)}%</span> <DeltaIndicator value={latestDelta.ogi} /></div>
                          <div className="flex justify-between"><span>Attendance</span><span className="font-bold">{Math.round(latestSnap.attendancePercentage || 0)}%</span> <DeltaIndicator value={latestDelta.attendancePercentage} /></div>
                          <div className="flex justify-between"><span>Quiz Avg</span><span className="font-bold">{Math.round(latestSnap.quizAverage || 0)}%</span> <DeltaIndicator value={latestDelta.quizAverage} /></div>
                          <div className="flex justify-between"><span>Assignment Avg</span><span className="font-bold">{Math.round(latestSnap.assignmentAverage || 0)}%</span> <DeltaIndicator value={latestDelta.assignmentAverage} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Attendance Tab ── */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Attendance Records</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={attendanceRecords.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-semibold mb-4 w-full">
                  Attendance Calendar
                </h4>
                <Calendar
                  mode="multiple"
                  selected={[
                    ...modifiers.present,
                    ...modifiers.absent,
                    ...modifiers.late,
                  ]}
                  modifiers={modifiers}
                  modifiersStyles={modifierStyles}
                  className="border rounded-md shadow-sm"
                />
                <div className="flex gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded" /> Present
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" /> Absent
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded" /> Late
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Summary Breakdown</h4>
                <div className="space-y-4">
                  {[
                    {
                      label: "Present Days",
                      count: progressData?.attendance?.present,
                      color: "bg-emerald-500",
                      textColor: "text-emerald-600",
                    },
                    {
                      label: "Absent Days",
                      count: progressData?.attendance?.absent,
                      color: "bg-red-500",
                      textColor: "text-red-600",
                    },
                    {
                      label: "Late Arrivals",
                      count: progressData?.attendance?.late,
                      color: "bg-yellow-500",
                      textColor: "text-yellow-600",
                    },
                  ].map(({ label, count, color, textColor }) => {
                    const total = progressData?.attendance?.total || 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span>{label}</span>
                          <span className={`font-bold ${textColor}`}>
                            {count}
                            <span className="text-slate-400 font-normal text-xs ml-1">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Date-wise Attendance Records with Remarks */}
            {attendanceRecords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Date-wise Records</h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {[...attendanceRecords]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record) => (
                      <div
                        key={record._id}
                        className="flex items-start justify-between text-sm p-2 rounded-md bg-white border border-slate-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              record.status === "present"
                                ? "bg-emerald-500"
                                : record.status === "absent"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-slate-700">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Badge
                            className={`capitalize text-[10px] px-1.5 py-0 ${
                              record.status === "present"
                                ? "bg-emerald-50 text-emerald-600"
                                : record.status === "absent"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            {record.status}
                          </Badge>
                        </div>
                        {record.remarks && (
                          <span className="text-xs text-slate-400 italic ml-2 truncate max-w-[200px]">
                            {record.remarks}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;
