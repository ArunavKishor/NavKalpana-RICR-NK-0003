import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Send, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { quizService } from "@/utils/quizService";
import QuizResult from "@/components/student/QuizResult";

const QuizAttempt = ({ quizId, studentId, onComplete, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQuiz = () => {
    try {
      const quizData = quizService.getQuizById(quizId);
      if (!quizData) {
        toast.error("Quiz not found");
        onBack();
        return;
      }

      // Shuffle options for this student (deterministic per student)
      const shuffledQuiz = quizService.shuffleQuizForStudent(quizData, studentId);
      setQuiz(shuffledQuiz);
      setAnswers({});
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quiz");
      onBack();
    }
  };

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <QuizResult
        quiz={quiz}
        result={result}
        answers={answers}
        onClose={() => {
          onComplete?.();
          onBack?.();
        }}
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = answers[currentQuestionIndex] !== undefined;

  const handleSelectAnswer = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (!isAnswered) {
      toast.error("Please select an answer before proceeding");
      return;
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    // Calculate score
    const calculatedResult = quizService.calculateScore(quiz, answers);

    // Save attempt
    quizService.saveQuizAttempt(quizId, studentId, answers, calculatedResult);

    setResult(calculatedResult);
    setSubmitted(true);
    toast.success("Quiz submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
              <p className="text-slate-600 text-sm">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition"
            >
              ← Back
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-300 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          {/* Question Number Badge */}
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-4">
            Question {currentQuestionIndex + 1}
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() => handleSelectAnswer(optionIndex)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  answers[currentQuestionIndex] === optionIndex
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-300 hover:border-orange-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      answers[currentQuestionIndex] === optionIndex
                        ? "border-orange-500 bg-orange-500"
                        : "border-slate-300"
                    }`}
                  >
                    {answers[currentQuestionIndex] === optionIndex && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {String.fromCharCode(65 + optionIndex)}.
                    </p>
                    <p className="text-slate-700">{option}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Answer Status */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {!isAnswered && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ You haven't selected an answer for this question
              </p>
            )}
            {isAnswered && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                ✅ Answer selected
              </p>
            )}
          </div>
        </div>

        {/* Navigation & Submission */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              currentQuestionIndex === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-200 hover:bg-slate-300 text-slate-900"
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                !isAnswered
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered || Object.keys(answers).length !== quiz.questions.length}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                !isAnswered || Object.keys(answers).length !== quiz.questions.length
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              <Send size={20} />
              Submit Quiz
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            <strong>Answered:</strong> {Object.keys(answers).length} / {quiz.questions.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
