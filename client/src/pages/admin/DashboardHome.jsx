import React from "react";
import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------ DATA ------------------ */

const data = [
  { name: "Week 1", score: 65, attendance: 90 },
  { name: "Week 2", score: 72, attendance: 88 },
  { name: "Week 3", score: 68, attendance: 92 },
  { name: "Week 4", score: 78, attendance: 95 },
  { name: "Week 5", score: 85, attendance: 94 },
  { name: "Week 6", score: 82, attendance: 91 },
];

const stats = [
  {
    title: "Total Students",
    value: "452",
    change: "+12 from last month",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Courses",
    value: "8",
    change: "2 ending this week",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Pending Evaluation",
    value: "24",
    change: "Across 3 batches",
    icon: ClipboardCheck,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const upcomingDeadlines = [
  {
    title: "React Mid-Term Evaluation",
    date: "Oct 24, 2026",
    type: "Assignment",
    icon: Calendar,
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "Python Weekly Quiz #4",
    date: "Oct 26, 2026",
    type: "Quiz",
    icon: Calendar,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Data Structures Project",
    date: "Nov 02, 2026",
    type: "Project",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
];

/* ------------------ COMPONENT ------------------ */

const DashboardHome = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-none shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stat.value}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm sm:text-lg font-bold text-slate-800">
                    Class Performance Analytics
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Average test scores vs Attendance trends
                  </p>
                </div>

                <select className="w-full sm:w-auto text-xs sm:text-sm border rounded-md p-2 bg-slate-50">
                  <option>Last 6 Weeks</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-56 sm:h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-slate-800">
              Upcoming Deadlines
            </h3>
            <button className="text-xs sm:text-sm text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {upcomingDeadlines.map((item, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-3 flex gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {item.date} • {item.type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Navigation */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
              Quick Navigation
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-semibold">All Batches</span>
              </button>

              <button className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-600 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-semibold">Student List</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
