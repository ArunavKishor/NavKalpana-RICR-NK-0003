import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/config/Api";
import { TrendingUp, User } from "lucide-react";

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

    // Helper for calendar modifiers
    const modifiers = {
        present: attendanceRecords.filter(r => r.status === "present").map(r => new Date(r.date)),
        absent: attendanceRecords.filter(r => r.status === "absent").map(r => new Date(r.date)),
        late: attendanceRecords.filter(r => r.status === "late").map(r => new Date(r.date)),
    };

    const modifierStyles = {
        present: { color: 'white', backgroundColor: '#10b981' },
        absent: { color: 'white', backgroundColor: '#ef4444' },
        late: { color: 'white', backgroundColor: '#f59e0b' },
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
                            <DialogTitle className="text-2xl">{student?.user?.fullName}</DialogTitle>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{student?.enrollmentId}</Badge>
                                <Badge variant={student?.status === "active" ? "success" : "secondary"}>
                                    {student?.status}
                                </Badge>
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

                    <TabsContent value="info" className="space-y-4">
                        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm text-slate-500">Batch Name</p>
                                <p className="font-semibold">{batch?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Course</p>
                                <p className="font-semibold">{batch?.course}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Instructor</p>
                                <p className="font-semibold">{batch?.instructor || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Joined Date</p>
                                <p className="font-semibold">{new Date(student?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-6">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">Loading progress...</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <p className="text-xs text-blue-600 font-bold uppercase">Overall OGI</p>
                                        <p className="text-3xl font-black text-blue-700">{progressData?.ogi}%</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-emerald-50">
                                        <p className="text-xs text-emerald-600 font-bold uppercase">Avg Grade</p>
                                        <p className="text-3xl font-black text-emerald-700">{progressData?.academics?.averageGrade}%</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-orange-50">
                                        <p className="text-xs text-orange-600 font-bold uppercase">Attendance</p>
                                        <p className="text-3xl font-black text-orange-700">{progressData?.attendance?.percentage}%</p>
                                    </div>
                                </div>

                                <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Growth Trend
                                    </h4>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <BarChart data={[
                                            { name: "Attendance", value: progressData?.attendance?.percentage },
                                            { name: "Academic", value: progressData?.academics?.averageGrade },
                                            { name: "Growth (OGI)", value: progressData?.ogi },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis hide />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="attendance" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center">
                                <h4 className="text-sm font-semibold mb-4 w-full">Attendance Calendar</h4>
                                <Calendar
                                    mode="multiple"
                                    selected={[...modifiers.present, ...modifiers.absent, ...modifiers.late]}
                                    modifiers={modifiers}
                                    modifiersStyles={modifierStyles}
                                    className="border rounded-md shadow-sm"
                                />
                                <div className="flex gap-4 mt-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-emerald-500 rounded"></div> Present
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-500 rounded"></div> Absent
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div> Late
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold">Summary Breakdown</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span>Present Days</span>
                                            <span className="font-bold text-emerald-600">{progressData?.attendance?.present}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progressData?.attendance?.total ? (progressData?.attendance?.present / progressData?.attendance?.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span>Absent Days</span>
                                            <span className="font-bold text-red-600">{progressData?.attendance?.absent}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${progressData?.attendance?.total ? (progressData?.attendance?.absent / progressData?.attendance?.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span>Late Arrivals</span>
                                            <span className="font-bold text-yellow-600">{progressData?.attendance?.late}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${progressData?.attendance?.total ? (progressData?.attendance?.late / progressData?.attendance?.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailModal;
