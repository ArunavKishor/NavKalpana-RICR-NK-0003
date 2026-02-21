# Teacher Quiz Assignment System - Documentation

## Overview

A complete quiz management system built with React + Tailwind CSS that allows teachers to create quizzes and students to take them with randomized options.

## Features

### Teacher Features
- ✅ **Create Quizzes**: Add quiz title and multiple questions dynamically
- ✅ **Question Builder**: 7-field form per question (question, 4 options, correct answer, add more)
- ✅ **Quiz Management**: List, edit, delete, and publish quizzes
- ✅ **Automatic Assignment**: Quizzes are instantly assigned to all students
- ✅ **Quiz Stats**: View total quizzes, questions, and assignment status

### Student Features
- ✅ **View Quizzes**: See all assigned quizzes with status
- ✅ **Take Quiz**: Answer questions one-by-one with progress bar
- ✅ **Randomized Options**: Options shuffle randomly per student (deterministic)
- ✅ **Instant Scoring**: Automatic score calculation
- ✅ **Answer Review**: See correct/incorrect answers with feedback
- ✅ **Download Report**: Export quiz results as text file
- ✅ **Share Score**: Share results on social media or copy to clipboard

## File Structure

```
client/src/
├── components/
│   ├── teacher/
│   │   └── CreateQuiz.jsx           # Quiz creation form with 7-field structure
│   └── student/
│       ├── StudentQuizzes.jsx       # List of assigned quizzes
│       ├── QuizAttempt.jsx          # Quiz taking interface with progress bar
│       └── QuizResult.jsx           # Score and review screen
├── pages/
│   ├── teacher/
│   │   └── QuizManagement.jsx       # Teacher dashboard for quiz management
│   └── QuizDemo.jsx                 # Demo page showing both views
└── utils/
    └── quizService.js              # Quiz utility functions & localStorage
```

## Data Structure

### Quiz Object
```javascript
{
  id: "quiz_1708432891234_abc123def456",
  title: "React Basics",
  assignedBy: "Teacher Name",
  questions: [
    {
      question: "What is React?",
      options: ["Library", "Framework", "Database", "Language"],
      correctAnswer: 0  // Index of correct option
    }
  ],
  createdAt: "2025-02-21T10:30:00.000Z",
  status: "assigned"
}
```

### Quiz Attempt (Stored)
```javascript
{
  id: "attempt_1708432891234_xyz789",
  quizId: "quiz_1708432891234_abc123def456",
  studentId: "student_1",
  answers: {
    0: 0,  // Question index: Selected option index
    1: 2,
    2: 1
  },
  score: {
    correctCount: 2,
    totalCount: 3,
    percentage: 66
  },
  attemptedAt: "2025-02-21T10:35:00.000Z"
}
```

## Component APIs

### CreateQuiz Component
```javascript
<CreateQuiz
  onQuizCreated={(quiz) => console.log(quiz)}
  onCancel={() => console.log("cancelled")}
/>
```

**Props:**
- `onQuizCreated`: Callback when quiz is saved
- `onCancel`: Callback when user cancels creation

### StudentQuizzes Component
```javascript
<StudentQuizzes studentId="student_1" />
```

**Props:**
- `studentId`: Unique identifier for the student

### QuizAttempt Component
```javascript
<QuizAttempt
  quizId="quiz_123"
  studentId="student_1"
  onComplete={() => console.log("done")}
  onBack={() => console.log("going back")}
/>
```

**Props:**
- `quizId`: ID of quiz to attempt
- `studentId`: Student taking the quiz
- `onComplete`: Callback on quiz submission
- `onBack`: Callback to go back

### QuizResult Component
```javascript
<QuizResult
  quiz={quizObject}
  result={scoreObject}
  answers={answersObject}
  onClose={() => console.log("closed")}
/>
```

**Props:**
- `quiz`: Quiz object with questions
- `result`: Score calculation result
- `answers`: Student's answers
- `onClose`: Callback to close result

## Quiz Service API

### Key Methods

#### `quizService.saveQuiz(quiz)`
Save a new quiz to localStorage
```javascript
const newQuiz = quizService.saveQuiz({
  title: "React Basics",
  assignedBy: "Teacher Name",
  questions: [...]
});
```

#### `quizService.getAllQuizzes()`
Get all quizzes
```javascript
const allQuizzes = quizService.getAllQuizzes();
```

#### `quizService.getQuizById(quizId)`
Get specific quiz
```javascript
const quiz = quizService.getQuizById("quiz_123");
```

#### `quizService.shuffleQuizForStudent(quiz, studentId)`
Create shuffled copy per student
```javascript
const shuffledQuiz = quizService.shuffleQuizForStudent(quiz, "student_1");
```

#### `quizService.calculateScore(quiz, answers)`
Calculate score from answers
```javascript
const result = quizService.calculateScore(quiz, {0: 0, 1: 1, 2: 2});
// Returns: { correctCount: 2, totalCount: 3, percentage: 66 }
```

