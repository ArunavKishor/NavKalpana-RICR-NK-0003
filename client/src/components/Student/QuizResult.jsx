import React from "react";
import { Download, Share2, Home } from "lucide-react";
import toast from "react-hot-toast";

const QuizResult = ({ quiz, result, answers, onClose }) => {
  const getFeedback = (percentage) => {
    if (percentage === 100) return { message: "Perfect Score! 🎉", color: "text-green-600" };
    if (percentage >= 80) return { message: "Great Job! 👏", color: "text-green-600" };
    if (percentage >= 60) return { message: "Good Effort 😊", color: "text-blue-600" };
    if (percentage >= 40) return { message: "Keep Practicing 💪", color: "text-orange-600" };
    return { message: "Try Again 📚", color: "text-red-600" };
  };

  const feedback = getFeedback(result.percentage);

  const handleDownload = () => {
    const reportContent = `
Quiz Report: ${quiz.title}
Score: ${result.correctCount}/${result.totalCount} (${result.percentage}%)
Date: ${new Date().toLocaleString()}

Questions Review:
${quiz.questions
  .map((q, idx) => {
    const isCorrect = answers[idx] === q.correctAnswer;
    return `
Question ${idx + 1}: ${q.question}
Your Answer: ${q.options[answers[idx]]}
Correct Answer: ${q.options[q.correctAnswer]}
Status: ${isCorrect ? "✓ Correct" : "✗ Incorrect"}
`;
  })
  .join("\n")}
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent));
    element.setAttribute("download", `${quiz.title}_report.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Report downloaded!");
  };

  const handleShare = () => {
    const shareText = `I scored ${result.percentage}% on "${quiz.title}" quiz! Can you beat my score?`;
    if (navigator.share) {
      navigator.share({
        title: "Quiz Result",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Score copied to clipboard!");
    }
  };

  // Calculate color based on score
  const getScoreColor = () => {
    if (result.percentage >= 80) return "text-green-600";
    if (result.percentage >= 60) return "text-blue-600";
    if (result.percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-6">
          {/* Feedback */}
          <div className="text-center mb-8">
            <p className={`text-5xl mb-4 ${feedback.color}`}>{feedback.message}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{quiz.title}</h1>
            <p className="text-slate-600">Quiz Completed Successfully</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48 rounded-full border-8 border-slate-200 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className={`text-5xl font-bold ${getScoreColor()}`}>
                  {result.percentage}%
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  {result.correctCount}/{result.totalCount} Correct
                </p>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{result.correctCount}</p>
              <p className="text-sm text-green-700 font-medium">Correct</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {result.totalCount - result.correctCount}
              </p>
              <p className="text-sm text-red-700 font-medium">Incorrect</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{result.totalCount}</p>
              <p className="text-sm text-blue-700 font-medium">Total</p>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-700">Overall Performance</p>
              <p className="text-sm font-semibold text-slate-900">{result.percentage}%</p>
            </div>
            <div className="w-full bg-slate-300 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  result.percentage >= 80
                    ? "bg-green-500"
                    : result.percentage >= 60
                    ? "bg-blue-500"
                    : result.percentage >= 40
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-center text-sm text-slate-600 mb-8 pt-6 border-t border-slate-200">
            <p>
              Completed on {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Answer Review</h2>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const isCorrect = answers[index] === question.correctAnswer;
              return (
                <div
                  key={index}
                  className={`p-4 border-l-4 rounded-lg ${
                    isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-slate-900">
                      Q{index + 1}: {question.question.substring(0, 60)}...
                    </p>
                    {isCorrect ? (
                      <span className="text-green-600 font-semibold">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Incorrect</span>
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="text-slate-700">
                      <span className="font-medium">Your Answer:</span>{" "}
                      {question.options[answers[index]]}
                    </p>
                    {!isCorrect && (
                      <p className="text-slate-700">
                        <span className="font-medium">Correct Answer:</span>{" "}
                        <span className="text-green-600 font-semibold">
                          {question.options[question.correctAnswer]}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleDownload}
            className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Download size={20} />
            Download Report
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Share2 size={20} />
            Share Score
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Home size={20} />
            Back to Quizzes
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Tips for Next Time:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Read questions carefully before answering</li>
            <li>Review your answers before submitting</li>
            <li>Try to improve your weak areas</li>
            <li>Retake the quiz to practice more</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
