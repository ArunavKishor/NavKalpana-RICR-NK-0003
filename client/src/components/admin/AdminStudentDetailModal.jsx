import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Mail, Phone, Calendar, BookOpen, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import api from "@/config/Api";
import { format } from "date-fns";

const StudentDetailModal = ({ studentId, isOpen, onClose }) => {
    const [student, setStudent] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentDetails();
        }
    }, [isOpen, studentId]);

    const fetchStudentDetails = async () => {
        setLoading(true);
        try {
            const [studentRes, summaryRes, historyRes] = await Promise.all([
                api.get(`/admin/students/${studentId}`),
                api.get(`/admin/attendance/student/${studentId}/summary`),
                api.get(`/admin/attendance?student=${studentId}&limit=50`)
            ]);

            setStudent(studentRes.data.data);
            setAttendanceSummary(summaryRes.data.data.summaries);
            setAttendanceHistory(historyRes.data.data.attendance);
        } catch (error) {
            console.error("Failed to fetch student details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader className="p-6 border-b border-zinc-800">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        {student?.user?.fullName || "Student Details"}
                        {student?.status && (
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="uppercase text-xs">
                                {student.status}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4 border-b border-zinc-800">
                            <TabsList className="bg-transparent w-full justify-start gap-6 p-0 h-auto">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-0 pb-3 text-zinc-400 data-[state=active]:text-indigo-400"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="progress"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-0 pb-3 text-zinc-400 data-[state=active]:text-indigo-400"
                                >
                                    Progress
                                </TabsTrigger>
                                <TabsTrigger
                                    value="attendance"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-0 pb-3 text-zinc-400 data-[state=active]:text-indigo-400"
                                >
                                    Attendance
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 bg-black/20">
                            <div className="p-6">
                                <TabsContent value="overview" className="mt-0 space-y-6">
                                    {/* Key Info Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-zinc-900 border-zinc-800">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-zinc-400">Contact Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Mail className="h-4 w-4 text-indigo-500" />
                                                    <span>{student?.user?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone className="h-4 w-4 text-indigo-500" />
                                                    <span>{student?.phone || "N/A"}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-zinc-900 border-zinc-800">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-zinc-400">Enrollment Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                                    <span>Enrolled: {student?.enrollmentDate ? format(new Date(student.enrollmentDate), "PPP") : "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <BookOpen className="h-4 w-4 text-indigo-500" />
                                                    <span>Active Batches: {student?.batches?.length || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Batches List */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-zinc-100">Enrolled Batches</h3>
                                        <div className="space-y-3">
                                            {student?.batches?.map((batch) => (
                                                <div key={batch._id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                                                    <div>
                                                        <p className="font-medium text-zinc-100">{batch.name}</p>
                                                        <p className="text-sm text-zinc-400">{batch.course}</p>
                                                    </div>
                                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                        {batch.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {(!student?.batches || student.batches.length === 0) && (
                                                <p className="text-zinc-500 text-sm italic">Not enrolled in any batches.</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="progress" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {attendanceSummary.map((summary) => (
                                            <Card key={summary.batch._id} className="bg-zinc-900 border-zinc-800">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base font-semibold text-zinc-100">{summary.batch.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-zinc-400">Attendance Rate</span>
                                                                <span className="font-medium text-indigo-400">{summary.percentage}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500"
                                                                    style={{ width: `${summary.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                            <div className="bg-zinc-950/50 p-2 rounded">
                                                                <div className="font-semibold text-zinc-300">{summary.totalSessions}</div>
                                                                <div className="text-zinc-500">Total</div>
                                                            </div>
                                                            <div className="bg-zinc-950/50 p-2 rounded">
                                                                <div className="font-semibold text-green-400">{summary.presentCount}</div>
                                                                <div className="text-zinc-500">Present</div>
                                                            </div>
                                                            <div className="bg-zinc-950/50 p-2 rounded">
                                                                <div className="font-semibold text-yellow-500">{summary.lateCount}</div>
                                                                <div className="text-zinc-500">Late</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {attendanceSummary.length === 0 && (
                                            <div className="col-span-full py-8 text-center text-zinc-500">
                                                No progress data available.
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="attendance" className="mt-0">
                                    <div className="space-y-4">
                                        {attendanceHistory.map((record) => (
                                            <div key={record._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                        p-2 rounded-full
                                        ${record.status === 'present' ? 'bg-green-500/10 text-green-500' : ''}
                                        ${record.status === 'absent' ? 'bg-red-500/10 text-red-500' : ''}
                                        ${record.status === 'late' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                                    `}>
                                                        {record.status === 'present' && <CheckCircle2 className="h-4 w-4" />}
                                                        {record.status === 'absent' && <XCircle className="h-4 w-4" />}
                                                        {record.status === 'late' && <Clock className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-200">
                                                            {format(new Date(record.date), "PPP")}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">{record.batch?.name}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`capitalize border-zinc-700
                                    ${record.status === 'present' ? 'text-green-400' : ''}
                                    ${record.status === 'absent' ? 'text-red-400' : ''}
                                    ${record.status === 'late' ? 'text-yellow-400' : ''}
                                `}>
                                                    {record.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        {attendanceHistory.length === 0 && (
                                            <div className="py-8 text-center text-zinc-500">
                                                No attendance records found.
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailModal;
