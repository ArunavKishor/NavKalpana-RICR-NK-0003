import React, { useState } from "react";
import DoubtsQueries from "@/components/Support/DoubtsQueries";
import BackupClasses from "@/components/Support/BackupClasses";

const SupportRequests = () => {
  const [activeTab, setActiveTab] = useState("DOUBTS");

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Requests</h1>
          <p className="text-slate-500">
            Manage student doubts and backup class schedules
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("DOUBTS")}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === "DOUBTS"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Doubts & Queries
          </button>

          <button
            onClick={() => setActiveTab("BACKUP")}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === "BACKUP"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Backup Classes
          </button>
        </div>
      </div>

      {activeTab === "DOUBTS" ? <DoubtsQueries /> : <BackupClasses />}
    </div>
  );
};

export default SupportRequests;