import React from "react";

const SupportSummary = () => {
  return (
    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg space-y-4">
      <h3 className="font-semibold text-lg">
        Support Summary
      </h3>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Pending Queries</span>
        <span className="font-bold">02</span>
      </div>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Resolved Today</span>
        <span className="font-bold">05</span>
      </div>

      <div className="bg-indigo-500 p-4 rounded-lg flex justify-between">
        <span>Avg Response Time</span>
        <span className="font-bold">2.4h</span>
      </div>
    </div>
  );
};

export default SupportSummary;
