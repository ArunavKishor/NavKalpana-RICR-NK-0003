import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "@/config/Api";
import { 
  TrendingUp, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  Award, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StudentDetailModal = ({ student, batch, isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    useEffect(() => {
        if (isOpen && student?._id) {
            loadStudentDetails();
        }
    }, [isOpen, student?._id]);

    const loadStudentDetails = async () => {
        try {
            setLoading(true);
            const [progressRes, attendanceRes] = await Promise.all([
                api.get(`/api/students/${student._id}/progress`),
                api.get(`/api/attendance?student=${student._id}&batch=${batch?._id}`)
            ]);
            setProgressData(progressRes.data.data);
            setAttendanceRecords(attendanceRes.data.data.attendance || []);
        } catch (err) {
            console.error("Failed to load student details:", err);
        } finally {
            setLoading(false);
        }
    };

    const modifiers = {
        present: attendanceRecords.filter(r => r.status === "present").map(r => new Date(r.date)),
        absent: attendanceRecords.filter(r => r.status === "absent").map(r => new Date(r.date)),
        late: attendanceRecords.filter(r => r.status === "late").map(r => new Date(r.date)),
    };

    const modifierStyles = {
        present: { color: 'white', backgroundColor: '#10b981', borderRadius: '12px' },
        absent: { color: 'white', backgroundColor: '#f43f5e', borderRadius: '12px' },
        late: { color: 'white', backgroundColor: '#6366f1', borderRadius: '12px' },
    };

    const chartData = [
        { name: "Attendance", value: progressData?.attendance?.percentage || 0, color: '#f43f5e' },
        { name: "Academic", value: progressData?.academics?.averageGrade || 0, color: '#6366f1' },
        { name: "Mastery", value: progressData?.ogi || 0, color: '#10b981' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-2xl bg-white flex flex-col">
                <AnimatePresence>
                    {loading ? (
                        <div className="h-150 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mb-4" />
                            <p className="text-slate-500 font-bold italic">Synchronizing Student Intelligence Hub...</p>
                        </div>
                    ) : (
                        <>
                            {/* Premium Header */}
                            <div className="relative bg-slate-900 p-8 pt-12 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl -ml-32 -mb-32 rounded-full" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-rose-500/40 transition-all rounded-full" />
                                        <div className="relative h-24 w-24 rounded-[2rem] border-4 border-white/10 overflow-hidden shadow-2xl bg-slate-800 flex items-center justify-center">
                                            {student?.user?.profilePicture ? (
                                                <img src={student.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                                            <Badge className="bg-rose-500 hover:bg-rose-600 border-none font-bold px-3 py-1 rounded-lg">
                                                {student?.enrollmentId}
                                            </Badge>
                                            <Badge variant="outline" className={`${student?.status === "active" ? "border-emerald-400 text-emerald-400" : "border-slate-400 text-slate-400"} font-bold bg-white/5`}>
                                                {student?.status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{student?.user?.fullName}</h2>
                                        <p className="text-slate-400 font-medium mt-1 flex items-center gap-2 justify-center md:justify-start">
                                            <Mail className="w-4 h-4" /> {student?.user?.email}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-2">
                                        <div className="text-4xl font-black text-rose-500 tabular-nums leading-none">{progressData?.ogi || 0}%</div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Overall Proficiency</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                                <Tabs defaultValue="progress" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-8 h-auto">
                                        <TabsTrigger value="info" className="rounded-xl py-3 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Student Profile</TabsTrigger>
                                        <TabsTrigger value="progress" className="rounded-xl py-3 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Academic Lens</TabsTrigger>
                                        <TabsTrigger value="attendance" className="rounded-xl py-3 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Live Calendar</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="info" className="space-y-6 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { label: "Active Cohort", value: batch?.name, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
                                                { label: "Academic Stream", value: batch?.course, icon: GraduationCap, color: "text-rose-600", bg: "bg-rose-50" },
                                                { label: "Primary Instructor", value: batch?.instructor || "Unassigned", icon: User, color: "text-emerald-600", bg: "bg-emerald-50" },
                                                { label: "Enrollment Date", value: new Date(student?.createdAt).toLocaleDateString(), icon: CalendarIcon, color: "text-amber-600", bg: "bg-amber-50" },
                                            ].map((item, idx) => (
                                                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                                                    <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">{item.label}</p>
                                                        <p className="text-lg font-bold text-slate-900 leading-none">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="progress" className="space-y-8 mt-0">
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: "Current OGI", value: `${progressData?.ogi}%`, color: "rose", icon: Award },
                                                { label: "Avg Grade", value: `${progressData?.academics?.averageGrade}%`, color: "indigo", icon: TrendingUp },
                                                { label: "Attendance", value: `${progressData?.attendance?.percentage}%`, color: "emerald", icon: Activity },
                                            ].map((kpi, i) => (
                                                <div key={i} className={`p-5 rounded-3xl border border-${kpi.color}-100 bg-white shadow-sm group hover:scale-[1.02] transition-transform`}>
                                                    <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform`}>
                                                        <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
                                                    </div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{kpi.label}</p>
                                                    <p className={`text-2xl font-black text-slate-900 tabular-nums`}>{kpi.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-rose-500" /> Proficiencies Growth
                                            </h4>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                                                        <YAxis hide />
                                                        <Tooltip 
                                                            cursor={{ fill: '#f8fafc' }} 
                                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="attendance" className="space-y-8 mt-0">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            <div className="flex-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                                                <div className="w-full flex justify-between items-center mb-6">
                                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Attendance Footprint</h4>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-1">Synced Live</Badge>
                                                </div>
                                                <Calendar
                                                    mode="multiple"
                                                    selected={[...modifiers.present, ...modifiers.absent, ...modifiers.late]}
                                                    modifiers={modifiers}
                                                    modifiersStyles={modifierStyles}
                                                    className="p-0 border-none"
                                                />
                                                <div className="flex flex-wrap justify-center gap-4 mt-8 px-4 py-3 bg-slate-50 rounded-2xl w-full">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div> 
                                                        <span className="text-[10px] font-bold uppercase text-slate-500">Present</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div> 
                                                        <span className="text-[10px] font-bold uppercase text-slate-500">Absent</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div> 
                                                        <span className="text-[10px] font-bold uppercase text-slate-500">Late Arrival</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-72 flex flex-col gap-4">
                                                {[
                                                    { label: "Consecutive Days", val: "14", icon: Activity, color: "emerald", bg: "bg-emerald-500" },
                                                    { label: "Total Sessions", val: progressData?.attendance?.total || 0, icon: BookOpen, color: "indigo", bg: "bg-indigo-500" },
                                                    { label: "Session Gaps", val: progressData?.attendance?.absent || 0, icon: AlertCircle, color: "rose", bg: "bg-rose-500" },
                                                ].map((box, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                       <div className={`w-12 h-12 rounded-2xl ${box.bg} text-white flex items-center justify-center mb-4`}>
                                                           <box.icon className="w-6 h-6" />
                                                       </div>
                                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{box.label}</p>
                                                       <p className="text-2xl font-black text-slate-900">{box.val}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailModal;
