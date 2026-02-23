import React from "react";

const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
                <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 max-w-md">
                This module is currently under development. Backend integration and detailed views will be added soon.
            </p>
        </div>
    );
};

export default PlaceholderPage;
