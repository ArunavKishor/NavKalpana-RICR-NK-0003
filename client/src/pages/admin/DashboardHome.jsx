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

const DashboardHome = () => {
    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Class Performance Analytics
                                    </CardTitle>
                                    <p className="text-sm text-slate-500">
                                        Average test scores vs Attendance trends
                                    </p>
                                </div>
                                {/* Simple dropdown placeholder */}
                                <select className="text-sm border-slate-200 rounded-md p-1 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option>Last 6 Weeks</option>
                                    <option>Last 3 Months</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="attendance"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Deadlines */}
                <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Upcoming Deadlines</h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {upcomingDeadlines.map((item, index) => (
                            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            {item.icon === Calendar && <span className="w-1 h-1 rounded-full bg-slate-400"></span>}
                                            {item.date} • {item.type}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Quick Navigation / Widget */}
                    <div className="mt-8">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Navigation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                                <Users className="w-5 h-5" />
                                <span className="text-xs font-semibold">All Batches</span>
                            </button>
                            <button className="bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                                <BookOpen className="w-5 h-5" />
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
