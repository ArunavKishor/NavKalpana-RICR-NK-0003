import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Programming", "Data", "Interview", "Design"];

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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const Courses = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesCategory =
        activeCategory === "All" || course.category === activeCategory;

      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 overflow-hidden">

      <section className="py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold"
        >
          Explore Our Courses
        </motion.h1>

        <div className="mt-10 max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-3xl border shadow-sm"
            >
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                {course.title[0]}
              </div>

              <h3 className="text-xl font-semibold mt-6">
                {course.title}
              </h3>

              <p className="text-slate-600 mt-3">
                {course.description}
              </p>

              {/* ✅ NAVIGATION BUTTON */}
              <button
                onClick={() => navigate(`/course/${course.title}`)}
                className="mt-6 text-indigo-600 font-semibold hover:underline"
              >
                View Details →
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Courses;
