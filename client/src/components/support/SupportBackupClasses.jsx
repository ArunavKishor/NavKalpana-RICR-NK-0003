import React from "react";

const BackupClasses = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg">
          + Schedule New Class
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
            Scheduled
          </span>
          <h3 className="mt-3 font-semibold">
            Advanced Tailwind Configurations
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Feb 22, 2026 — 10:00 AM
          </p>

          <button className="mt-4 bg-gray-100 px-4 py-2 rounded-lg text-sm">
            Edit
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
            Pending Approval
          </span>
          <h3 className="mt-3 font-semibold">
            Database Normalization
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Feb 24, 2026 — 02:00 PM
          </p>

          <div className="flex gap-3 mt-4">
            <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
              Edit
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupClasses;
