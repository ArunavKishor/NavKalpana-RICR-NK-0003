import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const categories = ["All", "Programming", "Data", "Interview", "Design"];

const coursesData = [
  // Programming
  {
    title: "Java Programming",
    category: "Programming",
    description: "Core Java, OOP concepts and backend fundamentals.",
  },
  {
    title: "Advanced Java",
    category: "Programming",
    description: "Spring Boot, REST APIs and enterprise development.",
  },
  {
    title: "Python Programming",
    category: "Programming",
    description: "Python fundamentals, scripting and automation.",
  },
  {
    title: "Web Development",
    category: "Programming",
    description: "Frontend, backend and full-stack development.",
  },
  {
    title: "React Development",
    category: "Programming",
    description: "Modern UI development with React and hooks.",
  },
  {
    title: "Node.js Backend",
    category: "Programming",
    description: "Build scalable APIs and backend services.",
  },

  // Data
  {
    title: "Data Science",
    category: "Data",
    description: "Data analysis, visualization and statistics.",
  },
  {
    title: "Machine Learning",
    category: "Data",
    description: "Supervised and unsupervised ML models.",
  },
  {
    title: "Deep Learning",
    category: "Data",
    description: "Neural networks and AI fundamentals.",
  },
  {
    title: "SQL & Databases",
    category: "Data",
    description: "Relational databases and query optimization.",
  },

  // Interview
  {
    title: "Data Structures & Algorithms",
    category: "Interview",
    description: "Core DSA concepts for interviews.",
  },
  {
    title: "System Design",
    category: "Interview",
    description: "Scalable architecture and backend design.",
  },
  {
    title: "Interview Preparation",
    category: "Interview",
    description: "Coding practice and mock interviews.",
  },

  // Design
  {
    title: "UI/UX Design",
    category: "Design",
    description: "User experience and interface design principles.",
  },
  {
    title: "Figma Design",
    category: "Design",
    description: "Design modern interfaces using Figma.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
    },
  }),
};

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesCategory =
        activeCategory === "All" ||
        course.category === activeCategory;

      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 overflow-hidden">

      {/* Soft Background Glow */}
      <div className="absolute top-[-100px] right-[-120px] w-[350px] h-[350px] bg-indigo-200 rounded-full blur-[120px] opacity-40"></div>

      {/* HERO */}
      <section className="py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold"
        >
          Explore Our Courses
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
        >
          Search and filter courses to find the perfect learning path.
        </motion.p>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto relative"
        >
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </motion.div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition 
              ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* COURSE GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition"
            >
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow">
                {course.title[0]}
              </div>

              <h3 className="text-xl font-semibold mt-6">
                {course.title}
              </h3>

              <p className="text-slate-600 mt-3">
                {course.description}
              </p>

              <button className="mt-6 text-indigo-600 font-semibold hover:underline">
                View Details →
              </button>
            </motion.div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-20">
              No courses found.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold"
        >
          Start Your Learning Journey Today
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 px-10 py-4 rounded-xl bg-white text-indigo-600 font-bold shadow-lg"
        >
          Get Started
        </motion.button>
      </section>

    </div>
  );
};

export default Courses;
