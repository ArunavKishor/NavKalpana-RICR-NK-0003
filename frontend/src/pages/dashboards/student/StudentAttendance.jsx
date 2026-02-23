import React from "react";

const AttendanceSummary = () => {
  const attendanceData = {
    overallPercentage: 82,
    present: 32,
    absent: 5,
    late: 2,
  };

  const recentAttendance = [
    { date: "18 Feb 2026", status: "Present" },
    { date: "17 Feb 2026", status: "Late" },
    { date: "16 Feb 2026", status: "Absent" },
    { date: "15 Feb 2026", status: "Present" },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Present":
        return "text-green-600 bg-green-100";
      case "Absent":
        return "text-red-600 bg-red-100";
      case "Late":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

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
            {attendanceData.overallPercentage}%
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${attendanceData.overallPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Present</h3>
          <p className="text-2xl font-bold text-green-600">
            {attendanceData.present}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Absent</h3>
          <p className="text-2xl font-bold text-red-600">
            {attendanceData.absent}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Late</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {attendanceData.late}
          </p>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Recent Attendance Records
        </h3>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.map((record, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3">{record.date}</td>
                <td>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSummary;