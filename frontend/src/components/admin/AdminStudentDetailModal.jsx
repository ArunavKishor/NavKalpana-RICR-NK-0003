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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";
import api from "@/config/Api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const StudentDetailModal = ({ studentId, isOpen, onClose }) => {
  const [student, setStudent] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
      fetchAvailableBatches();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const [studentRes, summaryRes, historyRes] = await Promise.all([
        api.get(`/api/students/${studentId}`),
        api.get(`/api/attendance/student/${studentId}`),
        api.get(`/api/attendance?student=${studentId}&limit=50`),
      ]);

      setStudent(studentRes.data.data);
      setAttendanceSummary(summaryRes.data.data.summaries || []);
      setAttendanceHistory(historyRes.data.data.records || []);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBatches = async () => {
    try {
      const { data } = await api.get("/api/batches");
      setAvailableBatches(data?.data?.batches || []);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleAssignBatch = async () => {
    if (!selectedBatchId || selectedBatchId === "placeholder") {
      toast.error("Please select a batch");
      return;
    }

    // Check if already enrolled
    const isAlreadyEnrolled = student?.batches?.some(
      (b) => b._id === selectedBatchId,
    );
    if (isAlreadyEnrolled) {
      toast.error("Student is already enrolled in this batch");
      return;
    }

    try {
      setIsAssigning(true);
      await api.post(`/api/students/${studentId}/enroll`, {
        batchId: selectedBatchId,
      });
      toast.success("Student assigned to batch successfully");
      setSelectedBatchId(null);
      await fetchStudentDetails();
    } catch (error) {
      console.error("Failed to assign batch:", error);
      toast.error(error.response?.data?.message || "Failed to assign batch");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveBatch = async (batchId) => {
    try {
      setIsRemoving(batchId);
      await api.post(`/api/students/${studentId}/unenroll`, {
        batchId: batchId,
      });
      toast.success("Student removed from batch successfully");
      await fetchStudentDetails();
    } catch (error) {
      console.error("Failed to remove batch:", error);
      toast.error(error.response?.data?.message || "Failed to remove batch");
    } finally {
      setIsRemoving(null);
    }
  };

  // Filter out already enrolled batches from available options
  const enrolledBatchIds = student?.batches?.map((b) => b._id) || [];
  const unenrolledBatches = availableBatches.filter(
    (b) => !enrolledBatchIds.includes(b._id),
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white border border-slate-200 text-slate-900">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {student?.user?.fullName?.[0] || "S"}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {student?.user?.fullName || "Student Details"}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {student?.enrollmentId || "—"}
              </p>
            </div>
            {student?.status && (
              <Badge
                className={`ml-auto uppercase text-xs ${
                  student.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {student.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs
            defaultValue="overview"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tab Nav */}
            <div className="px-6 border-b border-slate-200 bg-white">
              <TabsList className="bg-transparent w-full justify-start gap-6 p-0 h-auto">
                {["overview", "progress", "attendance"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-0 pb-3 pt-3 text-slate-500 data-[state=active]:text-blue-600 capitalize font-medium text-sm"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 bg-slate-50">
              <div className="p-6 space-y-4">
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white border border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span>{student?.user?.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{student?.phone || "N/A"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">
                          Enrollment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>
                            Enrolled:{" "}
                            {student?.enrollmentDate
                              ? format(new Date(student.enrollmentDate), "PPP")
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span>
                            Active Batches: {student?.batches?.length || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Batches */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Enrolled Batches
                    </h3>
                    <div className="space-y-2">
                      {student?.batches?.map((batch) => (
                        <div
                          key={batch._id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {batch.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {batch.course}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-600 capitalize">
                              {batch.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                              onClick={() => handleRemoveBatch(batch._id)}
                              disabled={isRemoving === batch._id}
                            >
                              {isRemoving === batch._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!student?.batches || student.batches.length === 0) && (
                        <p className="text-slate-400 text-sm italic">
                          Not enrolled in any batches.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Assign New Batch */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Assign to Batch
                    </h3>
                    <div className="flex gap-3">
                      <Select
                        value={selectedBatchId}
                        onValueChange={setSelectedBatchId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a batch to assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {unenrolledBatches.length === 0 ? (
                            <SelectItem value="placeholder" disabled>
                              No available batches
                            </SelectItem>
                          ) : (
                            unenrolledBatches.map((batch) => (
                              <SelectItem key={batch._id} value={batch._id}>
                                {batch.name} ({batch.course})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignBatch}
                        disabled={
                          !selectedBatchId ||
                          selectedBatchId === "placeholder" ||
                          isAssigning
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isAssigning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Assign
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* PROGRESS TAB */}
                <TabsContent value="progress" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendanceSummary.map((summary) => (
                      <Card
                        key={summary.batch._id}
                        className="bg-white border border-slate-200 shadow-sm"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            {summary.batch.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">
                                  Attendance Rate
                                </span>
                                <span className="font-semibold text-blue-600">
                                  {summary.percentage}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${summary.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className="font-bold text-slate-700">
                                  {summary.totalSessions}
                                </div>
                                <div className="text-slate-400">Total</div>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                <div className="font-bold text-emerald-600">
                                  {summary.presentCount}
                                </div>
                                <div className="text-slate-400">Present</div>
                              </div>
                              <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                <div className="font-bold text-yellow-600">
                                  {summary.lateCount}
                                </div>
                                <div className="text-slate-400">Late</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {attendanceSummary.length === 0 && (
                      <div className="col-span-full py-10 text-center text-slate-400 text-sm">
                        No progress data available.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ATTENDANCE TAB */}
                <TabsContent value="attendance" className="mt-0">
                  <div className="space-y-2">
                    {attendanceHistory.map((record) => (
                      <div
                        key={record._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              record.status === "present"
                                ? "bg-emerald-100 text-emerald-600"
                                : record.status === "absent"
                                  ? "bg-red-100 text-red-500"
                                  : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {record.status === "present" && (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {record.status === "absent" && (
                              <XCircle className="h-4 w-4" />
                            )}
                            {record.status === "late" && (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {format(new Date(record.date), "PPP")}
                            </p>
                            <p className="text-xs text-slate-400">
                              {record.batch?.name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`capitalize text-xs ${
                            record.status === "present"
                              ? "bg-emerald-100 text-emerald-700"
                              : record.status === "absent"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                    {attendanceHistory.length === 0 && (
                      <div className="py-10 text-center text-slate-400 text-sm">
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
