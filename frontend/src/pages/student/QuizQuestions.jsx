import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/config/Api";
import { Clock, AlertCircle } from "lucide-react";

const QuizQuestions = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { user } = useAuth();

  const [quizData, setQuizData] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Load quiz from API
  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  // Quiz timer
  useEffect(() => {
    if (!quizData || showResult || submitting) return;

    const durationMs = (quizData.duration || 30) * 60 * 1000;
    const endTime = Date.now() + durationMs;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, showResult, submitting]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get student ID from user profile
      const studentRes = await api.get(`/api/students`);
      const currentStudent = studentRes.data.data?.students?.find(
        (s) => s.user?._id === user?._id
      );

      if (!currentStudent) {
        setError("Student profile not found");
        toast.error("Student profile not found");
        return;
      }

      setStudentId(currentStudent._id);

      // Get quiz from API
      const quizRes = await api.get(`/api/assessments/${quizId}`);
      const quiz = quizRes.data.data;

      if (!quiz) {
        setError("Quiz not found");
        toast.error("Quiz not found");
        return;
      }

      if (quiz.type !== "quiz") {
        setError("This is not a quiz");
        toast.error("This is not a quiz");
        return;
      }

      if (!quiz.questions || quiz.questions.length === 0) {
        setError("Quiz has no questions");
        toast.error("Quiz has no questions");
        return;
      }

      setQuizData(quiz);

      // Initialize selected answers object
      const answers = {};
      quiz.questions.forEach((q) => {
        answers[q._id] = null;
      });
      setSelectedAnswers(answers);
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz");
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Prepare answers in correct format
      const answers = quizData.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id] ?? -1,
      }));

      const response = await api.post(`/api/assessments/${quizId}/submit`, {
        studentId,
        answers,
      });

      toast.success("Quiz submitted successfully!");
      setShowResult(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      const message =
        err.response?.data?.message || "Failed to submit quiz";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q._id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const progressPercentage = quizData
    ? ((currentQuestion + 1) / quizData.questions.length) * 100
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">{error || "Quiz not found"}</p>
          <button
            onClick={() => navigate("/student-dashboard/quizzes")}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);
    const passed = percentage >= 50;

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed ? "bg-green-100" : "bg-amber-100"
            }`}
          >
            <span className={`text-3xl ${passed ? "text-green-600" : "text-amber-600"}`}>
              {passed ? "✓" : "!"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            {passed ? "Great Job! 🎉" : "Quiz Completed"}
          </h2>
          <p className="text-lg text-slate-700 mb-2">Your Score:</p>
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {score} / {quizData.questions.length}
          </p>
          <p className="text-lg font-semibold text-slate-600 mb-6">
            {percentage}%
          </p>
          <button
            onClick={() => navigate("/student-dashboard/quizzes")}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition w-full"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/student-dashboard/quizzes")}
          className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Header Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {quizData.title}
              </h2>
              <p className="text-sm text-slate-600">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 300
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(currentQ._id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition font-medium
                  ${
                    selectedAnswers[currentQ._id] === index
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-300 bg-white hover:border-slate-400 text-slate-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQ._id] === index
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedAnswers[currentQ._id] === index && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                currentQuestion === 0
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "bg-slate-200 text-slate-800 hover:bg-slate-300"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-white ${
                submitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting
                ? "Submitting..."
                : currentQuestion === quizData.questions.length - 1
                  ? "Submit Quiz"
                  : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestions;