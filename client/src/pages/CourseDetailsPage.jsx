import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";

/* ================= ALL COURSES DATA ================= */

const coursesData = {
  "Full Stack Web (MERN)": {
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    level: "Intermediate",
    duration: "12 Weeks",
    lessons: 48,
    students: "12,500+",
    description:
      "Master full stack development using MongoDB, Express, React and Node.js. Build scalable real-world applications.",
    roadmap: [
      "HTML, CSS & Responsive UI",
      "Modern JavaScript (ES6+)",
      "React Fundamentals & Hooks",
      "Node.js & Express APIs",
      "MongoDB & Mongoose",
      "Authentication (JWT)",
      "Deployment",
    ],
    skills: [
      "Frontend Development",
      "Backend APIs",
      "Database Design",
      "Authentication Systems",
    ],
    tools: ["React", "Node.js", "MongoDB", "Express", "JWT"],
    roles: [
      "Full Stack Developer",
      "Frontend Engineer",
      "Backend Developer",
    ],
  },

  "Data Structures & Algos": {
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    level: "Advanced",
    duration: "10 Weeks",
    lessons: 40,
    students: "9,800+",
    description:
      "Master algorithms and crack coding interviews with strong problem-solving skills.",
    roadmap: [
      "Time Complexity",
      "Arrays & Strings",
      "Stacks & Queues",
      "Trees & Graphs",
      "Dynamic Programming",
    ],
    skills: [
      "Problem Solving",
      "Algorithm Optimization",
      "Interview Preparation",
    ],
    tools: ["Java", "Python", "Recursion", "DP"],
    roles: ["Software Engineer", "Backend Developer"],
  },

  "Python for Beginners": {
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935",
    level: "Beginner",
    duration: "8 Weeks",
    lessons: 30,
    students: "18,200+",
    description:
      "Start your programming journey with Python fundamentals and mini projects.",
    roadmap: [
      "Variables & Data Types",
      "Loops & Conditions",
      "Functions",
      "File Handling",
      "Mini Projects",
    ],
    skills: ["Programming Basics", "Logic Building"],
    tools: ["Python", "VS Code"],
    roles: ["Python Developer", "Automation Engineer"],
  },

  "Java Programming Masterclass": {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    level: "Intermediate",
    duration: "11 Weeks",
    lessons: 42,
    students: "11,300+",
    description:
      "Build strong Java foundations including OOP, collections and backend basics.",
    roadmap: [
      "Java Basics",
      "OOP Principles",
      "Collections Framework",
      "Exception Handling",
      "Spring Basics",
    ],
    skills: ["OOP Mastery", "Enterprise Coding"],
    tools: ["Java", "Spring"],
    roles: ["Java Developer", "Backend Engineer"],
  },

  "Machine Learning": {
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a",
    level: "Advanced",
    duration: "9 Weeks",
    lessons: 36,
    students: "7,400+",
    description:
      "Understand regression, classification and ML workflows with real datasets.",
    roadmap: [
      "ML Basics",
      "Data Preprocessing",
      "Regression",
      "Classification",
      "Model Evaluation",
    ],
    skills: ["Model Building", "Data Processing"],
    tools: ["Python", "Scikit-learn", "Pandas"],
    roles: ["ML Engineer", "Data Scientist"],
  },

  "Data Science": {
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    level: "Intermediate",
    duration: "14 Weeks",
    lessons: 55,
    students: "13,900+",
    description:
      "Learn statistics, visualization and data-driven decision making.",
    roadmap: [
      "Statistics",
      "Data Cleaning",
      "EDA",
      "Visualization",
      "Capstone Project",
    ],
    skills: ["Data Analysis", "Visualization"],
    tools: ["Python", "Pandas", "Matplotlib"],
    roles: ["Data Analyst", "Data Scientist"],
  },
};

/* ================= COMPONENT ================= */

const CourseDetailsPage = () => {
  const { title } = useParams();
  const navigate = useNavigate();

  const decodedTitle = decodeURIComponent(title);
  const course = coursesData[decodedTitle];

  if (!course) {
    return <div className="p-20 text-center">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <div className="relative h-[500px] flex items-center text-white overflow-hidden">
        <img
          src={course.image}
          alt={decodedTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-6xl mx-auto px-6 w-full">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-white/80 hover:text-white"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-5xl font-bold">{decodedTitle}</h1>

          <p className="mt-6 max-w-3xl text-white/80 text-lg">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <Stat icon={<Clock size={16} />} label={course.duration} />
            <Stat icon={<BookOpen size={16} />} label={`${course.lessons} Lessons`} />
            <Stat icon={<Users size={16} />} label={`${course.students} Students`} />
            <Stat icon={<TrendingUp size={16} />} label={course.level} />
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        <Section title="Course Roadmap">
          {course.roadmap.map((item) => (
            <div key={item} className="p-4 bg-white rounded-xl shadow border">
              {item}
            </div>
          ))}
        </Section>

        <Section title="Skills You Will Gain">
          <div className="grid md:grid-cols-3 gap-4">
            {course.skills.map((skill) => (
              <div key={skill} className="bg-white p-4 rounded-xl shadow border">
                {skill}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tools & Technologies">
          <div className="flex flex-wrap gap-3">
            {course.tools.map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Career Opportunities">
          {course.roles.map((role) => (
            <div key={role} className="flex items-center gap-3">
              <Briefcase size={16} /> {role}
            </div>
          ))}
        </Section>

        {/* ENROLL CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 rounded-3xl shadow-xl">
          <h3 className="text-2xl font-bold">Start Learning Today 🚀</h3>
          <p className="mt-2 text-white/90">
            Upgrade your skills with industry-ready knowledge.
          </p>

          <button
            onClick={() =>
              navigate("/contact", {
                state: { courseName: decodedTitle },
              })
            }
            className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition"
          >
            Enroll Now
          </button>
        </div>

      </div>
    </div>
  );
};

/* SMALL COMPONENTS */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-slate-800">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Stat = ({ icon, label }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-xl text-sm text-white">
    {icon}
    <span>{label}</span>
  </div>
);

export default CourseDetailsPage;
