import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    BookOpen,
    LineChart,
    CalendarDays,
    PenTool,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    FileText,
    Loader2,
    Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/config/Api";
import toast from "react-hot-toast";
import Avatar from "@/components/shared/Avatar";

const BatchDetail = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [attendanceForm, setAttendanceForm] = useState({});
    const [attendanceRemarks, setAttendanceRemarks] = useState("");
    const [contentList, setContentList] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const loadBatchData = async () => {
        try {
            setLoading(true);
            const [batchRes, studentsRes, attendanceRes] = await Promise.all([
                api.get(`/api/batches/${batchId}`),
                api.get(`/api/batches/${batchId}/students`),
                api.get(`/api/batches/${batchId}/attendance`),
            ]);

            const batchData = batchRes?.data?.data;
            setBatch(batchData);
            setStudents(studentsRes?.data?.data?.students || []);
            setAttendanceHistory(attendanceRes?.data?.data?.attendance || []);
            setContentList(batchData?.content || []);

            // Initialize attendance form with "present" for all students for today
            const initialForm = {};
            (studentsRes?.data?.data?.students || []).forEach(s => {
                initialForm[s._id] = "present";
            });
            setAttendanceForm(initialForm);

            setError("");
        } catch (err) {
            console.error("Load batch detail failed:", err);
            setError("Failed to load batch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (batchId) {
            loadBatchData();
        }
    }, [batchId]);

    const handleExportAttendance = async () => {
        try {
            const response = await api.get(`/api/attendance/export?batch=${batchId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${batch?.name || batchId}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Attendance exported successfully");
        } catch (err) {
            console.error("Export failed:", err);
            toast.error(err.response?.data?.message || "Failed to export attendance");
        }
    };

    const handleSaveContent = async () => {
        try {
            setIsSaving(true);
            await api.put(`/api/batches/${batchId}`, { content: contentList });
            toast.success("Content updated successfully");
        } catch (err) {
            toast.error("Failed to update content");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAttendance = async () => {
        if (!attendanceRemarks.trim()) {
            toast.error("Remarks are mandatory before saving attendance");
            return;
        }
        try {
            setIsSaving(true);
            const today = new Date().toISOString().split('T')[0];
            const records = students.map(s => ({
                student: s._id,
                batch: batchId,
                date: today,
                status: attendanceForm[s._id] || "present",
                remarks: attendanceRemarks,
            }));

            await api.post('/api/attendance', { records });
            toast.success("Attendance saved successfully");
            setAttendanceRemarks("");
            loadBatchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    const addContentSection = () => {
        setContentList([...contentList, { title: "New Section", body: "Section content..." }]);
    };

    const updateContentItem = (index, field, value) => {
        const newList = [...contentList];
        newList[index][field] = value;
        setContentList(newList);
    };

    const removeContentItem = (index) => {
        setContentList(contentList.filter((_, i) => i !== index));
    };

    const filteredStudents = useMemo(() => {
        return students.filter(
            (s) =>
                s.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.enrollmentId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 border border-red-100 rounded-lg max-w-2xl mx-auto my-8">
                {error}
                <Button className="ml-4" onClick={loadBatchData}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/batches")}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            {batch?.name || "Batch Details"}
                        </h1>
                        <p className="text-slate-500 uppercase font-medium text-sm">
                            {batch?.course} • {students.length} Students
                        </p>
                    </div>
                </div>
                <Badge className="w-fit bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {batch?.status?.toUpperCase()}
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 bg-transparent border-none p-0">
                    <TabsTrigger value="content" className="flex items-center gap-2 py-3">
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs lg:text-sm">Content</span>
                        <span className="sm:hidden">Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-2 py-3">
                        <LineChart className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs lg:text-sm">Progress</span>
                        <span className="sm:hidden">Progress</span>
                    </TabsTrigger>
                    <TabsTrigger value="students" className="flex items-center gap-2 py-3">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs lg:text-sm">Students</span>
                        <span className="sm:hidden">Students</span>
                    </TabsTrigger>
                    <TabsTrigger value="view-attendance" className="flex items-center gap-2 py-3">
                        <CalendarDays className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs lg:text-sm">View Attendance</span>
                        <span className="sm:hidden text-xs">View Att.</span>
                    </TabsTrigger>
                    <TabsTrigger value="take-attendance" className="flex items-center gap-2 py-3">
                        <PenTool className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs lg:text-sm">Take Attendance</span>
                        <span className="sm:hidden text-xs">Take Att.</span>
                    </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Text Based Content</h2>
                                <Button
                                    onClick={handleSaveContent}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Content
                                </Button>
                            </div>
                            <div className="space-y-6">
                                {contentList.map((item, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-lg border relative group">
                                        <button
                                            onClick={() => removeContentItem(index)}
                                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded hidden group-hover:block"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => updateContentItem(index, 'title', e.target.value)}
                                            className="font-semibold mb-2 bg-white"
                                            placeholder="Section Title"
                                        />
                                        <textarea
                                            value={item.body}
                                            onChange={(e) => updateContentItem(index, 'body', e.target.value)}
                                            className="w-full p-2 text-sm text-slate-600 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Section content..."
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={addContentSection}
                                    className="w-full border-dashed border-2 py-8 hover:bg-slate-50 transition"
                                >
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Add New Section
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-4">Student Progress Overview</h2>
                            <div className="space-y-4">
                                {filteredStudents.map((s) => {
                                    // Calculate progress from attendance history
                                    const studentRecords = attendanceHistory.reduce((acc, day) => {
                                        const record = day.records.find(r => r.student._id === s._id);
                                        if (record) acc.push(record);
                                        return acc;
                                    }, []);

                                    const presentCount = studentRecords.filter(r => r.status === "present" || r.status === "late").length;
                                    const percentage = studentRecords.length > 0
                                        ? Math.round((presentCount / studentRecords.length) * 100)
                                        : 0;

                                    return (
                                        <div key={s._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={s.user?.fullName}
                                                    email={s.user?.email}
                                                    src={s.profilePhoto}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="font-semibold">{s.user?.fullName}</p>
                                                    <p className="text-xs text-slate-500">{s.enrollmentId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{percentage}%</p>
                                                    <p className="text-xs text-slate-500">Attendance</p>
                                                </div>
                                                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${percentage > 75 ? 'bg-emerald-500' : percentage > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-xl font-bold">Enrolled Students</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Student Name</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Enrollment ID</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Joined Date</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredStudents.map((s) => (
                                            <tr key={s._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{s.user?.fullName}</td>
                                                <td className="px-4 py-3 text-slate-600">{s.enrollmentId}</td>
                                                <td className="px-4 py-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm">View Profile</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* View Attendance Tab */}
                <TabsContent value="view-attendance">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Attendance Logs</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportAttendance}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </Button>
                            </div>
                            {attendanceHistory.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No attendance records found for this batch.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {attendanceHistory.map((day) => (
                                        <div key={day.date} className="border rounded-lg overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                                <span className="font-semibold">{new Date(day.date).toLocaleDateString()}</span>
                                                <Badge variant="outline">{day.records.length} Records</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                                                {day.records.map((r) => (
                                                    <div key={r._id} className="flex justify-between items-center p-2 border rounded">
                                                        <span className="text-sm truncate mr-2">{r.student?.user?.fullName}</span>
                                                        <Badge
                                                            className={
                                                                r.status === "present" ? "bg-emerald-100 text-emerald-700" :
                                                                    r.status === "absent" ? "bg-red-100 text-red-700" :
                                                                        "bg-amber-100 text-amber-700"
                                                            }
                                                        >
                                                            {r.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Take Attendance Tab */}
                <TabsContent value="take-attendance">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">Take Attendance</h2>
                                    <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <Button
                                    onClick={handleSaveAttendance}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Today's Attendance
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {students.map((s) => (
                                    <div key={s._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={s.user?.fullName}
                                                email={s.user?.email}
                                                src={s.profilePhoto}
                                                size="sm"
                                            />
                                            <p className="font-semibold">{s.user?.fullName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={attendanceForm[s._id] === "present" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setAttendanceForm({ ...attendanceForm, [s._id]: "present" })}
                                                className={attendanceForm[s._id] === "present" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white border-emerald-200 text-emerald-700"}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Present
                                            </Button>
                                            <Button
                                                variant={attendanceForm[s._id] === "absent" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setAttendanceForm({ ...attendanceForm, [s._id]: "absent" })}
                                                className={attendanceForm[s._id] === "absent" ? "bg-red-600 hover:bg-red-700" : "bg-white border-red-200 text-red-700"}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" /> Absent
                                            </Button>
                                            <Button
                                                variant={attendanceForm[s._id] === "late" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setAttendanceForm({ ...attendanceForm, [s._id]: "late" })}
                                                className={attendanceForm[s._id] === "late" ? "bg-amber-600 hover:bg-amber-700" : "bg-white"}
                                            >
                                                <Clock className="w-4 h-4 mr-1" /> Late
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mandatory Remarks */}
                            <div className="mt-6 space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Session Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={attendanceRemarks}
                                    onChange={(e) => setAttendanceRemarks(e.target.value)}
                                    placeholder="What was covered today? Add any notes about this session (mandatory)..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                    rows="3"
                                />
                                <p className="text-xs text-slate-400">Remarks are required before submitting attendance.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BatchDetail;
