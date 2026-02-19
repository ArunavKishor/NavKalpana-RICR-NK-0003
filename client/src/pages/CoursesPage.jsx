import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const coursesData = [
  {
    title: "Full Stack Web (MERN)",
    description:
      "Build modern web apps using MongoDB, Express, React, and Node.js. Includes authentication, REST APIs, and deployment strategies.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    status: "Ongoing",
    category: "WEB COURSE",
  },
  {
    title: "Data Structures & Algos",
    description:
      "Master problem solving, algorithms, recursion, trees, graphs, and interview-focused coding patterns used in top tech companies.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    status: "Ongoing",
    category: "DSA COURSE",
  },
  {
    title: "Data Science",
    description:
      "Learn analytics, visualization, and working with datasets to extract insights. Covers statistics, Python tools, and practical projects.",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    status: "Completed",
    category: "ANALYTICS",
  },
  {
    title: "Python for Beginners",
    description:
      "Beginner-friendly course designed to build a strong programming foundation. Covers syntax, control flow, functions, and real exercises.",
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935",
    status: "Ongoing",
    category: "PYTHON COURSE",
  },
  {
    title: "Java Programming Masterclass",
    description:
      "Structured learning path for mastering Java programming. Includes object-oriented programming, exception handling, and backend fundamentals.",
    image:
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    status: "Ongoing",
    category: "JAVA COURSE",
  },
  {
    title: "Machine Learning",
    description:
      "Introductory course exploring machine learning concepts such as supervised learning, feature engineering, and model evaluation techniques.",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a",
    status: "Ongoing",
    category: "AI COURSE",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const CoursesPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Courses</h1>
            <p className="text-slate-500 text-sm">
              Browse and manage available courses
            </p>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.title}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-40">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {course.title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-grow">
                  {course.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(`/courses/${encodeURIComponent(course.title)}`)
                  }
                  className="mt-4 bg-slate-900 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                >
                  View Course <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
