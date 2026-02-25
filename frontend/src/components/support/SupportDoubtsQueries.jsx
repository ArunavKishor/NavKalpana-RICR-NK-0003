import React, { useState, useEffect } from "react";
import SupportSummary from "./SupportSummaryWidget";
import QuickActions from "./SupportQuickActions";
import api from "@/config/Api";
import toast from "react-hot-toast";

const DoubtsQueries = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/support", {
        params: { category: "academic" },
      });
      setRequests(res?.data?.data?.requests || []);
    } catch {
      toast.error("Failed to load doubts");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    const message = prompt("Enter your reply:");
    if (!message?.trim()) return;
    try {
      await api.post(`/api/support/${id}/respond`, { message: message.trim() });
      toast.success("Reply sent");
      fetchDoubts();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/api/support/${id}/resolve`);
      toast.success("Marked as resolved");
      fetchDoubts();
    } catch {
      toast.error("Failed to resolve");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Side */}
      <div className="lg:col-span-8 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            No academic doubts found.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-lg text-slate-900">
                    {req.student?.user?.fullName || "Unknown Student"}
                  </h2>
                  <p className="text-sm text-slate-500 mb-2">{req.subject}</p>
                  {req.course && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded mr-2">
                      {req.course}
                    </span>
                  )}
                  {req.topic && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                      {req.topic}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${
                    req.status === "open"
                      ? "bg-blue-100 text-blue-700"
                      : req.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <p className="text-slate-600 text-sm mt-3 line-clamp-3">
                {req.description}
              </p>

              {req.responses?.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  {req.responses.length} response(s)
                </p>
              )}

              {req.status !== "resolved" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleReply(req._id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleResolve(req._id)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Right Side */}
      <div className="lg:col-span-4 space-y-6">
        <SupportSummary />
        <QuickActions />
      </div>
    </div>
  );
};

export default DoubtsQueries;
