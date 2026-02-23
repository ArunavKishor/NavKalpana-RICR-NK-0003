// Quiz Service - Handle localStorage and quiz logic

export const quizService = {
  // Generate unique ID
  generateId: () => `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  // Save quiz to localStorage
  saveQuiz: (quiz) => {
    try {
      const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
      const newQuiz = {
        id: quizService.generateId(),
        ...quiz,
        createdAt: new Date().toISOString(),
        status: "assigned",
      };
      quizzes.push(newQuiz);
      localStorage.setItem("quizzes", JSON.stringify(quizzes));
      console.log("Quiz saved successfully with ID:", newQuiz.id);
      return newQuiz;
    } catch (error) {
      console.error("Error saving quiz to localStorage:", error);
      throw error;
    }
  },

  // Get all quizzes
  getAllQuizzes: () => {
    try {
      const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
      console.log("Retrieved quizzes from localStorage:", quizzes);
      return quizzes;
    } catch (error) {
      console.error("Error retrieving quizzes from localStorage:", error);
      return [];
    }
  },

  // Get quiz by ID
  getQuizById: (id) => {
    const quizzes = quizService.getAllQuizzes();
    return quizzes.find((q) => q.id === id);
  },

  // Shuffle options for student (create shuffled version with indices)
  shuffleQuizForStudent: (quiz, studentId) => {
    // Use studentId as seed for consistent shuffle per student
    const seed = parseInt(studentId.replace(/\D/g, "") || "0") % 1000;
    
    return {
      ...quiz,
      questions: quiz.questions.map((question, qIndex) => {
        // Create array of indices
        const indices = [0, 1, 2, 3];
        
        // Shuffle using seeded random (deterministic per student)
        const shuffledIndices = indices.sort(() => {
          const hashCode = (seed + qIndex * 7 + indices[0] * 13) % 997;
          return hashCode > 500 ? 1 : -1;
        });

        // Map old indices to new positions
        const correctAnswerNewPos = shuffledIndices.indexOf(question.correctAnswer);

        // Reorder options
        const shuffledOptions = shuffledIndices.map(
          (oldIndex) => question.options[oldIndex]
        );

        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: correctAnswerNewPos,
          originalCorrectAnswer: question.correctAnswer, // Keep original for validation
        };
      }),
    };
  },

  // Save quiz attempt
  saveQuizAttempt: (quizId, studentId, answers, score) => {
    const attempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
    attempts.push({
      id: quizService.generateId(),
      quizId,
      studentId,
      answers,
      score,
      attemptedAt: new Date().toISOString(),
    });
    localStorage.setItem("quizAttempts", JSON.stringify(attempts));
  },

  // Get student attempts for a quiz
  getStudentAttempts: (quizId, studentId) => {
    const attempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
    return attempts.filter((a) => a.quizId === quizId && a.studentId === studentId);
  },

  // Calculate quiz score
  calculateScore: (quiz, answers) => {
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    return {
      correctCount,
      totalCount: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
    };
  },

  // Delete quiz
  deleteQuiz: (quizId) => {
    const quizzes = quizService.getAllQuizzes();
    const filtered = quizzes.filter((q) => q.id !== quizId);
    localStorage.setItem("quizzes", JSON.stringify(filtered));
  },

  // Clear all quizzes (for testing)
  clearAllQuizzes: () => {
    localStorage.removeItem("quizzes");
    localStorage.removeItem("quizAttempts");
  },
};
