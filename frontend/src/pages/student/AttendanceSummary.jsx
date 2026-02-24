import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { format } from "date-fns";

const AttendanceSummary = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/attendance/me");
        setAttendanceData(response.data.data);
      } catch (err) {
        console.error("Attendance Fetch Error:", err);
        setError("Could not load attendance records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const {
    attendancePercentage = 0,
    presentCount = 0,
    absentCount = 0,
    lateCount = 0,
    totalSessions = 0,
    records = [],
  } = attendanceData || {};

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Attendance Summary
      </h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Overall Attendance</h3>
          <p className="text-2xl font-bold text-blue-600">
            {attendancePercentage}%
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{totalSessions} total sessions</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Present</h3>
          <p className="text-2xl font-bold text-green-600">
            {presentCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Absent</h3>
          <p className="text-2xl font-bold text-red-600">
            {absentCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Late</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {lateCount}
          </p>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Recent Attendance Records
        </h3>

        {records.length === 0 ? (
          <p className="text-gray-500 text-sm">No attendance records found yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Batch</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    {format(new Date(record.date), "dd MMM yyyy")}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{record.batch}</td>
                  <td>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColor(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceSummary;
