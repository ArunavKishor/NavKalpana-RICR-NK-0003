import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock, Users, Save, AlertCircle } from "lucide-react";
import api from "@/config/Api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceModal = ({ isOpen, onClose, batch, onSaveSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [remarks, setRemarks] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (isOpen && batch?._id) {
      setDate(new Date().toISOString().split("T")[0]);
      loadStudents();
    }
  }, [isOpen, batch?._id]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/batches/${batch._id}/students`);
      const studentsList = data?.data?.students || [];
      setStudents(studentsList);

      // Default all to present
      const initial = {};
      studentsList.forEach((s) => {
        initial[s._id] = "present";
      });
      setAttendanceData(initial);
    } catch (err) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students for this batch");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceData(updated);
  };

  const handleSave = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are mandatory");
      return;
    }

    try {
      setIsSaving(true);
      const records = students.map((s) => ({
        student: s._id,
        batch: batch._id,
        date: date,
        status: attendanceData[s._id],
        remarks: remarks,
      }));

      // Send as a batch request to backend
      await api.post("/api/attendance", { records });

      toast.success("Attendance marked successfully");
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Save attendance failed:", err);
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 bg-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Take Attendance
              </DialogTitle>
              <p className="text-indigo-100 text-sm mt-1">
                {batch?.name} • {batch?.course}
              </p>
            </div>
            <div className="text-right">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white w-40 h-9"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Quick Actions:
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => markAll("present")}
              >
                All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => markAll("absent")}
              >
                All Absent
              </Button>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Students:{" "}
              <span className="text-indigo-600 font-bold">
                {students.length}
              </span>
            </div>
          </div>

          <ScrollArea className="h-[40vh] pr-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">
                  Fetching batch roster...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">
                  No students found in this batch
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {students.map((student, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={student._id}
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                          {student.user?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {student.user?.fullName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {student.enrollmentId}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <StatusButton
                          active={attendanceData[student._id] === "present"}
                          type="present"
                          onClick={() =>
                            handleStatusChange(student._id, "present")
                          }
                        />
                        <StatusButton
                          active={attendanceData[student._id] === "absent"}
                          type="absent"
                          onClick={() =>
                            handleStatusChange(student._id, "absent")
                          }
                        />
                        <StatusButton
                          active={attendanceData[student._id] === "late"}
                          type="late"
                          onClick={() =>
                            handleStatusChange(student._id, "late")
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          {/* Remarks Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                Session Remarks <span className="text-red-500">*</span>
              </label>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold text-slate-400 border-slate-200"
              >
                Mandatory
              </Badge>
            </div>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="What was covered today? Mention any student issues..."
              className="resize-none h-20 bg-slate-50"
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t flex sm:justify-between items-center">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">
              Verify all records before saving
            </span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="sm:px-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold sm:px-8 shadow-lg shadow-indigo-100"
              disabled={isSaving || students.length === 0}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Records
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StatusButton = ({ active, type, onClick }) => {
  const configs = {
    present: {
      icon: <Check className="w-4 h-4" />,
      activeStyles: "bg-emerald-500 text-white shadow-lg shadow-emerald-100",
      inactiveStyles:
        "bg-emerald-50 text-emerald-600 border border-emerald-100",
      label: "P",
    },
    absent: {
      icon: <X className="w-4 h-4" />,
      activeStyles: "bg-rose-500 text-white shadow-lg shadow-rose-100",
      inactiveStyles: "bg-rose-50 text-rose-600 border border-rose-100",
      label: "A",
    },
    late: {
      icon: <Clock className="w-4 h-4" />,
      activeStyles: "bg-amber-500 text-white shadow-lg shadow-amber-100",
      inactiveStyles: "bg-amber-50 text-amber-600 border border-amber-100",
      label: "L",
    },
  };

  const config = configs[type];

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 ${
        active ? config.activeStyles : config.inactiveStyles
      }`}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {config.icon}
    </button>
  );
};

export default AttendanceModal;
