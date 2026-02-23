import React from "react";
import { motion } from "framer-motion";

const courses = [
  { title: "Java", detail: "Core to advanced enterprise backend development." },
  { title: "Python", detail: "Automation, APIs, and scripting fundamentals." },
  { title: "DSA", detail: "Data structures and interview preparation." },
  {
    title: "Web Development",
    detail: "Frontend, backend & full-stack projects.",
  },
  { title: "Data Science", detail: "Statistics and real-world datasets." },
  {
    title: "Machine Learning",
    detail: "Model building and deployment basics.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Home = () => {
  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden">
      {/* HERO */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-14 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="order-2 lg:order-1"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Practical Learning
              <br />
              <span className="text-indigo-600">For Real Careers</span>
            </h1>

            <p className="mt-4 sm:mt-5 md:mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Learn through structured courses, real projects, and guided
              mentorship designed to help you build strong technical skills.
            </p>

            <div className="mt-6 sm:mt-7 md:mt-8 flex gap-3 sm:gap-4 md:gap-5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                Choose Courses
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white border border-slate-300 font-semibold hover:bg-slate-50 transition"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side Card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-5 sm:p-7 md:p-10 border border-slate-200"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              What You Get
            </h2>

            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-slate-600">
              <li className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base">
                Structured curriculum
              </li>
              <li className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base">
                Project-based assignments
              </li>
              <li className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base">
                Doubt-solving sessions
              </li>
              <li className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base">
                Career guidance support
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* COURSES */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center"
          >
            Our Courses
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mt-12 sm:mt-14 md:mt-16">
            {courses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-slate-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow">
                  {course.title[0]}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6">
                  {course.title}
                </h3>

                <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed">
                  {course.detail}
                </p>

                <button className="mt-4 sm:mt-6 text-indigo-600 font-semibold hover:underline text-sm sm:text-base">
                  Learn More →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 md:py-24 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold"
          >
            Ready to Start Learning?
          </motion.h2>

          <p className="mt-4 sm:mt-5 md:mt-6 text-indigo-100 text-base sm:text-lg leading-relaxed">
            Explore our programs and begin your learning journey today.
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 sm:mt-9 md:mt-10 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base rounded-xl bg-white text-indigo-600 font-bold shadow-lg hover:bg-slate-50 transition"
          >
            Get Started
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
