import React from "react";
import { motion } from "framer-motion";

const courses = [
  { title: "Java", detail: "Core to advanced enterprise backend development." },
  { title: "Python", detail: "Automation, APIs, and scripting fundamentals." },
  { title: "DSA", detail: "Data structures and interview preparation." },
  { title: "Web Development", detail: "Frontend, backend & full-stack projects." },
  { title: "Data Science", detail: "Statistics and real-world datasets." },
  { title: "Machine Learning", detail: "Model building and deployment basics." },
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
      <section className="relative py-28 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Practical Learning
              <br />
              <span className="text-indigo-600">For Real Careers</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              Learn through structured courses, real projects, and guided
              mentorship designed to help you build strong technical skills.
            </p>

            <div className="mt-8 flex gap-5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                Choose Courses
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-3 rounded-xl bg-white border border-slate-300 font-semibold"
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
            className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200"
          >
            <h2 className="text-2xl font-bold mb-6">
              What You Get
            </h2>

            <ul className="space-y-4 text-slate-600">
              <li className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                Structured curriculum
              </li>
              <li className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                Project-based assignments
              </li>
              <li className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                Doubt-solving sessions
              </li>
              <li className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                Career guidance support
              </li>
            </ul>
          </motion.div>

        </div>
      </section>

      {/* COURSES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center"
          >
            Our Courses
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">
            {courses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-slate-50 rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition"
              >
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow">
                  {course.title[0]}
                </div>

                <h3 className="text-xl font-semibold mt-6">
                  {course.title}
                </h3>

                <p className="text-slate-600 mt-3">
                  {course.detail}
                </p>

                <button className="mt-6 text-indigo-600 font-semibold hover:underline">
                  Learn More →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold"
          >
            Ready to Start Learning?
          </motion.h2>

          <p className="mt-6 text-indigo-100 text-lg">
            Explore our programs and begin your learning journey today.
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 px-10 py-4 rounded-xl bg-white text-indigo-600 font-bold shadow-lg"
          >
            Get Started
          </motion.button>
        </div>
      </section>

    </div>
  );
};

export default Home;
