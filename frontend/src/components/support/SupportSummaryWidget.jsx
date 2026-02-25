import React, { useState, useEffect } from "react";
import api from "@/config/Api";

const SupportSummary = () => {
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    avgResponseTime: "—",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/support/statistics");
        const data = res?.data?.data || {};
        const avgMs = data.averageResponseTimeMs || 0;
        const avgHours = avgMs > 0 ? (avgMs / 3600000).toFixed(1) : "—";
        setStats({
          pending:
            (data.statusCounts?.open || 0) +
            (data.statusCounts?.["in-progress"] || 0),
          resolved: data.statusCounts?.resolved || 0,
          avgResponseTime: avgMs > 0 ? `${avgHours}h` : "—",
        });
      } catch {
        // Keep defaults
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg space-y-4">
      <h3 className="font-semibold text-lg">Support Summary</h3>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Pending Queries</span>
        <span className="font-bold">
          {String(stats.pending).padStart(2, "0")}
        </span>
      </div>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Resolved</span>
        <span className="font-bold">
          {String(stats.resolved).padStart(2, "0")}
        </span>
      </div>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Avg Response Time</span>
        <span className="font-bold">{stats.avgResponseTime}</span>
      </div>
    </div>
  );
};

export default SupportSummary;
