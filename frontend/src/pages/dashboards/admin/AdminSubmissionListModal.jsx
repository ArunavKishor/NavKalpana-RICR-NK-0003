import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Loader2 } from "lucide-react";
import api from "@/config/Api";
import toast from "react-hot-toast";

const AdminSubmissionListModal = ({ isOpen, onClose, assessment }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evalData, setEvalData] = useState({
    marks: "",
    feedback: "",
    currentSubmission: null,
  });
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (isOpen && assessment?._id) {
      loadSubmissions();
    }
  }, [isOpen, assessment?._id]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/api/assessments/${assessment._id}/submissions`,
      );
      setSubmissions(data?.data?.submissions || []);
    } catch (err) {
      console.error("Load submissions failed:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!evalData.currentSubmission || !evalData.marks) {
      toast.error("Please enter marks before submitting");
      return;
    }
    try {
      setIsEvaluating(true);
      await api.post(
        `/api/assessments/${assessment._id}/submissions/${evalData.currentSubmission._id}/evaluate`,
        {
          marksObtained: Number(evalData.marks),
          feedback: evalData.feedback,
        },
      );
      toast.success("Evaluation submitted");
      setEvalData({ marks: "", feedback: "", currentSubmission: null });
      await loadSubmissions();
    } catch (err) {
      console.error("Evaluate failed:", err);
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName || "submission";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Submissions &bull; {assessment?.title}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Marks: {assessment?.totalMarks || "—"}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex h-[calc(85vh-80px)] overflow-hidden">
            {/* Left: Submission list */}
            <div className="w-2/5 border-r bg-slate-50/40 overflow-y-auto">
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">
                  Student Submissions ({submissions.length})
                </h4>

                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <FileText className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm">No submissions yet</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const isActive =
                      evalData.currentSubmission?._id === sub._id;
                    const isLate =
                      assessment?.dueDate &&
                      sub.submittedAt &&
                      new Date(sub.submittedAt) > new Date(assessment.dueDate);

                    return (
                      <div
                        key={sub._id}
                        onClick={() =>
                          setEvalData({
                            ...evalData,
                            currentSubmission: sub,
                            marks: sub.marksObtained ?? "",
                            feedback: sub.feedback || "",
                          })
                        }
                        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white ${
                          isActive
                            ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                            : "hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {sub.student?.user?.fullName || "Student"}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(sub.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={
                                sub.status === "evaluated"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }
                            >
                              {sub.status}
                            </Badge>
                            {isLate && (
                              <Badge className="bg-red-100 text-red-700 text-[10px]">
                                Late
                              </Badge>
                            )}
                          </div>
                        </div>
                        {sub.marksObtained !== undefined && (
                          <p className="text-xs text-slate-500 mt-2">
                            Marks:{" "}
                            <span className="font-medium text-blue-700">
                              {sub.marksObtained}/{assessment?.totalMarks}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Evaluation panel */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="p-6 space-y-5">
                <h4 className="text-sm font-semibold text-slate-700">
                  Evaluation Panel
                </h4>

                {evalData.currentSubmission ? (
                  <>
                    {/* File card */}
                    <div className="rounded-xl border bg-slate-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Submission File</p>
                          <p className="text-xs text-slate-500 uppercase">
                            {evalData.currentSubmission.fileType || "File"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              evalData.currentSubmission.fileUrl,
                              "_blank",
                            )
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              evalData.currentSubmission.fileUrl,
                              `submission-${evalData.currentSubmission._id}`,
                            )
                          }
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Student info */}
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border">
                      <p>
                        <span className="font-medium">Student: </span>
                        {evalData.currentSubmission.student?.user?.fullName ||
                          "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Submitted: </span>
                        {new Date(
                          evalData.currentSubmission.submittedAt,
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Marks input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Marks (Max: {assessment?.totalMarks})
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={assessment?.totalMarks}
                        value={evalData.marks}
                        onChange={(e) =>
                          setEvalData({ ...evalData, marks: e.target.value })
                        }
                        placeholder="Enter marks"
                        className="h-11"
                      />
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feedback</label>
                      <Textarea
                        rows={4}
                        value={evalData.feedback}
                        onChange={(e) =>
                          setEvalData({
                            ...evalData,
                            feedback: e.target.value,
                          })
                        }
                        placeholder="Provide constructive feedback..."
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleEvaluate}
                      disabled={isEvaluating}
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Evaluation"
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-slate-400 min-h-[200px]">
                    Select a submission from the list to evaluate
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminSubmissionListModal;
