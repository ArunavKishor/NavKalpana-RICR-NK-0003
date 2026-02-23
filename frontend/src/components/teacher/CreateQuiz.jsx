import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/config/Api";

const CreateQuiz = ({ onQuizCreated, onCancel, editingQuiz }) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [batch, setBatch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState(30);
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [status, setStatus] = useState("published");
  const [batches, setBatches] = useState([]);
  const [questions, setQuestions] = useState([
    {
      id: 0,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (editingQuiz) {
      setQuizTitle(editingQuiz.title || "");
      setQuizDescription(editingQuiz.description || "");
      setBatch(editingQuiz.batch?._id || editingQuiz.batch || "");
      setDueDate(
        editingQuiz.dueDate
          ? new Date(editingQuiz.dueDate).toISOString().split("T")[0]
          : "",
      );
      setTotalMarks(editingQuiz.totalMarks || 100);
      setDuration(editingQuiz.duration || 30);
      setAttemptLimit(editingQuiz.attemptLimit || 1);
      setStatus(editingQuiz.status || "published");
      if (editingQuiz.questions?.length) {
        setQuestions(
          editingQuiz.questions.map((q, idx) => ({
            id: idx,
            question: q.question || "",
            options: q.options || ["", "", "", ""],
            correctAnswer: q.options?.[q.correctAnswer] || "",
            explanation: q.explanation || "",
          })),
        );
      }
    }
  }, [editingQuiz]);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/batches");
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Math.max(...questions.map((q) => q.id), -1) + 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length === 1) {
      toast.error("Quiz must have at least 1 question");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id, text) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, question: text } : q)),
    );
  };

  const updateOption = (id, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const updateCorrectAnswer = (id, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, correctAnswer: value } : q)),
    );
  };

  const updateExplanation = (id, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, explanation: value } : q)),
    );
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return false;
    }
    if (!batch) {
      toast.error("Please select a batch");
      return false;
    }
    if (!dueDate) {
      toast.error("Please set a due date");
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

  const handleSaveQuiz = async () => {
    if (!validateQuiz()) return;

    setLoading(true);
    try {
      const formattedQuestions = questions.map((q) => {
        const correctIndex = q.options.indexOf(q.correctAnswer);
        if (correctIndex === -1) {
          throw new Error(
            `Question "${q.question}": Correct answer not found in options`,
          );
        }
        return {
          question: q.question.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctAnswer: correctIndex,
          explanation: q.explanation?.trim() || "",
        };
      });

      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        type: "quiz",
        batch,
        dueDate,
        totalMarks: Number(totalMarks),
        duration: Number(duration),
        attemptLimit: Number(attemptLimit),
        status,
        questions: formattedQuestions,
      };

      if (editingQuiz) {
        await api.put(`/api/assessments/${editingQuiz._id}`, quizData);
      } else {
        await api.post("/api/assessments", quizData);
      }

      if (onQuizCreated) onQuizCreated();
    } catch (err) {
      console.error("Error saving quiz:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save quiz",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {editingQuiz ? "Edit Quiz" : "Create Quiz"}
            </h1>
            <p className="text-slate-600">
              {editingQuiz
                ? "Update quiz details and questions"
                : "Create a new quiz with questions and options"}
            </p>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200 space-y-4">
          <div>
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

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              placeholder="Brief description of the quiz..."
              rows="2"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Batch <span className="text-red-500">*</span>
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 bg-white"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Duration (mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="300"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Attempt Limit
              </label>
              <input
                type="number"
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
                min="1"
                max="10"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
            >
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

              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    updateQuestionText(question.id, e.target.value)
                  }
                  placeholder="Enter your question here..."
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {["A", "B", "C", "D"].map((optionLabel, optionIndex) => (
                  <div key={optionIndex}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Option {optionLabel}{" "}
                      <span className="text-red-500">*</span>
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                        question.correctAnswer === option && option !== ""
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-300 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        value={option}
                        checked={
                          question.correctAnswer === option && option !== ""
                        }
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

              <div className="mb-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Explanation <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) =>
                    updateExplanation(question.id, e.target.value)
                  }
                  placeholder="Explain why this answer is correct..."
                  rows="2"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Question {index + 1} of {questions.length}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Plus size={20} />
          Add Another Question
        </button>

        <div className="flex gap-4 mt-8 mb-6">
          <button
            onClick={handleSaveQuiz}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Save size={20} />
            {loading
              ? "Saving..."
              : editingQuiz
                ? "Update Quiz"
                : "Save & Publish Quiz"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            <strong>Summary:</strong> {questions.length} question
            {questions.length !== 1 ? "s" : ""} • Duration: {duration} min •
            Attempts: {attemptLimit} • Quiz Title: {quizTitle || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
