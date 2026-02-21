import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { quizService } from "@/utils/quizService";

const CreateQuiz = ({ onQuizCreated, onCancel }) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: 0,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: Math.max(...questions.map((q) => q.id), -1) + 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (id) => {
    if (questions.length === 1) {
      toast.error("Quiz must have at least 1 question");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Update question text
  const updateQuestionText = (id, text) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, question: text } : q))
    );
  };

  // Update option
  const updateOption = (id, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Update correct answer
  const updateCorrectAnswer = (id, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, correctAnswer: value } : q))
    );
  };

  // Validate quiz
  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`);
        return false;
      }

      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Question ${i + 1}: All 4 options are required`);
          return false;
        }
      }

      if (!q.correctAnswer) {
        toast.error(`Question ${i + 1}: Please select the correct answer`);
        return false;
      }
    }

    return true;
  };

  // Save quiz
  const handleSaveQuiz = async () => {
    if (!validateQuiz()) return;

    setLoading(true);
    try {
      // Convert correctAnswer text to index
      const formattedQuestions = questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.options.indexOf(q.correctAnswer),
      }));

      const quiz = {
        title: quizTitle.trim(),
        assignedBy: "Teacher", // Get from auth context if available
        questions: formattedQuestions,
      };

      const savedQuiz = quizService.saveQuiz(quiz);
      toast.success("Quiz created successfully!");
      onQuizCreated?.(savedQuiz);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Quiz</h1>
          <p className="text-slate-600">Create a new quiz with questions and options</p>
        </div>

        {/* Quiz Title */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Quiz Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="e.g., React Basics Quiz"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Question {index + 1}
                </h2>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Field 1: Question Text */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestionText(question.id, e.target.value)}
                  placeholder="Enter your question here..."
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Fields 2-5: Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {["A", "B", "C", "D"].map((optionLabel, optionIndex) => (
                  <div key={optionIndex}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Option {optionLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={question.options[optionIndex]}
                      onChange={(e) =>
                        updateOption(question.id, optionIndex, e.target.value)
                      }
                      placeholder={`Enter option ${optionLabel}...`}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                ))}
              </div>

              {/* Field 6: Correct Answer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                        question.correctAnswer === option
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-300 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        value={option}
                        checked={question.correctAnswer === option}
                        onChange={(e) =>
                          updateCorrectAnswer(question.id, e.target.value)
                        }
                        className="mr-2 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {["A", "B", "C", "D"][optionIndex]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question Stats */}
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Question {index + 1} of {questions.length}
              </div>
            </div>
          ))}
        </div>

        {/* Field 7: Add More Questions */}
        <button
          onClick={addQuestion}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Plus size={20} />
          Add Another Question
        </button>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 mb-6">
          <button
            onClick={handleSaveQuiz}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Save size={20} />
            {loading ? "Saving..." : "Save & Publish Quiz"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            <strong>Summary:</strong> {questions.length} question{questions.length !== 1 ? "s" : ""} • Quiz Title: {quizTitle || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
