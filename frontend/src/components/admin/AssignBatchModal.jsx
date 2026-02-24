import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import api from "@/config/Api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const AssignBatchModal = ({ isOpen, onClose, student, onAssignmentSuccess }) => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadBatches();
        }
    }, [isOpen]);

    const loadBatches = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/api/batches");
            setBatches(res.data?.data?.batches || []);
        } catch (err) {
            toast.error("Failed to load batches");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedBatch) {
            toast.error("Please select a batch");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post(`/api/students/${student.id}/enroll`, { batchId: selectedBatch });
            toast.success(`Student successfully enrolled in batch`);
            onAssignmentSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign batch");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign to Batch</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Student</p>
                        <p className="text-slate-900 font-semibold">{student?.name}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="batch">Select Batch</Label>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading batches...
                            </div>
                        ) : (
                            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                <SelectTrigger id="batch">
                                    <SelectValue placeholder="Select a batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.length > 0 ? (
                                        batches.map((batch) => (
                                            <SelectItem key={batch._id} value={batch._id}>
                                                {batch.name} ({batch.course})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem disabled value="none">
                                            No batches available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedBatch}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            "Assign Batch"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignBatchModal;
