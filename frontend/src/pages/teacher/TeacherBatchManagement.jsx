import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Zap, Archive, Calendar, Users, Target, ArrowRight, BookOpen, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const TeacherBatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ONGOING");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBatches();
  }, [activeFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (activeFilter === "ONGOING") params.status = "ongoing";
      else if (activeFilter === "COMPLETED") params.status = "completed";
      else if (activeFilter === "UPCOMING") params.status = "upcoming";

      const { data } = await api.get("/api/batches", { params });
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error("Load batches failed:", err);
      setError("Failed to sync batch records. Verify your connection.");
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEndBatch = async (batchId) => {
    if (!window.confirm("Archive this cohort? Final grades will be locked.")) return;
    try {
      await api.put(`/api/batches/${batchId}`, { status: "completed" });
      toast.success("Batch successfully archived");
      await loadBatches();
    } catch (err) {
      toast.error("Failed to archive batch");
    }
  };

  const statusConfig = {
    ongoing: { color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
    completed: { color: "bg-slate-400", light: "bg-slate-50", text: "text-slate-600", label: "Archived" },
    upcoming: { color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", label: "Starting Soon" }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header */}
      <section className="relative overflow-hidden group rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-linear-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
              <div className="h-2 w-6 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 font-bold tracking-[0.2em] text-[10px] uppercase">Cohort Management</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Your Batches</h1>
            <p className="text-slate-400 max-w-md font-medium mt-2 leading-relaxed">
              Track progress, attendance, and performance across your active educational groups.
            </p>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit">
          {["ONGOING", "UPCOMING", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                activeFilter === status
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search cohort code or course name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-blue-500 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-50 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBatches.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
                <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-400">No matching cohorts found</h3>
                <p className="text-slate-400 font-medium">Try adjusting your filters or search query</p>
              </motion.div>
            ) : (
              filteredBatches.map((batch, idx) => {
                const config = statusConfig[batch.status] || statusConfig.ongoing;
                return (
                  <motion.div
                    key={batch._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-[2rem] border border-slate-200/70 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden flex flex-col"
                  >
                    {/* Visual Header */}
                    <div className="h-2 w-full bg-slate-100 relative">
                       <div className={`h-full ${config.color} transition-all duration-1000`} style={{ width: `${batch.progress || 0}%` }}></div>
                    </div>

                    <div className="p-7 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`px-3 py-1 rounded-full ${config.light} ${config.text} text-[10px] font-black uppercase tracking-widest border border-${config.text.split('-')[1]}-200`}>
                           {config.label}
                        </div>
                        <div className="flex -space-x-2">
                           {[...Array(3)].map((_, i) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                               <Users size={12} className="text-slate-400" />
                             </div>
                           ))}
                           <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                             +{Math.max(0, (batch.students?.length || 0)-3)}
                           </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                        {batch.name}
                      </h3>
                      <p className="text-sm font-bold text-slate-400 mb-8 flex items-center gap-2">
                         <BookOpen size={14} />
                         {batch.course}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
                           <p className="text-lg font-black text-slate-900">{batch.students?.length || 0}</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion</p>
                           <p className="text-lg font-black text-slate-900">{batch.progress || 0}%</p>
                         </div>
                      </div>

                      <div className="space-y-3 mt-auto">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-rose-500" />
                          <span>Ends {new Date(batch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="mt-8 flex gap-3">
                         <Button
                           onClick={() => navigate(`/teacher-dashboard/batches/${batch._id}`)}
                           className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black gap-2 group/btn"
                         >
                           Control Root
                           <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                         </Button>
                         {batch.status === "ongoing" && (
                           <Button
                             onClick={() => handleEndBatch(batch._id)}
                             variant="outline"
                             className="h-12 w-12 rounded-2xl border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all p-0"
                             title="Archive Batch"
                           >
                             <Archive size={18} />
                           </Button>
                         )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TeacherBatchManagement;
  );
};

export default TeacherBatchManagement;
