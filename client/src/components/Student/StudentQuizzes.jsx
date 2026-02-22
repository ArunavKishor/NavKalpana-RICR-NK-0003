import React, { useState, useEffect } from "react";
import { Play, Clock, ListIcon } from "lucide-react";
import { quizService } from "@/utils/quizService";
import QuizAttempt from "@/components/student/QuizAttempt";

const StudentQuizzes = ({ studentId = "student_1" }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState(new Set());

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuizzes = () => {
    try {
      const allQuizzes = quizService.getAllQuizzes();
      setQuizzes(allQuizzes);

      // Load attempted quizzes
      const attempted = new Set();
      allQuizzes.forEach((quiz) => {
        const attempts = quizService.getStudentAttempts(quiz.id, studentId);
        if (attempts.length > 0) {
          attempted.add(quiz.id);
        }
      });
      setAttemptedQuizzes(attempted);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId);
  };

  const handleQuizComplete = () => {
    // Reload to show updated attempt status
    loadQuizzes();
    setSelectedQuizId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (selectedQuizId) {
    return (
      <QuizAttempt
        quizId={selectedQuizId}
        studentId={studentId}
        onComplete={handleQuizComplete}
        onBack={() => setSelectedQuizId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Available Quizzes</h1>
          <p className="text-slate-600">Take quizzes assigned by your teacher</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Assigned</p>
                <p className="text-3xl font-bold text-slate-900">{quizzes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Attempted</p>
                <p className="text-3xl font-bold text-green-600">{attemptedQuizzes.size}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Remaining</p>
                <p className="text-3xl font-bold text-orange-600">
                  {quizzes.length - attemptedQuizzes.size}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes List */}
        <div>
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Quizzes Available</h3>
              <p className="text-slate-600">Your teacher hasn't assigned any quizzes yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {quizzes.map((quiz) => {
                const isAttempted = attemptedQuizzes.has(quiz.id);
                return (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Assigned by {quiz.assignedBy}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isAttempted
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isAttempted ? "Attempted" : "Not Attempted"}
                      </span>
                    </div>

                    {/* Quiz Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <ListIcon size={18} className="text-orange-500" />
                        <div>
                          <p className="text-slate-600 text-xs">Questions</p>
                          <p className="text-slate-900 font-semibold">
                            {quiz.questions.length}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={18} className="text-blue-500" />
                        <div>
                          <p className="text-slate-600 text-xs">Created</p>
                          <p className="text-slate-900 font-semibold text-xs">
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isAttempted && (
                        <div className="col-span-2 md:col-span-2 text-sm">
                          <p className="text-slate-600 text-xs">Status</p>
                          <p className="text-green-600 font-semibold flex items-center gap-1">
                            ✅ Completed
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Question Preview */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold mb-2">
                        FIRST QUESTION PREVIEW
                      </p>
                      <p className="text-sm text-slate-900">
                        {quiz.questions[0]?.question.substring(0, 100)}...
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      disabled={false}
                      className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        isAttempted
                          ? "bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:shadow-lg"
                      }`}
                    >
                      <Play size={20} />
                      {isAttempted ? "Quiz Completed" : "Start Quiz"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;
