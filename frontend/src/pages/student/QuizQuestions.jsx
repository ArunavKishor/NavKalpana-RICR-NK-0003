import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizService } from "@/utils/quizService";
import toast from "react-hot-toast";

const QuizQuestions = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = () => {
    try {
      setLoading(true);
      setError(null);
      
      const quiz = quizService.getQuizById(quizId);
      if (!quiz) {
        setError("Quiz not found");
        toast.error("Quiz not found");
        return;
      }

      if (!quiz.questions || quiz.questions.length === 0) {
        setError("Quiz has no questions");
        toast.error("Quiz has no questions");
        return;
      }

      setQuizData(quiz);
      setSelectedAnswers(Array(quiz.questions.length).fill(null));
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz");
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestion] = index;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData.questions[index].correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const progressPercentage = quizData
    ? ((currentQuestion + 1) / quizData.questions.length) * 100
    : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
          <p className="text-slate-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
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
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Quiz Completed 🎉
          </h2>
          <p className="text-lg text-slate-700 mb-2">
            Your Score:
          </p>
          <p className="text-3xl font-bold text-orange-500 mb-6">
            {calculateScore()} / {quizData.questions.length}
          </p>
          <p className="text-sm text-slate-600 mb-6">
            Percentage: {Math.round((calculateScore() / quizData.questions.length) * 100)}%
          </p>
          <button
            onClick={() => navigate("/student-dashboard/quizzes")}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/student-dashboard/quizzes")}
          className="mb-4 text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back
        </button>

        {/* Header Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {quizData.title}
          </h2>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </h3>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-6">
            {quizData.questions[currentQuestion].question}
          </h3>

          <div className="space-y-4">
            {quizData.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`w-full text-left p-4 rounded-lg border transition
                  ${
                    selectedAnswers[currentQuestion] === index
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-5 py-2 rounded-lg ${
                currentQuestion === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              {currentQuestion === quizData.questions.length - 1
                ? "Submit"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestions;