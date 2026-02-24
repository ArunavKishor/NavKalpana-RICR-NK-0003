import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/config/Api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const QuickAttendanceModal = ({ isOpen, onClose, student }) => {
    const [selectedBatch, setSelectedBatch] = useState("");
    const [status, setStatus] = useState("present");
    const [remarks, setRemarks] = useState("Regular attendance");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // We should only show batches the student is enrolled in
    const enrolledBatches = student?.batches || [];

    useEffect(() => {
        if (isOpen && enrolledBatches.length > 0) {
            setSelectedBatch(enrolledBatches[0]._id);
        }
    }, [isOpen, enrolledBatches]);

    const handleSubmit = async () => {
        if (!selectedBatch) {
            toast.error("Please select a batch");
            return;
        }
        if (!remarks.trim()) {
            toast.error("Remarks are mandatory");
            return;
        }

        try {
            setIsSubmitting(true);
            const attendanceData = {
                student: student.id,
                batch: selectedBatch,
                date: new Date().toISOString(),
                status,
                remarks: remarks.trim(),
            };

            await api.post("/api/attendance", attendanceData);
            toast.success(`Attendance marked as ${status}`);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Student</p>
                        <p className="text-slate-900 font-semibold">{student?.name}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="batch">Select Batch</Label>
                        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                            <SelectTrigger id="batch">
                                <SelectValue placeholder="Select a batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {enrolledBatches.length > 0 ? (
                                    enrolledBatches.map((batch) => (
                                        <SelectItem key={batch._id} value={batch._id}>
                                            {batch.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem disabled value="none">
                                        No enrolled batches
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedBatch || !remarks.trim()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Attendance"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default QuickAttendanceModal;
