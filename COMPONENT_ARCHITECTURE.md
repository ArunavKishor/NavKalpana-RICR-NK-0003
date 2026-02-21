# Quiz System - Component Architecture & Visual Layout

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Quiz System Root                      │
└─────────────────────────────────────────────────────────┘
            │                              │
            ▼                              ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Teacher View    │        │  Student View    │
    └──────────────────┘        └──────────────────┘
            │                              │
       ┌────┴────┐                    ┌───┴───┐
       ▼         ▼                    ▼       ▼
   ┌────────┐  ┌──────┐          ┌────────┐ ┌──────────┐
   │ Create │  │Manage│          │ Quizzes│ │ Attempt  │
   │ Quiz   │  │Quizzes          │ List   │ │ Quiz     │
   └────────┘  └──────┘          └────────┘ └──────────┘
       │         │                    │         │
       ▼         ▼                    ▼         ▼
   ┌────────────────────┐        ┌──────────────────┐
   │  quizService.js    │◄─────►│ localStorage     │
   │  (Business Logic)  │        │ (Data Storage)   │
   └────────────────────┘        └──────────────────┘
```

## 📱 Component Layout

### 1️⃣ CreateQuiz Component

```
┌─────────────────────────────────────────────┐
│           Create Quiz Header                 │
│  "Create Quiz" | "Back" | "Cancel"          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Quiz Title Input                            │
│ [                                           ] │
│                                              │
│ Question 1                              [X] │ ├─ Remove
│ ┌─────────────────────────────────────────┐ │
│ │ Question Text                           │ │ ├─ Field 1
│ │ [                                       ] │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────┬─────────────────┐      │
│ │ Option A [    ] │ Option B [    ]  │      │ ├─ Fields 2-3
│ │ Option C [    ] │ Option D [    ]  │      │ ├─ Fields 4-5
│ └─────────────────┴─────────────────┘      │
│                                              │
│ Correct Answer:                              │
│ ◯ A   ◯ B   ◯ C   ◯ D                       │ ├─ Field 6
│                                              │
│ [+ Add Another Question]                    │ ├─ Field 7
└─────────────────────────────────────────────┘
│ [Save & Publish] [Cancel]                   │
```

### 2️⃣ QuizManagement Component

```
┌────────────────────────────────┐
│ Quiz Management Dashboard      │
│ "Create New Quiz" ►            │
└────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Total: 5 │Active: 4 │ Ques: 42 │
└──────────┴──────────┴──────────┘

┌────────────────────────────────┐
│ Quiz Title 1                 ✓ │
│ 5 questions • Created: Jan 20  │
│ [Preview] [Delete]             │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Quiz Title 2                 ✓ │
│ 8 questions • Created: Jan 18  │
│ [Preview] [Delete]             │
└────────────────────────────────┘

... more quizzes ...
```

### 3️⃣ StudentQuizzes Component

```
┌────────────────────────────────┐
│ Available Quizzes              │
└────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│Total: 5  │Done: 2   │Left: 3   │
└──────────┴──────────┴──────────┘

┌────────────────────────────────┐
│ React Basics              Done  │
│ Assigned by: Teacher           │
│ 8 Questions • Created: Jan 20  │
│ Q1 Preview: What is React?...  │
│ [Quiz Completed]               │
└────────────────────────────────┘

┌────────────────────────────────┐
│ JavaScript Advanced        New  │
│ Assigned by: Teacher           │
│ 10 Questions • Created: Jan 18 │
│ Q1 Preview: Explain closures..│
│ [► Start Quiz]                 │
└────────────────────────────────┘

... more quizzes ...
```

### 4️⃣ QuizAttempt Component

```
┌────────────────────────────────────┐
│ React Basics              Q 1/5 Back│
│ ████████░░ 50% Progress            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ QUESTION 1                          │
│ What is the primary purpose of...? │
│                                    │
│ ◯ [A] React is a JavaScript library│
│      for building user interfaces  │
│                                    │
│ ◯ [B] React is a CSS framework     │
│                                    │
│ ◯ [C] React is a database system   │
│                                    │
│ ◯ [D] React is a backend framework │
│                                    │
│ ✓ Answer selected                  │
└────────────────────────────────────┘

│ [◄ Prev] [Next ►] (or [Send] if last)     │
│ Answered: 1 / 5                           │
```

### 5️⃣ QuizResult Component

```
┌────────────────────────────────┐
│      Great Job! 👏              │
│      React Basics               │
│      Quiz Completed Successfully│
└────────────────────────────────┘

        ┌─────────────┐
        │   85 %      │  ◄─ Score Circle
        │  17/20      │
        └─────────────┘

