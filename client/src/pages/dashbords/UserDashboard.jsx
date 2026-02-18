import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useStackApp } from "@stackframe/react";

const UserDashboard = () => {
    const { user } = useAuth();
    const stackApp = useStackApp();

    const handleSignOut = async () => {
        await stackApp.signOut();
    };

    const handleManageAccount = () => {
        // Stack Auth handles profile management via its own UI, usually at /handler/account-settings or similar.
        // For now, redirecting to the handler route which should show the profile if configured,
        // or we could use the UI components directly if available.
        // A simple href to /handler/profile is a good guess for default Stack setup,
        // or we can just rely on the user details shown here.
        window.location.href = "/handler/profile";
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading user data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header Background */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 sm:h-48"></div>

                    <div className="relative px-6 pb-8">
                        {/* Profile Picture */}
                        <div className="relative -mt-16 sm:-mt-24 mb-6">
                            <div className="inline-block p-1 bg-white rounded-full shadow-lg">
                                <img
                                    src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                                    alt="Profile"
                                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-white"
                                />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-left mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {user.fullName}
                            </h1>
                            <p className="text-gray-500 font-medium">{user.primaryEmail}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {user.role || "User"}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-8"></div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition cursor-pointer" onClick={handleManageAccount}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
                                <p className="text-gray-500 text-sm mb-4">Update your password and account details via Stack.</p>
                                <button className="text-blue-600 font-medium hover:text-blue-800 transition">
                                    Manage Account &rarr;
                                </button>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Courses</h3>
                                <p className="text-gray-500 text-sm mb-4">View your enrolled courses and progress (Coming Soon).</p>
                                <span className="text-gray-400 font-medium cursor-not-allowed">
                                    View Courses &rarr;
                                </span>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="mt-10 flex justify-end">
                            <button
                                onClick={handleSignOut}
                                className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition border border-red-200"
                            >
                                Sign Out
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
