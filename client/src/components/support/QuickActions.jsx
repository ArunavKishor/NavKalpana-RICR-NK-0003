import React from "react";

const QuickActions = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <h3 className="font-semibold">Quick Actions</h3>

      <button className="block w-full text-left text-sm hover:text-indigo-600">
        Broadcast to Batch
      </button>

      <button className="block w-full text-left text-sm hover:text-indigo-600">
        Upload Study Material
      </button>

      <button className="block w-full text-left text-sm hover:text-indigo-600">
        Update Session Schedule
      </button>
    </div>
  );
};

export default QuickActions;