#### `quizService.saveQuizAttempt(quizId, studentId, answers, score)`
Save attempt to localStorage
```javascript
quizService.saveQuizAttempt("quiz_123", "student_1", {...}, {...});
```

#### `quizService.getStudentAttempts(quizId, studentId)`
Get student's attempts for a quiz
```javascript
const attempts = quizService.getStudentAttempts("quiz_123", "student_1");
```

#### `quizService.deleteQuiz(quizId)`
Delete a quiz
```javascript
quizService.deleteQuiz("quiz_123");
```

#### `quizService.clearAllQuizzes()`
Clear all data (for testing)
```javascript
quizService.clearAllQuizzes();
```

## Usage Guide

### For Teachers

1. **Create Quiz**
   - Click "Create New Quiz" button
   - Enter quiz title
   - For each question:
     - Enter question text
     - Enter 4 options (A, B, C, D)
     - Select correct answer (radio button)
     - Click "Add Another Question" to add more
   - Click "Save & Publish Quiz"

2. **Manage Quizzes**
   - View all created quizzes
   - See quiz stats (questions count, creation date)
   - Delete quizzes if needed
   - Preview quiz content

### For Students

1. **View Quizzes**
   - See all assigned quizzes
   - View attempted status
   - See quiz details and preview

2. **Take Quiz**
   - Click "Start Quiz"
   - Select answers using radio buttons
   - Use Previous/Next buttons to navigate
   - Progress bar shows completion
   - Click "Submit Quiz" on last question

3. **Review Results**
   - See score breakdown
   - View correct vs incorrect answers
   - Download report as text file
   - Share score on social media
   - Return to quiz list

## Randomization Logic

**Deterministic Shuffling**: Options are shuffled differently for each student but consistently for the same student. This is achieved using:
- Student ID as seed
- Deterministic shuffle algorithm
- Consistent mapping of correct answer indices

**Implementation**:
```javascript
const seed = parseInt(studentId.replace(/\D/g, "") || "0") % 1000;
// Uses seed to shuffle indices consistently per student
```

## LocalStorage Keys

- `quizzes`: Array of all quiz objects
- `quizAttempts`: Array of student attempts

## UI Features

### Design
- Modern gradient backgrounds
- Card-based layout
- Responsive grid system
- Smooth transitions
- Accessible color scheme

### Components
- Progress bars with gradient
- Radio button selections
- Toast notifications (react-hot-toast)
- Loading states
- Error handling
- Success/failure feedback

## Integration with Existing System

### Adding to TeacherDashboardLayout
```javascript
import QuizManagement from '@/pages/teacher/QuizManagement';

const TeacherDashboardLayout = () => {
  return (
    <div>
      {/* Existing sidebar */}
      {/* Route to QuizManagement */}
      <Route path="quizzes" element={<QuizManagement />} />
    </div>
  );
};
```

### Adding to StudentDashboardLayout
```javascript
import StudentQuizzes from '@/components/student/StudentQuizzes';

const StudentDashboardLayout = () => {
  return (
    <div>
      {/* Existing sidebar */}
      {/* Route to StudentQuizzes */}
      <Route path="quizzes" element={<StudentQuizzes />} />
    </div>
  );
};
```

## Testing the System

### Quick Test Flow

1. **Create Test Quiz**
   - Click "Create New Quiz"
   - Add 3-5 questions with different options
   - Save the quiz

2. **View as Student**
   - Navigate to StudentQuizzes
   - Click "Start Quiz" on the created quiz
   - Answer all questions
   - Submit and review

3. **Test Randomization**
   - Open quiz with different student IDs
   - Verify options are shuffled differently per student

### Demo Page
Access `QuizDemo.jsx` to see both teacher and student views in one place

## Bonus Features Implemented

- ✅ Quiz creation date display
- ✅ Assigned quizzes count in student dashboard
- ✅ Prevent retaking same quiz (status shown as "Completed")
- ✅ Download report functionality
- ✅ Share score functionality
- ✅ Answer review with correct/incorrect marking
- ✅ Performance feedback messages
- ✅ Deterministic shuffle per student

## Dependencies Used

- `react-icons`: Icons (FaBook, FaClipboardList, etc.)
- `lucide-react`: Modern icons (Plus, Trash2, Send, etc.)
- `react-hot-toast`: Toast notifications
- `react-router-dom`: Routing and navigation
- `tailwindcss`: Styling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- LocalStorage suitable for demo/testing
- For production, replace with API calls to backend
- Shuffle algorithm is O(n) - efficient
- No unnecessary re-renders with memoization

## Future Enhancements

1. Backend API integration for persistence
2. Image/video support in questions
3. Timer per question or quiz
4. Difficulty levels
5. Question bank with categories
6. Batch student assignment
7. Analytics dashboard for teachers
8. Mobile app version
9. Dark mode support
10. Multi-language support
