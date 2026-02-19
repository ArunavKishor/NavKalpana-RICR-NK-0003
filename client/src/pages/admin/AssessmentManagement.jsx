import React, { useState } from "react";
import {
  Plus,
  FileText,
  CheckSquare,
  Calendar,
  Target,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample assignments data
const assignmentsData = [
  {
    id: 1,
    title: "Custom Hook Implementation",
    lesson: "Introduction to React Hooks",
    description: "Create a useLocalStorage hook to persist state.",
    deadline: "2026-02-25",
    maxMarks: 50,
    progress: 75,
    status: "ONGOING",
    submissions: 24,
    late: 2,
    evaluated: 18,
    type: "assignment",
  },
  {
    id: 2,
    title: "Redux Toolkit Store",
    lesson: "State Management with Redux",
    description: "Set up a global store using RTK for a cart app.",
    deadline: "2026-02-20",
    maxMarks: 100,
    progress: 43,
    status: "EVALUATING",
    submissions: 28,
    late: 4,
    evaluated: 12,
    type: "assignment",
  },
  {
    id: 4,
    title: "Node.js API Development",
    lesson: "Backend Development",
    description: "Build a RESTful API with Express and MongoDB.",
    deadline: "2026-03-05",
    maxMarks: 80,
    progress: 15,
    status: "ONGOING",
    submissions: 8,
    late: 0,
    evaluated: 2,
    type: "assignment",
  },
];

// Sample quizzes data
const quizzesData = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    lesson: "Introduction to React Hooks",
    duration: 20,
    attempts: 26,
    questions: 15,
    avgScore: 24.5,
    maxScore: 30,
    status: "ACTIVE",
    type: "quiz",
  },
  {
    id: 2,
    title: "Routing Proficiency Test",
    lesson: "Advanced Routing Patterns",
    duration: 30,
    attempts: 12,
    questions: 20,
    avgScore: 32.2,
    maxScore: 40,
    status: "SCHEDULED",
    type: "quiz",
  },
];

const AssessmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedLesson, setSelectedLesson] = useState("all");

  // Get data based on active tab
  const filteredData =
    activeTab === "assignments" ? assignmentsData : quizzesData;

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "EVALUATING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Assessment Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage assignments and quizzes across your lessons
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>
            {activeTab === "quizzes" ? "Create Quiz" : "Create Assignment"}
          </span>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial justify-center ${
              activeTab === "assignments"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial justify-center ${
              activeTab === "quizzes"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Quizzes
          </button>
        </div>

        {/* Lesson Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            <option value="all">All Lessons</option>
            <option value="react">React Lessons</option>
            <option value="redux">Redux Lessons</option>
            <option value="javascript">JavaScript Lessons</option>
            <option value="nodejs">Node.js Lessons</option>
          </select>
        </div>
      </div>

      {/* Content - Conditional rendering based on tab */}
      {activeTab === "assignments" ? (
        /* Assignments Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredData.map((assignment) => (
            <Card
              key={assignment.id}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-6 space-y-5">
                {/* Header with Title and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        Lesson: {assignment.lesson}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(assignment.status)} border px-3 py-1 font-semibold text-xs shrink-0`}
                  >
                    {assignment.status}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Deadline and Max Marks */}
                <div className="flex items-center gap-6">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Deadline
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {assignment.deadline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Max Marks
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {assignment.maxMarks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Evaluation Progress
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {assignment.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${assignment.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats and Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">
                        {assignment.submissions}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Submissions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {assignment.late}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Late
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {assignment.evaluated}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Evaluated
                      </div>
                    </div>
                  </div>

                  {/* View All Link */}
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group">
                    View All
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Quizzes Table */
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 py-4 px-6 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Quiz Title</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Stats</div>
              <div className="col-span-2">Avg Score</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-200">
              {filteredData.map((quiz) => (
                <div
                  key={quiz.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  {/* Quiz Title */}
                  <div className="col-span-1 md:col-span-3 flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        {quiz.lesson}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase">
                      Duration:
                    </div>
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {quiz.duration} mins
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase mb-1">
                      Stats:
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-bold text-slate-900">
                          {quiz.attempts}
                        </span>{" "}
                        <span className="text-slate-500">Attempts</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {quiz.questions}{" "}
                        <span className="text-orange-500">QUESTIONS</span>
                      </p>
                    </div>
                  </div>

                  {/* Avg Score */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <div className="md:hidden text-xs font-semibold text-slate-500 uppercase mr-2">
                      Avg Score:
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {quiz.avgScore}
                    </span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-sm text-slate-500">
                      {quiz.maxScore}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <Badge
                      className={`${getStatusColor(quiz.status)} border px-3 py-1.5 font-semibold text-xs`}
                    >
                      {quiz.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-start md:justify-center">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <BarChart3 className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {filteredData.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-slate-500">
            Create your first{" "}
            {activeTab === "assignments" ? "assignment" : "quiz"} to get
            started.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;
