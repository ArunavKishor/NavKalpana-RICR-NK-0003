import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Layers,
  BarChart3,
  CheckCircle,
  User,
  BookOpen,
  GraduationCap,
  Target,
  BadgeCheck,
} from "lucide-react";

/* COURSE DATA */
const coursesData = [
  { title: "Java Programming", category: "Programming", description: "Core Java, OOP concepts and backend fundamentals." },
  { title: "Advanced Java", category: "Programming", description: "Spring Boot, REST APIs and enterprise development." },
  { title: "Python Programming", category: "Programming", description: "Python fundamentals, scripting and automation." },
  { title: "Web Development", category: "Programming", description: "Frontend, backend and full-stack development." },
  { title: "React Development", category: "Programming", description: "Modern UI development with React and hooks." },
  { title: "Node.js Backend", category: "Programming", description: "Build scalable APIs and backend services." },

  { title: "Data Science", category: "Data", description: "Data analysis, visualization and statistics." },
  { title: "Machine Learning", category: "Data", description: "Supervised and unsupervised ML models." },
  { title: "Deep Learning", category: "Data", description: "Neural networks and AI fundamentals." },
  { title: "SQL & Databases", category: "Data", description: "Relational databases and query optimization." },

  { title: "Data Structures & Algorithms", category: "Interview", description: "Core DSA concepts for interviews." },
  { title: "System Design", category: "Interview", description: "Scalable architecture and backend design." },
  { title: "Interview Preparation", category: "Interview", description: "Coding practice and mock interviews." },

  { title: "UI/UX Design", category: "Design", description: "User experience and interface design principles." },
  { title: "Figma Design", category: "Design", description: "Design modern interfaces using Figma." },
];

/* COURSE META */
const getCourseMeta = (title) => ({
  level: "All Levels",
  duration: "6 – 8 Weeks",
  modules: "12 Modules",
  instructor: "Expert Faculty",
  overview:
    "This course provides structured, industry-aligned learning designed to build strong conceptual foundations along with practical skills. Learners gain real-world exposure through guided exercises and projects.",
  skills: [
    "Practical problem-solving skills",
    "Industry-relevant technical knowledge",
    "Hands-on development experience",
    "Best practices & clean architecture",
  ],
  outcomes: [
    "Build real-world projects confidently",
    "Understand core concepts thoroughly",
    "Prepare for interviews & professional work",
    "Strengthen analytical & technical thinking",
  ],
});

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CourseDetail = () => {
  const { title } = useParams();
  const navigate = useNavigate();

  const course = coursesData.find((c) => c.title === title);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
        Course not found
      </div>
    );
  }

  const meta = getCourseMeta(course.title);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6 py-16"
      >
        {/* Back */}
        <motion.button
          variants={item}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-medium mb-10"
        >
          ← Back to Courses
        </motion.button>

        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            {course.title}
          </h1>

          <div className="mt-3 inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
            {course.category}
          </div>

          <p className="mt-5 text-slate-600 max-w-3xl">
            {course.description}
          </p>
        </motion.div>

        {/* Academic Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10"
        >
          <Stat icon={<BarChart3 size={16} />} label="Level" value={meta.level} />
          <Stat icon={<Clock size={16} />} label="Duration" value={meta.duration} />
          <Stat icon={<Layers size={16} />} label="Modules" value={meta.modules} />
          <Stat icon={<User size={16} />} label="Instructor" value={meta.instructor} />
        </motion.div>

        {/* Main Grid */}
        <motion.div
          variants={item}
          className="grid md:grid-cols-2 gap-8 mt-14"
        >
          {/* Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} className="text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Course Overview
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {meta.overview}
            </p>

            <div className="mt-6 space-y-2">
              {meta.skills.map((skill) => (
                <div key={skill} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={16} className="text-indigo-500" />
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Learning Highlights
              </h2>
            </div>

            <div className="space-y-3">
              {[
                "Concept-driven structured curriculum",
                "Hands-on practical exercises",
                "Real-world implementation approach",
                "Guided mini projects & assignments",
                "Career-oriented best practices",
              ].map((point) => (
                <div
                  key={point}
                  className="p-3 rounded-lg bg-slate-50 text-slate-700 border border-slate-100"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Outcomes */}
        <motion.div variants={item} className="mt-14">
          <div className="flex items-center gap-2 mb-5">
            <Target size={18} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Expected Outcomes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {meta.outcomes.map((outcome) => (
              <div
                key={outcome}
                className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200"
              >
                <BadgeCheck size={18} className="text-indigo-500" />
                <span className="text-slate-700">{outcome}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={item}
          className="mt-16 flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-sm"
          >
            Enroll Now
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 rounded-lg border border-slate-300 text-slate-700 bg-white"
          >
            Download Syllabus
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* Reusable Stat */
const Stat = ({ icon, label, value }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

export default CourseDetail;
