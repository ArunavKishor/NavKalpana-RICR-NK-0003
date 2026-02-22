import React, { useState } from "react";
import StudentQuizzes from "@/components/student/StudentQuizzes";
import QuizManagement from "@/pages/teacher/QuizManagement";

const QuizDemo = () => {
  const [view, setView] = useState("selection"); // selection, teacher, student
  const [studentId, setStudentId] = useState("student_1");

  return (
    <div>
      {view === "selection" ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Quiz System Demo
              </h1>
              <p className="text-slate-600 mb-8">
                Choose your role to explore the quiz system
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher View */}
                <button
                  onClick={() => setView("teacher")}
                  className="p-8 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition">
                    👨‍🏫
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Teacher View
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Create and manage quizzes for students
                  </p>
                  <p className="text-xs text-orange-600 font-semibold">
                    Create • Assign • Monitor
                  </p>
                </button>

                {/* Student View */}
                <button
                  onClick={() => setView("student")}
                  className="p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition">
                    👨‍🎓
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Student View
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Take quizzes and track your progress
                  </p>
                  <p className="text-xs text-blue-600 font-semibold">
                    Attempt • Score • Analyze
                  </p>
                </button>
              </div>

              {/* Info Section */}
              <div className="mt-8 pt-8 border-t border-slate-200 text-left">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Features
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✅ Create quizzes with multiple questions</li>
                  <li>✅ Randomly shuffle options per student (deterministic)</li>
                  <li>✅ Real-time progress tracking</li>
                  <li>✅ Instant score calculation</li>
                  <li>✅ Answer review and feedback</li>
                  <li>✅ Download report & share score</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : view === "teacher" ? (
        <div>
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50">
            <h2 className="text-xl font-bold">Teacher Dashboard</h2>
            <button
              onClick={() => setView("selection")}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
          <QuizManagement />
        </div>
      ) : (
        <div>
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50">
            <h2 className="text-xl font-bold">Student Dashboard</h2>
            <button
              onClick={() => setView("selection")}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
          <StudentQuizzes studentId={studentId} />
        </div>
      )}
    </div>
  );
};

export default QuizDemo;
