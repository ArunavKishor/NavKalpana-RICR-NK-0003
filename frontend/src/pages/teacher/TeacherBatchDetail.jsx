import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Users, BookOpen, Zap, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AttendanceModal from "@/components/teacher/AttendanceModal";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const TeacherBatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [attendanceForm, setAttendanceForm] = useState({});
  const [attendanceRemarks, setAttendanceRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const [batchRes, studentsRes, attendanceRes] = await Promise.all([
        api.get(`/api/batches/${batchId}`),
        api.get(`/api/batches/${batchId}/students`),
        api.get(`/api/attendance?batch=${batchId}`),
      ]);

      const batchData = batchRes?.data?.data;
      setBatch(batchData);
      const studentsList = studentsRes?.data?.data?.students || [];
      setStudents(studentsList);
      setAttendanceHistory(attendanceRes?.data?.data?.attendance || []);

      const initialForm = {};
      studentsList.forEach((s) => {
        initialForm[s._id] = "present";
      });
      setAttendanceForm(initialForm);
    } catch (err) {
      console.error("Load batch detail failed:", err);
      toast.error("Cloud registry inaccessible");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const newForm = { ...attendanceForm };
    students.forEach((s) => (newForm[s._id] = status));
    setAttendanceForm(newForm);
    toast.success(`Broadcasting '${status}' status to all nodes`);
  };

  const handleSaveAttendance = async () => {
    if (!attendanceRemarks.trim()) {
      toast.error("Conceptual remarks required for submission");
      return;
    }

    try {
      setIsSaving(true);
      const records = students.map((s) => ({
        student: s._id,
        batch: batchId,
        date: selectedDate,
        status: attendanceForm[s._id] || "present",
        remarks: attendanceRemarks,
      }));

      // Create attendance records in one batch request
      await api.post("/api/attendance", { records });

      toast.success("Attendance ledger updated successfully");
      setAttendanceRemarks("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      await loadBatchData();
      setActiveTab("attendance-history");
    } catch (err) {
      console.error("Save attendance failed:", err);
      toast.error(err.response?.data?.message || "Internal transmission error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const response = await api.get(`/api/attendance/export?batch=${batchId}`, {
        responseType: 'blob'
      });

      // Create download link
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

  const getAttendanceStats = () => {
    const stats = { present: 0, absent: 0, late: 0 };
    attendanceHistory.forEach((r) => { stats[r.status] = (stats[r.status] || 0) + 1; });
    return [
      { name: "Present", value: stats.present, color: "#6366f1" },
      { name: "Absent", value: stats.absent, color: "#f43f5e" },
      { name: "Late", value: stats.late, color: "#f59e0b" },
    ].filter((s) => s.value > 0);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronizing Batch Nodes...</p>
    </div>
  );

  if (!batch) return (
    <div className="text-center py-20 px-6">
      <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
         <XCircle size={40} className="text-rose-500" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Denied</h2>
      <p className="text-slate-500 font-bold mb-8">Cohort data not found or registry corrupted.</p>
      <Button onClick={() => navigate("/teacher-dashboard/batches")} className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black">
        Return to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => navigate("/teacher-dashboard/batches")}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{batch.name}</h1>
          <p className="text-slate-500">{batch.course}</p>
        </div>
        <Button
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setIsAttendanceModalOpen(true)}
        >
          <Zap className="w-4 h-4 mr-2" />
          Quick Attendance
        </Button>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{batch.name}</h1>
              <p className="text-indigo-100/80 font-bold text-lg max-w-xl">{batch.course} Architecture Hub</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
               <p className="text-indigo-200 font-black uppercase text-[9px] tracking-widest mb-1">Status</p>
               <Badge className="bg-white text-indigo-600 border-none font-black uppercase rounded-full">{batch.status}</Badge>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 min-w-30">
               <p className="text-indigo-200 font-black uppercase text-[9px] tracking-widest mb-1">Health Check</p>
               <p className="text-2xl font-black text-white">{batch.progress || 0}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: Users, label: 'Enrolled Nodes', value: students.length, color: 'indigo' },
           { icon: Calendar, label: 'Active Sessions', value: attendanceHistory.filter(h=>h.status==='present').length, color: 'emerald' },
           { icon: Clock, label: 'Time Elapsed', value: '45d', color: 'orange' }
         ].map((kpi, i) => (
           <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5">
              <div className={`w-14 h-14 bg-${kpi.color}-50 rounded-2xl flex items-center justify-center mb-6`}>
                 <kpi.icon size={28} className={`text-${kpi.color}-600`} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{kpi.value}</h3>
           </motion.div>
         ))}
      </div>

      {/* Modern Sub-Navigation */}
      <div className="sticky top-2 z-30 p-1.5 bg-slate-100/50 backdrop-blur-xl border border-white/20 rounded-[2rem] flex flex-wrap gap-2 shadow-sm">
         {[
           { id: 'details', label: 'Overview', icon: Layers },
           { id: 'mark-attendance', label: 'Live Register', icon: UserCheck },
           { id: 'attendance-history', label: 'Ledger History', icon: Activity },
           { id: 'analytics', label: 'Intelligence', icon: TrendingUp }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex-1 min-w-35 flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 ${
               activeTab === tab.id
                 ? "bg-white text-indigo-600 shadow-xl ring-1 ring-slate-100"
                 : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
             }`}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "details" && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                    <h3 className="text-2xl font-black text-slate-900">Architecture Metadata</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                    <div>
                       <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Inception Node</p>
                       <p className="text-xl font-black text-slate-800">{new Date(batch.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Termination Node</p>
                       <p className="text-xl font-black text-slate-800">{new Date(batch.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Primary Instructor</p>
                       <p className="text-xl font-black text-slate-800">{batch.instructor || "Anonymous Node"}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Framework Type</p>
                       <p className="text-xl font-black text-slate-800">{batch.type || "Standard Core"}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                 <h3 className="text-2xl font-black mb-8 relative z-10">Curriculum Snapshot</h3>
                 <div className="space-y-4 relative z-10">
                    {(batch.content || []).slice(0, 4).map((m, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400">0{idx+1}</div>
                          <span className="font-bold">{m.title}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </motion.div>
        )}

      {activeTab === "mark-attendance" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Mark Attendance
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Today: {new Date().toLocaleDateString()}
            </p>

            {students.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No students enrolled in this batch
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {student.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.enrollmentId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {["present", "absent", "late"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleAttendanceStatusChange(student._id, status)
                          }
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${attendanceForm[student._id] === status
                            ? status === "present"
                              ? "bg-emerald-500 text-white"
                              : status === "absent"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-8 sm:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
                       <h3 className="text-xl font-black">Commitment Validation</h3>
                    </div>
                    <textarea value={attendanceRemarks} onChange={(e) => setAttendanceRemarks(e.target.value)}
                              placeholder="Describe core takeaways / session logs for the system ledger..."
                              className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg font-medium focus:ring-4 focus:ring-white/5 outline-none resize-none" rows="4" />
                    <Button onClick={handleSaveAttendance} disabled={isSaving || students.length === 0}
                            className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 font-black text-xl shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-4">
                       {isSaving ? "Synchronizing Data..." : "Publish Attendance Node"}
                       <Save size={24} />
                    </Button>
                 </div>
              </div>
           </motion.div>
        )}

      {activeTab === "attendance-history" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              Attendance History
            </h3>
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
            <p className="text-slate-500 text-center py-8">
              No attendance records yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {record.student?.user?.fullName || "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-6 text-center">Batch Attendance Distribution</h3>
            <div className="h-64 w-full" style={{ minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={getAttendanceStats()}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getAttendanceStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Late</div>
            </div>
          </div>

              <div className="space-y-6">
                 {(batch.content || []).map((module, idx) => (
                    <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between mb-6">
                          <div>
                             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Module Node {idx+1}</p>
                             <h4 className="text-xl font-black text-slate-800">{module.title}</h4>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-slate-100/50">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Target</p>
                             <p className="font-black text-slate-900">12 Ses</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100/50">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Presence</p>
                             <p className="font-black text-indigo-600">92%</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100/50">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Efficiency</p>
                             <p className="font-black text-emerald-600">Opt</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <StudentDetailModal student={selectedStudent} batch={batch} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Modernized Edit Dialog */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-100 p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-[3rem] shadow-4xl max-w-lg w-full overflow-hidden border border-white/20">
             <div className="bg-slate-950 p-8 flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-black text-white">Modify Record</h3>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Institutional Audit Override</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                   <X size={24} />
                </button>
             </div>

             <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Node</label>
                      <p className="p-4 bg-slate-50 rounded-2xl font-black text-slate-800">{editingRecord.student?.user?.fullName}</p>
                   </div>
                   <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Temporal Node</label>
                      <p className="p-4 bg-slate-50 rounded-2xl font-black text-slate-800">{new Date(editingRecord.date).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Badge Override</label>
                   <div className="flex gap-2 p-1.5 bg-slate-50 rounded-[1.5rem]">
                      {["present", "absent", "late"].map((status) => (
                        <button key={status} onClick={() => setEditingRecord({ ...editingRecord, status })}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                                  editingRecord.status === status
                                    ? status === "present" ? "bg-white text-indigo-600 shadow-xl"
                                    : status === "absent" ? "bg-white text-rose-500 shadow-xl"
                                    : "bg-white text-orange-600 shadow-xl"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}>
                          {status}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Revised Remarks</label>
                   <textarea value={editingRecord.remarks || ""} onChange={(e) => setEditingRecord({ ...editingRecord, remarks: e.target.value })}
                             className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium focus:ring-4 focus:ring-indigo-50 outline-none" rows="3" />
                </div>

                <div className="flex gap-4 pt-6">
                   <Button onClick={() => setIsEditModalOpen(false)} variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-slate-400">Cancel</Button>
                   <Button onClick={handleUpdateRecord} className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg">Commit Changes</Button>
                </div>
             </div>
          </motion.div>
        </div>
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        batch={batch}
        onSaveSuccess={loadBatchData}
      />
    </div>
  );
};

export default TeacherBatchDetail;
