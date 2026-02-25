import React, { useState, useEffect } from "react";
import api from "@/config/Api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const BackupClasses = () => {
  const { role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackupClasses();
  }, []);

  const fetchBackupClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/support");
      const all = res?.data?.data?.requests || [];
      const withBackup = all.filter(
        (r) => r.backupClassSchedule && r.backupClassSchedule.date,
      );
      setRequests(withBackup);
    } catch {
      toast.error("Failed to load backup classes");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, status) => {
    try {
      await api.put(`/api/support/${id}/approve-backup-class`, { status });
      toast.success(`Backup class ${status}`);
      fetchBackupClasses();
    } catch {
      toast.error("Failed to update backup class status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
        No backup classes scheduled yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => {
          const schedule = req.backupClassSchedule;
          const scheduleStatus = schedule.status || "pending";
          return (
            <div
              key={req._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
            >
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[scheduleStatus]}`}
              >
                {scheduleStatus}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">
                {schedule.topic}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {new Date(schedule.date).toLocaleString()}
              </p>
              {schedule.meetingLink && (
                <a
                  href={schedule.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                >
                  Join Meeting
                </a>
              )}
              <p className="text-xs text-slate-400 mt-2">
                Request: {req.subject}
              </p>

              {role === "admin" && scheduleStatus === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApproval(req._id, "rejected")}
                    className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproval(req._id, "approved")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BackupClasses;
