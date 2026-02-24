import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Clock,
  Users,
  HelpCircle,
  BarChart3,
  X,
  Activity,
  Pencil,
  PlusCircle,
  TrendingUp,
  LayoutGrid,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Monitor,
  Trophy,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";
import CreateQuiz from "@/components/teacher/CreateQuiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [monitorQuiz, setMonitorQuiz] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [monitorData, setMonitorData] = useState({
    submissions: [],
    stats: null,
    loading: true,
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/assessments", {
        params: { type: "quiz" },
      });
      setQuizzes(data?.data?.assessments || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error("Cloud registry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizCreated = () => {
    loadQuizzes();
    setShowCreateForm(false);
    setEditingQuiz(null);
    toast.success("Quiz node published successfully");
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Permanently purge this quiz node from the system?")) return;
    try {
      await api.delete(`/api/assessments/${quizId}`);
      toast.success("Quiz node purged");
      loadQuizzes();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowCreateForm(true);
  };

  const openMonitor = async (quiz) => {
    setMonitorQuiz(quiz);
    setMonitorData({ submissions: [], stats: null, loading: true });
    try {
      const [subsRes, statsRes] = await Promise.all([
        api.get(`/api/assessments/${quiz._id}/submissions`),
        api.get(`/api/assessments/${quiz._id}/statistics`),
      ]);
      setMonitorData({
        submissions: subsRes.data?.data?.submissions || [],
        stats: statsRes.data?.data || null,
        loading: false,
      });
    } catch (err) {
      console.error("Monitoring link failed:", err);
      setMonitorData({ submissions: [], stats: null, loading: false });
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <CreateQuiz
        onQuizCreated={handleQuizCreated}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingQuiz(null);
        }}
        editingQuiz={editingQuiz}
      />
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* High-Impact Header Section */}
      <section className="relative overflow-hidden group rounded-[2.5rem] bg-rose-600 px-6 py-10 sm:px-12 sm:py-16 shadow-2xl shadow-rose-200">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[36rem] h-[36rem] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="h-2 w-10 bg-white rounded-full"></div>
              <span className="text-rose-100 font-bold tracking-[0.3em] text-[10px] uppercase">Smart Assessment Engine</span>
            </motion.div>
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4">Quiz Matrix</h1>
              <p className="text-rose-100/80 max-w-xl font-bold text-lg leading-relaxed">
                Engineer automated evaluations with real-time monitoring and advanced performance analytics.
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => {
              setEditingQuiz(null);
              setShowCreateForm(true);
            }}
            className="w-full lg:w-auto h-20 px-12 rounded-[2rem] bg-white hover:bg-rose-50 text-rose-600 font-black text-xl shadow-xl shadow-rose-900/20 flex items-center justify-center gap-4 group transition-all"
          >
            <PlusCircle className="w-8 h-8 group-hover:rotate-90 transition-transform" />
            Initialize New Quiz
          </Button>
        </div>
      </section>

      {/* Analytics & Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-[2.5rem] grid grid-cols-1 sm:grid-cols-3 gap-2 border border-white shadow-sm">
           {[
             { label: 'Published', value: quizzes.filter(q => q.status === 'published').length, color: 'text-indigo-600' },
             { label: 'Active Drafts', value: quizzes.filter(q => q.status === 'draft').length, color: 'text-orange-500' },
             { label: 'Avg Accuracy', value: '78%', color: 'text-emerald-500' }
           ].map((stat, i) => (
             <div key={i} className="bg-white/80 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                   <Activity size={18}/>
                </div>
             </div>
           ))}
        </div>

        <div className="lg:col-span-4 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-rose-500 transition-colors" />
          <input
            placeholder="Identify quiz node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 h-16 bg-white border border-slate-200/60 rounded-[2rem] focus:ring-4 focus:ring-rose-50 outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100/50 rounded-[3rem] border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[4rem]">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                <HelpCircle className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">No matching quiz nodes</h3>
              <p className="text-rose-500/60 font-black uppercase text-[10px] tracking-widest mt-2 cursor-pointer" 
                 onClick={() => setShowCreateForm(true)}>Initialize your first entry</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, idx) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[3rem] p-6 sm:p-10 border border-slate-100/80 shadow-sm hover:shadow-2xl hover:shadow-rose-500/5 transition-all group overflow-hidden relative"
              >
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                   <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                         <Badge className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none ${
                            quiz.status === 'published' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                         }`}>
                           {quiz.status}
                         </Badge>
                         <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                         <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={12}/> {quiz.duration || 30} Minutes
                         </div>
                      </div>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">{quiz.title}</h3>
                         <p className="text-slate-500 font-bold line-clamp-1 mt-1">{quiz.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 pt-2">
                         <div className="flex items-center gap-2">
                            <HelpCircle size={14} className="text-rose-500" />
                            <span className="text-xs font-black text-slate-900 uppercase">{quiz.questions?.length || 0} Queries</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Monitor size={14} className="text-indigo-400" />
                            <span className="text-xs font-black text-slate-400 uppercase">Limit: {quiz.attemptLimit || 1}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Trophy size={14} className="text-orange-400" />
                            <span className="text-xs font-black text-slate-400 uppercase">Cap: {quiz.totalMarks} Mk</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                      <Button onClick={() => openMonitor(quiz)} className="flex-1 lg:w-40 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 gap-2">
                         <Activity size={20} /> Monitoring
                      </Button>
                      <Button onClick={() => setPreviewQuiz(quiz)} variant="outline" className="w-16 h-16 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-900 p-0">
                         <Eye size={22} />
                      </Button>
                      <Button onClick={() => handleEditQuiz(quiz)} variant="outline" className="w-16 h-16 rounded-2xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 p-0">
                         <Pencil size={20} />
                      </Button>
                      <Button onClick={() => handleDeleteQuiz(quiz._id)} variant="outline" className="w-16 h-16 rounded-2xl border-rose-100 hover:bg-rose-500 hover:text-white p-0">
                         <Trash2 size={20} />
                      </Button>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Quiz Preview Overlay */}
      <AnimatePresence>
        {previewQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[4rem] shadow-4xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
               <div className="bg-slate-950 p-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white">{previewQuiz.title}</h2>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mt-2">Evaluation Verification Mode</p>
                  </div>
                  <button onClick={() => setPreviewQuiz(null)} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/50">
                  {previewQuiz.questions?.map((q, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-start gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shrink-0">0{idx+1}</div>
                         <h4 className="text-xl font-black text-slate-800 pt-2 leading-relaxed">{q.question}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-16">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                              oIdx === q.correctAnswer ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100" : "bg-white border-slate-100 text-slate-600"
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                                oIdx === q.correctAnswer ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                              }`}>{["A", "B", "C", "D"][oIdx]}</div>
                            <span className="font-bold">{opt}</span>
                            {oIdx === q.correctAnswer && <CheckCircle2 className="text-emerald-500 ml-auto" size={20} />}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="ml-0 md:ml-16 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 flex gap-4">
                           <AlertCircle className="text-indigo-400 shrink-0" size={20} />
                           <p className="text-sm font-bold text-indigo-900/60 leading-relaxed italic">System Clarification: {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monitoring Hub Overlay */}
      <AnimatePresence>
        {monitorQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-[4rem] shadow-4xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
               {/* Header */}
               <div className="p-10 bg-slate-900 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
                       <Activity size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">{monitorQuiz.title} Tracking</h2>
                      <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mt-1">Live Institutional Monitoring Hub</p>
                    </div>
                  </div>
                  <button onClick={() => setMonitorQuiz(null)} className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                    <X size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-slate-50/50 space-y-12">
                  {monitorData.loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center">
                       <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                       <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Secure Data Nodes...</p>
                    </div>
                  ) : (
                    <>
                      {/* Intelligence Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         {[
                           { label: 'Attempts', value: monitorData.stats?.submissionCount || 0, icon: Users, color: 'indigo' },
                           { label: 'Avg Merit', value: (monitorData.stats?.averageMarks || 0).toFixed(1), meta: `/${monitorQuiz.totalMarks}`, icon: Trophy, color: 'emerald' },
                           { label: 'Yield Rate', value: `${(monitorData.stats?.completionPercentage || 0).toFixed(0)}%`, icon: TrendingUp, color: 'rose' },
                           { label: 'Class Pct', value: `${((monitorData.stats?.averageMarks || 0) / (monitorQuiz.totalMarks || 1) * 100).toFixed(0)}%`, icon: Activity, color: 'orange' }
                         ].map((item, i) => (
                           <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                              <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{item.label}</p>
                              <div className="flex items-baseline gap-1">
                                 <h4 className={`text-4xl font-black text-slate-900 tracking-tighter`}>{item.value}</h4>
                                 {item.meta && <span className="text-lg font-black text-slate-300">{item.meta}</span>}
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Performance Ledger */}
                      <div className="space-y-6">
                         <div className="flex items-center justify-between px-4">
                            <h3 className="text-2xl font-black text-slate-900">Attempt Ledger</h3>
                            <Button variant="ghost" className="rounded-xl font-bold uppercase text-[9px] tracking-widest text-slate-400 hover:text-indigo-600">Download Full Audit</Button>
                         </div>
                         <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            {monitorData.submissions.length === 0 ? (
                              <div className="py-24 text-center">
                                 <Users className="mx-auto mb-4 text-slate-200" size={48} />
                                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No traversal nodes detected yet</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto p-4 sm:p-10">
                                <table className="w-full">
                                  <thead className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-50">
                                    <tr>
                                      <th className="px-6 py-6 text-left">Candidate node</th>
                                      <th className="px-6 py-6 text-left">Inception</th>
                                      <th className="px-6 py-6 text-center">Merit</th>
                                      <th className="px-6 py-6 text-center">Percentage</th>
                                      <th className="px-6 py-6 text-center">Protocol Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {monitorData.submissions.map((sub) => {
                                      const pct = (sub.marksObtained / (monitorQuiz.totalMarks || 1) * 100);
                                      return (
                                        <tr key={sub._id} className="group hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white">
                                                {(sub.student?.user?.fullName || "S")[0]}
                                              </div>
                                              <span className="font-black text-slate-800">{sub.student?.user?.fullName || "Legacy student"}</span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-6 text-slate-500 font-bold">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                          <td className="px-6 py-6 text-center">
                                            <span className="font-black text-slate-900">{sub.marksObtained ?? '—'}</span>
                                          </td>
                                          <td className="px-6 py-6 text-center">
                                            <Badge className={`px-4 py-1.5 rounded-xl font-black uppercase text-[9px] border-none ${
                                                pct >= 80 ? 'bg-emerald-50 text-emerald-600' : pct >= 50 ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-500'
                                              }`}>
                                              {pct.toFixed(0)}%
                                            </Badge>
                                          </td>
                                          <td className="px-6 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${sub.status === 'evaluated' ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{sub.status || 'Active'}</span>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                         </div>
                      </div>
                    </>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizManagement;
