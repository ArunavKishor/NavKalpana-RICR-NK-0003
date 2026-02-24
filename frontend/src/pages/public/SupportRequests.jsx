import React, { useState } from "react";
import DoubtsQueries from "@/components/Support/DoubtsQueries";
import BackupClasses from "@/components/Support/BackupClasses";

const SupportRequests = () => {
  const [activeTab, setActiveTab] = useState("DOUBTS");

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Support Requests</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage student doubts and backup class schedules
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setActiveTab("DOUBTS")}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition ${
              activeTab === "DOUBTS"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Doubts & Queries
          </button>

          <button
            onClick={() => setActiveTab("BACKUP")}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition ${
              activeTab === "BACKUP"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
