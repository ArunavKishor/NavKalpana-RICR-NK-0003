import React from "react";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, FileText, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

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

const TeacherDashboardHome = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-orange-400/20 to-pink-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome back, {user?.fullName || "Instructor"}! ✌️
                    </h1>
                    <p className="text-slate-500 max-w-2xl">
                        Here's what's happening in your classes today. Review your ongoing assessments, track student performance, and manage support requests all from one place.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    label="Total Students"
                    value="..."
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                    label="Pending Assessments"
                    value="..."
                    color="bg-orange-50"
                />
                <StatCard
                    icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                    label="Completed Grades"
                    value="..."
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
                    label="Active Courses"
                    value="..."
                    color="bg-purple-50"
                />
            </div>

            {/* Quick Actions & Recent Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Submissions</h3>
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
                        No recent submissions to review right now.
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Deadlines</h3>
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
                        You don't have any upcoming deadlines configured.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboardHome;
