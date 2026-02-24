import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Search,
  MessageSquare,
  FileText,
  LayoutDashboard,
  GraduationCap,
  Zap,
  Star,
  Activity,
  UserCheck,
  LifeBuoy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/Api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const TeacherDashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeBatches: 0,
    totalStudents: 0,
    pendingAssessments: 0,
    avgAttendance: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const [batchesRes, studentsRes] = await Promise.all([
          api.get("/api/batches"),
          api.get("/api/students", { params: { limit: 1 } }),
        ]);

        const batches = batchesRes?.data?.data || [];
        setStats({
          activeBatches: batches.length,
          totalStudents: studentsRes?.data?.data?.pagination?.total || 0,
          pendingAssessments: 8, // Mocked for design
          avgAttendance: 92, // Mocked for design
        });

        // Set recent activities
        setRecentActivities([
          {
            id: 1,
            type: "GRADED",
            title: "Web Dev Quiz",
            student: "Aarav Kumar",
            time: "2h ago",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            id: 2,
            type: "NEW_SUPPORT",
            title: "Setup Query",
            student: "Ishita Gupta",
            time: "4h ago",
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            id: 3,
            type: "BATCH_UPDATE",
            title: "React Module-2",
            student: "Batch #402",
            time: "1d ago",
            color: "bg-rose-50 text-rose-600",
          },
        ]);
      } catch (err) {
        console.error("Dashboard load error:", err);
        toast.error("Cloud synchronization failed");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickLinks = [
    {
      label: "Batch Hub",
      href: "/teacher-dashboard/batches",
      icon: <BookOpen className="w-6 h-6" />,
      desc: "Active cohorts & schedules",
      color: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-200",
    },
    {
      label: "Grade Hub",
      href: "/teacher-dashboard/assessments",
      icon: <FileText className="w-6 h-6" />,
      desc: "Evaluation & progress tracking",
      color: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-200",
    },
    {
      label: "Quiz Matrix",
      href: "/teacher-dashboard/quizzes",
      icon: <CheckCircle className="w-6 h-6" />,
      desc: "Live automated examinations",
      color: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-200",
    },
    {
      label: "Scholar Index",
      href: "/teacher-dashboard/students",
      icon: <Users className="w-6 h-6" />,
      desc: "Student performance logs",
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-200",
    },
  ];

  return (
    <div className="space-y-10 pb-12 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/30 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-indigo-100/30 blur-[100px] rounded-full -z-10" />

      {/* Hero Welcome Section */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                Premium Portal
              </div>
              <div className="text-slate-400 text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Shape the{" "}
              <span className="text-rose-600 underline decoration-rose-200 decoration-8 underline-offset-8">
                Future
              </span>{" "}
              of Learning
            </h1>
            <p className="text-slate-500 mt-6 text-lg font-medium max-w-xl leading-relaxed">
              Welcome back, Senior Educator. Your digital classroom is
              synchronized and ready for the next session.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block relative"
          >
            <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-10 animate-pulse" />
            <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 text-center w-64">
              <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-slate-900 to-slate-800 flex items-center justify-center shadow-xl shadow-slate-200 -mt-16">
                <Award className="w-12 h-12 text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Elite Teacher</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Status Verified
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-orange-400 fill-orange-400"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Intelligence Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Active Cohorts",
            value: stats.activeBatches,
            icon: BookOpen,
            color: " rose",
            growth: "+12%",
          },
          {
            label: "Engaged Scholars",
            value: stats.totalStudents,
            icon: Users,
            color: "indigo",
            growth: "+45",
          },
          {
            label: "Pending Reviews",
            value: stats.pendingAssessments,
            icon: FileText,
            color: "orange",
            growth: "-2",
          },
          {
            label: "Avg. Attendance",
            value: `${stats.avgAttendance}%`,
            icon: Activity,
            color: "emerald",
            growth: "+4%",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border border-slate-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-rose-50 transition-colors" />

            <div className="relative flex flex-col h-full">
              <div
                className={`w-14 h-14 rounded-2xl bg-slate-900 group-hover:bg-rose-500 transition-colors flex items-center justify-center mb-6 shadow-lg shadow-slate-100 group-hover:rotate-6`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-end gap-3 mt-2">
                <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
                  {stat.value}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.growth.startsWith("+") ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                >
                  {stat.growth}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Navigation Grid (Quick Access) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Management Hub
              <div className="h-1 w-12 bg-rose-500 rounded-full" />
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.label}
                whileHover={{ y: -8 }}
                onClick={() => navigate(link.href)}
                className={`bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm cursor-pointer group hover:border-slate-300 transition-all duration-300 overflow-hidden relative`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-bl-[4rem]`}
                />

                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-tr ${link.color} flex items-center justify-center mb-6 shadow-xl ${link.shadow} group-hover:rotate-12 transition-transform duration-500`}
                >
                  {React.cloneElement(link.icon, {
                    className: "text-white w-7 h-7",
                  })}
                </div>

                <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                  {link.label}
                </h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {link.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-rose-600 transition-colors">
                  Access Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Intelligence Side Rail */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-slate-900">
            Live Intelligence
          </h3>

          <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-rose-500 via-indigo-500 to-orange-500" />

            <div className="flex items-center justify-between mb-8">
              <span className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Recent Submissions
              </span>
              <button
                onClick={() => navigate("/teacher-dashboard/assessments")}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                View All
              </button>
            </div>

            <div className="space-y-6">
              {recentActivities.map((act) => (
                <motion.div
                  key={act.id}
                  className="flex gap-4 group/item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${act.color} flex items-center justify-center shrink-0 border border-white/10 group-hover/item:scale-110 transition-transform`}
                  >
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover/item:text-rose-400 transition-colors">
                      {act.student}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      {act.title}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-tighter">
                      {act.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                "Great teachers inspire hope, ignite the imagination, and
                instill a love of learning."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  Thought of the day
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/teacher-dashboard/support")}
            className="bg-indigo-600 rounded-[2.5rem] p-8 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <LifeBuoy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h5 className="font-bold text-white text-lg">Support Desk</h5>
                <p className="text-indigo-100 text-sm opacity-80">
                  Help is one tap away
                </p>
              </div>
              <ArrowUpRight className="ml-auto text-white w-6 h-6 opacity-40" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardHome;