┌────────┬────────┬────────┐
│ 17     │ 3      │ 20     │
│Correct │Incorr. │ Total  │
└────────┴────────┴────────┘

Progress Bar: ██████████░░░░░░░░ 85%

┌────────────────────────────────┐
│ ANSWER REVIEW                   │
├────────────────────────────────┤
│ Q1: What is React?       ✓ OK  │
│ Your: Library                  │
│                                │
│ Q2: React uses which... ✗ WRONG│
│ Your: PHP                      │
│ Correct: JavaScript            │
│                                │
│ ... more questions ...         │
└────────────────────────────────┘

[Download Report] [Share] [Back to Quizzes]
```

## 🔄 User Flow Diagram

```
TEACHER FLOW:
─────────────
Start → Quiz Management
        ↓
        Create New Quiz
        ↓
        [Question Form × N]
        ↓
        Save & Publish
        ↓
        Monitor Dashboard
        ↓
        Delete/Edit (if needed)

STUDENT FLOW:
─────────────
Start → Student Quizzes
        ↓
        View Available Quizzes
        ↓
        Click "Start Quiz"
        ↓
        Question Page [1/N]
        ├─ Select Answer
        ├─ Next (or Previous)
        ├─ Continue until last
        ↓
        Submit Quiz
        ↓
        View Results
        ├─ Download Report
        ├─ Share Score
        └─ Back to Quizzes
```

## 🎨 Color Scheme

### Primary Colors
- **Orange Gradient**: `from-orange-400 to-pink-500`
- **Slate Dark**: `slate-900`
- **Slate Light**: `slate-50`

### Status Colors
- **Success**: `green-600` / `green-100`
- **Error**: `red-600` / `red-100`
- **Info**: `blue-600` / `blue-100`
- **Warning**: `orange-600` / `orange-100`

## 📊 State Management

### CreateQuiz State
```javascript
{
  quizTitle: "string",
  questions: [{
    id: number,
    question: "string",
    options: ["str", "str", "str", "str"],
    correctAnswer: "str"
  }],
  loading: boolean
}
```

### StudentQuizzes State
```javascript
{
  quizzes: [{ id, title, ... }],
  loading: boolean,
  selectedQuizId: null | string,
  attemptedQuizzes: Set<string>
}
```

### QuizAttempt State
```javascript
{
  quiz: { id, title, questions[], ... },
  currentQuestionIndex: number,
  answers: { [qIdx]: optionIdx },
  submitted: boolean,
  result: { correctCount, totalCount, percentage },
  loading: boolean
}
```

## 🔗 Data Flow

```
┌─ localStorage ─┐
│   quizzes      │
│   attempts     │
└────────────────┘
      ▲      ▲
      │      │
      │      └─────────────────────────────┐
      │                                    │
  ┌─────────────────────────┐      ┌─────────────────────────┐
  │ CreateQuiz component    │      │ QuizAttempt component   │
  │                         │      │                         │
  │ save() ──► quizService  │      │ load() ──► quizService  │
  │                         │      │ submit()                │
  └─────────────────────────┘      └─────────────────────────┘
                                              │
                                              └─ calculateScore()
                                              └─ saveAttempt()
```

## 🎯 Responsive Breakpoints

```
Mobile (< 640px):      Single column layout
Tablet (640px - 1024px): 2-3 column grid
Desktop (> 1024px):    Full 3-4 column grid
```

## 🔐 Error Handling

```
CreateQuiz:
├─ Missing quiz title → Toast error
├─ Incomplete question → Toast error
├─ Missing options → Toast error
└─ Failed save → Toast error

QuizAttempt:
├─ Quiz not found → Toast + navigate back
├─ Missing answer → Disable Next button
└─ Failed submission → Toast error

StudentQuizzes:
├─ Load failure → Toast error
└─ Permission denied → Hide quiz
```

## ⏱️ Loading States

- **Quiz Loading**: Spinner with "Loading quizzes..."
- **Quiz Submission**: Button disabled with "Saving..."
- **Quiz Creation**: Button disabled with "Saving..."

## ✨ Animations

- Progress bar width transition: 300ms
- Score circle appears on result page
- Options highlight on selection
- Button hover effects
- Card shadow on hover

---

**Visual Design**: Modern, clean, user-friendly
**Accessibility**: WCAG compliant color contrasts
**Performance**: Optimized re-renders, no unnecessary state updates
