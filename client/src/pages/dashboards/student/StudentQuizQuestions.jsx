import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const QuizQuestions = () => {
  const navigate = useNavigate();

  const quizData = [
    {
      question: "What is React?",
      options: [
        "A database",
        "A JavaScript library",
        "A backend framework",
        "A programming language",
      ],
      correct: 1,
    },
    {
      question: "What is useState?",
      options: [
        "A lifecycle method",
        "A React hook",
        "A database",
        "A CSS property",
      ],
      correct: 1,
    },
    {
      question: "Which company developed React?",
      options: ["Google", "Facebook", "Microsoft", "Amazon"],
      correct: 1,
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(quizData.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (index) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestion] = index;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
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
    let score = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correct) {
        score++;
      }
    });
    return score;
  };

  const progressPercentage =
    ((currentQuestion + 1) / quizData.length) * 100;

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
            {calculateScore()} / {quizData.length}
          </p>
          <button
            onClick={() => navigate(-1)}
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
          onClick={() => navigate(-1)}
          className="mb-4 text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back
        </button>

        {/* Header Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Question {currentQuestion + 1} of {quizData.length}
          </h2>

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
            {quizData[currentQuestion].question}
          </h3>

          <div className="space-y-4">
            {quizData[currentQuestion].options.map((option, index) => (
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
              {currentQuestion === quizData.length - 1
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