import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  Edit,
  X,
  FileText,
  Download,
  CheckCircle,
  Clock,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  Calendar,
  CloudUpload,
  ArrowRight,
  BookOpen,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const TeacherAssessmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "assignment",
    batch: "",
    dueDate: "",
    totalMarks: 100,
    submissionType: "PDF",
  });
  const [evalData, setEvalData] = useState({
    marks: "",
    feedback: "",
    currentSubmission: null,
  });

  useEffect(() => {
    loadAssessments();
    loadBatches();
  }, [activeTab]);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/batches");
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error("Load batches failed:", err);
    }
  };

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/assessments", {
        params: {
          type: activeTab === "assignments" ? "assignment" : "quiz",
        },
      });
      setAssessments(data?.data?.assessments || []);
    } catch (err) {
      console.error("Load assessments failed:", err);
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (assessmentId) => {
    if (!window.confirm("Permanently remove this assessment? This cannot be undone.")) return;
    try {
      await api.delete(`/api/assessments/${assessmentId}`);
      toast.success("Assessment purged from library");
      loadAssessments();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Operation failed");
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/assessments/${editingId}`, formData);
        toast.success("Assessment updated successfully");
      } else {
        await api.post("/api/assessments", formData);
        toast.success("New assessment published");
      }
      setShowForm(false);
      setEditingId(null);
      loadAssessments();
    } catch (err) {
      console.error("Save assessment failed:", err);
      toast.error("Failed to save changes");
    }
  };

  const handleEditAssessment = (assessment) => {
    setEditingId(assessment._id);
    setFormData({
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      batch: assessment.batch?._id || assessment.batch || "",
      dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().split("T")[0] : "",
      totalMarks: assessment.totalMarks,
      submissionType: assessment.submissionType || "PDF",
    });
    setShowForm(true);
  };

  const handleViewSubmissions = async (assessment) => {
    setSelectedAssessment(assessment);
    try {
      const { data } = await api.get(`/api/assessments/${assessment._id}/submissions`);
      setSubmissions(data?.data?.submissions || []);
      setEvalData({ marks: "", feedback: "", currentSubmission: null });
      setShowEvaluation(true);
    } catch (err) {
      console.error("Load submissions failed:", err);
      toast.error("Failed to retrieve student work");
    }
  };

  const handleEvaluate = async () => {
    const { currentSubmission, marks, feedback } = evalData;
    if (!currentSubmission || !marks) return toast.error("Marks required");

    try {
      await api.put(`/api/assessments/evaluate/${currentSubmission._id}`, {
        marksObtained: marks,
        feedback,
      });
      toast.success("Evaluation registered");
      handleViewSubmissions(selectedAssessment);
    } catch (err) {
      console.error("Evaluation failed:", err);
      toast.error("Failed to save grade");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header Section */}
      <section className="relative overflow-hidden group rounded-[2.5rem] bg-slate-950 px-6 py-10 sm:px-12 sm:py-16 shadow-2xl shadow-indigo-100/50">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-lg h-128 bg-linear-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="h-2 w-8 bg-indigo-500 rounded-full"></div>
              <span className="text-indigo-400 font-bold tracking-[0.3em] text-[10px] uppercase">Grade Center Management</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Academic Grading</h1>
            <p className="text-slate-400 max-w-lg font-medium text-lg leading-relaxed">
              Design rigorous assessments, track student submissions, and provide impactful feedback.
            </p>
          </div>
          
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: "", description: "", type: "assignment", batch: "", dueDate: "", totalMarks: 100, submissionType: "PDF" });
              setShowForm(true);
            }}
            className="w-full md:w-auto h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-600/30 gap-3 group transition-all"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Create Evaluation
          </Button>
        </div>
      </section>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 p-1.5 bg-slate-100/80 rounded-[2rem] flex border border-slate-200 shadow-sm backdrop-blur-sm">
          {["assignments", "quizzes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-xl ring-1 ring-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'assignments' ? <FileText size={16}/> : <LayoutGrid size={16}/>}
                {tab}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-7 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search using title, instructions or batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 bg-white border-slate-200/60 rounded-[2rem] focus-visible:ring-indigo-600 focus-visible:ring-offset-0 font-bold text-slate-700 placeholder:text-slate-300 shadow-sm hover:shadow-md transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-slate-50/50 rounded-[2.5rem] border-2 border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssessments.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-slate-100 rotate-12 transition-transform hover:rotate-0">
                <BookOpen className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Clean Slate</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active {activeTab} discovered</p>
            </motion.div>
          ) : (
            filteredAssessments.map((assessment, idx) => (
              <motion.div
                key={assessment._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all p-4 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-8 group"
              >
                {/* Visual Type Indicator */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm ${
                      assessment.status === "active" ? "bg-emerald-500 text-white" : "bg-warning-500 text-white"
                    }`}>
                      {assessment.status || "active"}
                    </Badge>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                       <Clock size={12} className="text-slate-400" />
                       <span className="text-[10px] font-black text-slate-500 uppercase">Due {new Date(assessment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                       {assessment.title}
                    </h3>
                    <p className="text-slate-500 font-bold line-clamp-2 leading-relaxed">
                       {assessment.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                       <Target size={14} className="text-indigo-500" />
                       <span className="text-xs font-black text-slate-900 uppercase">Total Marks: {assessment.totalMarks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <CloudUpload size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-500">{assessment.submissionType || "System Data"}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 lg:w-112.5">
                   {[
                     { label: 'Submitted', value: assessment.submissions?.filter(s => s.status === 'submitted').length || 0, color: 'text-indigo-600' },
                     { label: 'Evaluation', value: assessment.submissions?.filter(s => s.status === 'pending').length || 0, color: 'text-orange-500' },
                     { label: 'Finalized', value: assessment.submissions?.filter(s => s.status === 'evaluated').length || 0, color: 'text-emerald-500' }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                        <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                     </div>
                   ))}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 shrink-0">
                   <Button onClick={() => handleViewSubmissions(assessment)} className="flex-1 lg:w-36 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black">
                      Grade Hub
                   </Button>
                   <div className="flex gap-2">
                     <Button onClick={() => handleEditAssessment(assessment)} variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 hover:border-indigo-500 hover:text-indigo-600 p-0">
                        <Edit size={18} />
                     </Button>
                     <Button onClick={() => handleDelete(assessment._id)} variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 hover:border-rose-500 hover:text-rose-600 p-0">
                        <Trash2 size={18} />
                     </Button>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modern Dialog Implementation */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-950 p-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">{editingId ? 'Refine' : 'Design'} {activeTab === "assignments" ? "Assignment" : "Quiz"}</h2>
              <p className="text-indigo-400/80 font-bold uppercase tracking-widest text-[10px] mt-1">Academic Blueprint Editor</p>
            </div>
          </div>
          <form onSubmit={handleCreateAssessment} className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Entry Title</label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Advanced Algorithms Midterm" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Procedural Instructions</label>
              <Textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Comprehensive details for students..." className="rounded-2xl border-slate-200 bg-slate-50/50 min-h-30 font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Target Batch</label>
                <Select value={formData.batch} onValueChange={(val) => setFormData({ ...formData, batch: val })}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Target Cohort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {batches.map((b) => <SelectItem key={b._id} value={b._id} className="rounded-xl">{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Deadline Date</label>
                <Input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 font-bold" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
               <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-14 px-8 rounded-2xl font-black text-slate-400">Cancel</Button>
               <Button type="submit" className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200">
                  {editingId ? "Apply Synchronization" : "Publish Assessment"}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade Hub Implementation */}
      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="max-w-280 h-[90vh] p-0 border-none shadow-3xl rounded-[3rem] overflow-hidden flex flex-col sm:flex-row">
          {/* Left: Metadata & List */}
          <div className="w-full sm:w-100 flex flex-col border-r border-slate-100 bg-slate-50/50">
             <div className="p-8 bg-white border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-1 truncate">{selectedAssessment?.title}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Grade Management</p>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {submissions.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                     <CloudUpload className="mx-auto mb-4" size={40}/>
                     <p className="text-xs font-black uppercase">No work submitted</p>
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => setEvalData({ ...evalData, currentSubmission: sub, marks: sub.marksObtained || "" })}
                      className={`w-full text-left p-5 rounded-3xl transition-all border-2 ${
                        evalData.currentSubmission?._id === sub._id
                          ? "bg-white border-indigo-200 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-50/50"
                          : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shrink-0">
                            {sub.student?.user?.fullName?.charAt(0) || "S"}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 truncate">{sub.student?.user?.fullName || "Legacy Student"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                            
                            <div className="mt-4">
                               <Badge className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                 sub.status === 'evaluated' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                               }`}>
                                 {sub.status}
                               </Badge>
                            </div>
                         </div>
                         {sub.status === 'evaluated' && <CheckCircle className="text-emerald-500 shrink-0" size={18} />}
                      </div>
                    </button>
                  ))
                )}
             </div>
          </div>

          {/* Right: Evaluation Canvas */}
          <div className="flex-1 bg-white p-6 sm:p-12 overflow-y-auto relative">
             {evalData.currentSubmission ? (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-3xl font-black text-slate-900">Submission Details</h3>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Verify work and enter marks</p>
                     </div>
                     <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 hover:bg-slate-50 gap-3 group" 
                            onClick={() => window.open(evalData.currentSubmission.fileUrl, "_blank")}>
                        <Download size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="font-black">View Document</span>
                     </Button>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                     <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                        <FileText size={40} className="text-indigo-500" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Document Node</p>
                        <p className="text-lg font-black text-slate-800">{evalData.currentSubmission.fileType || "Assessment Metadata"}</p>
                        <p className="text-xs text-indigo-500 font-bold">Secure Cloud URI Storage Enabled</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Marks Allocation</label>
                           <span className="text-xs font-black text-indigo-600">CAP: {selectedAssessment.totalMarks}</span>
                        </div>
                        <Input type="number" max={selectedAssessment.totalMarks} value={evalData.marks}
                               onChange={(e) => setEvalData({ ...evalData, marks: e.target.value })}
                               className="h-20 text-4xl font-black bg-slate-50/50 border-none rounded-[1.5rem] focus-visible:ring-indigo-600 text-slate-900" />
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Constructive Feedback Loop</label>
                        <Textarea rows={6} value={evalData.feedback} 
                              onChange={(e) => setEvalData({ ...evalData, feedback: e.target.value })}
                              placeholder="Describe strengths and areas for improvement..."
                              className="rounded-[1.5rem] border-slate-200 bg-slate-50/50 p-6 font-medium text-lg" />
                     </div>
                  </div>

                  <Button className="w-full h-20 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-600/30 gap-3"
                          onClick={handleEvaluate}>
                     Commit Grade to Portal
                     <ArrowRight size={24} />
                  </Button>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-32 h-32 bg-slate-50 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center">
                     <Eye size={48} className="text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">Verification Canvas</h4>
                    <p className="text-slate-400 font-bold max-w-xs mt-2 uppercase tracking-widest text-[10px]">Select a student from the vault to initiate evaluation cycle</p>
                  </div>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssessmentManagement;
