import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import api from "@/config/Api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const SubmissionListModal = ({ assessmentId, isOpen, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [marks, setMarks] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen && assessmentId) {
            fetchSubmissions();
            setGradingSubmission(null);
        }
    }, [isOpen, assessmentId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/assessments/${assessmentId}/submissions`);
            setSubmissions(data.data.submissions);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            toast.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        setIsSubmitting(true);
        try {
            await api.put(`/api/assessments/${assessmentId}/grade/${gradingSubmission._id}`, {
                marksObtained: Number(marks),
                feedback,
            });
            toast.success("Graded successfully");
            setGradingSubmission(null);
            fetchSubmissions(); // Refresh list
        } catch (error) {
            console.error("Grading failed:", error);
            toast.error(error.response?.data?.message || "Failed to submit grade");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openGrading = (submission) => {
        setGradingSubmission(submission);
        setMarks(submission.marksObtained || "");
        setFeedback(submission.feedback || "");
    };

    const filteredSubmissions = submissions.filter(s =>
        s.student?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white text-slate-900">
                <DialogHeader className="p-6 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        {gradingSubmission ? "Grade Submission" : "Assessment Submissions"}
                        {gradingSubmission && (
                            <Button variant="ghost" size="sm" onClick={() => setGradingSubmission(null)}>
                                Back to List
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {gradingSubmission ? (
                        // Grading View
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Student Details</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-500">Student Name</p>
                                            <p className="font-medium">{gradingSubmission.student?.user?.fullName}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-500">Submitted At</p>
                                            <p className="font-medium">{format(new Date(gradingSubmission.submittedAt), "PPpp")}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-500">Attachments/Content</p>
                                            <p className="font-medium italic text-slate-600 mt-1">
                                                (File preview placeholder - assumes text/file submission)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Evaluation</h3>
                                    <form onSubmit={handleGradeSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="marks">Marks Obtained</Label>
                                            <Input
                                                id="marks"
                                                type="number"
                                                value={marks}
                                                onChange={(e) => setMarks(e.target.value)}
                                                required
                                                min="0"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="feedback">Feedback</Label>
                                            <Textarea
                                                id="feedback"
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="mt-1 h-32"
                                                placeholder="Enter feedback for the student..."
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Grade
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // List View
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by student name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                ) : filteredSubmissions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        No submissions found.
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3">Student</th>
                                                <th className="px-6 py-3">Submitted At</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Marks</th>
                                                <th className="px-6 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSubmissions.map((submission) => (
                                                <tr key={submission._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {submission.student?.user?.fullName}
                                                        <div className="text-xs text-slate-500 font-normal">{submission.student?.user?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {format(new Date(submission.submittedAt), "PP p")}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {submission.gradedBy ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Graded</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        {submission.marksObtained !== undefined ? submission.marksObtained : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openGrading(submission)}
                                                            className="border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                                                        >
                                                            {submission.gradedBy ? "Re-grade" : "Grade"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubmissionListModal;
