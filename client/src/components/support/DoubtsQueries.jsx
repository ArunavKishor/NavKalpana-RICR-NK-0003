import React from "react";
import SupportSummary from "./SupportSummary";
import QuickActions from "./QuickActions";

const DoubtsQueries = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Side */}
      <div className="col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-2">
            Alex Johnson
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            React Context API
          </p>

          <p className="text-gray-600 text-sm">
            I am struggling with nested context providers.
            How do I access state from parent provider?
          </p>

          <div className="mt-4 flex gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
              Reply
            </button>
            <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
              Mark Resolved
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg">
            Sarah Williams
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Figma Auto Layout
          </p>
          <p className="text-gray-600 text-sm">
            The wrap behavior in auto-layout is not working
            as expected.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="col-span-4 space-y-6">
        <SupportSummary />
        <QuickActions />
      </div>
    </div>
  );
};

export default DoubtsQueries;