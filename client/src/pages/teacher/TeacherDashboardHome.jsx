import React from "react";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, FileText, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const StatCard = ({ icon, label, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white shadow-sm rounded-xl px-6 py-6 flex items-center gap-4 border border-slate-100"
    >
        <div className={`p-4 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </motion.div>
);

const classPerformanceData = [
    { name: "Week 1", score: 85 },
    { name: "Week 2", score: 88 },
    { name: "Week 3", score: 92 },
    { name: "Week 4", score: 90 },
    { name: "Week 5", score: 95 },
];

const lowPerformingStudents = [
    { name: "Alex Johnson", course: "Web Development", score: 55 },
    { name: "Sarah Smith", course: "UI/UX Design", score: 62 },
    { name: "Mike Davis", course: "Data Science", score: 58 },
];

const TeacherDashboardHome = () => {
    return (
        <div className="w-full space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    label="Total Students"
                    value="0"
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                    label="Pending Assessments"
                    value="0"
                    color="bg-orange-50"
                />
                <StatCard
                    icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                    label="Completed Grades"
                    value="0"
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
                    label="Active Courses"
                    value="0"
                    color="bg-purple-50"
                />
            </div>

            {/* Quick Actions & Recent Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Class Performance</h3>
                    <div className="h-64 w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar
                                    dataKey="score"
                                    fill="#4f46e5"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Deadlines</h3>
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl flex-1 flex items-center justify-center">
                        You don't have any upcoming deadlines configured.
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Low Performing</h3>
                    {lowPerformingStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl flex-1 flex items-center justify-center">
                            All students are performing well.
                        </div>
                    ) : (
                        <div className="space-y-4 flex-1">
                            {lowPerformingStudents.map((student, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{student.name}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{student.course}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-red-600">{student.score}%</p>
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
                                href="/teacher-dashboard/assessments"
                                className="w-full bg-slate-50 hover:bg-orange-50 hover:text-orange-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-orange-200"
                            >
                                <FileText className="w-6 h-6" />
                                <span className="text-sm font-semibold">Assessments</span>
                            </a>

                            <a
                                href="/teacher-dashboard/students"
                                className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 p-4 rounded-xl flex flex-col items-center gap-3 transition-colors border border-transparent hover:border-blue-200"
                            >
                                <Users className="w-6 h-6" />
                                <span className="text-sm font-semibold">My Students</span>
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
                                href="/teacher-dashboard/assessments?action=create"
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-orange-600 group transition-all"
                            >
                                <div className="p-2.5 rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-100">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium">Create New Assessment</span>
                            </a>

                            <a
                                href="/teacher-dashboard/students?action=view"
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-blue-600 group transition-all"
                            >
                                <div className="p-2.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium">Review Student Progress</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboardHome;
