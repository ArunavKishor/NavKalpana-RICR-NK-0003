import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../config/Api";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
    },
  }),
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    courseInterested: "",
    qualification: "",
    experienceLevel: "",
    preferredMode: "",
    city: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      courseInterested: "",
      qualification: "",
      experienceLevel: "",
      preferredMode: "",
      city: "",
      message: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/contact", formData);
      toast.success(res.data.message || "Message sent successfully!");
      handleClear();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 overflow-hidden">

      {/* Soft Background Glow */}
      <div className="absolute top-[-120px] left-[-100px] w-[350px] h-[350px] bg-indigo-200 rounded-full blur-[120px] opacity-40"></div>

      <div className="max-w-5xl mx-auto">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-slate-900">
            Student Inquiry Form
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Fill in your details and our team will connect with you shortly.
          </p>
        </motion.div>

        {/* FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">

              <motion.input
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="inputStyle"
              />

              <motion.input
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="inputStyle"
              />

              <motion.input
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                type="text"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="inputStyle"
              />

              <motion.input
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="inputStyle"
              />

            </div>

            {/* Academic Info */}
            <div className="grid md:grid-cols-2 gap-6">

              <select
                name="courseInterested"
                value={formData.courseInterested}
                onChange={handleChange}
                required
                className="inputStyle"
              >
                <option value="">Course Interested In</option>
                <option>Java</option>
                <option>Python</option>
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Machine Learning</option>
              </select>

              <input
                type="text"
                name="qualification"
                placeholder="Current Qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="inputStyle"
              />

              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Experience Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <select
                name="preferredMode"
                value={formData.preferredMode}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Preferred Mode</option>
                <option>Online</option>
                <option>Offline</option>
              </select>

            </div>

            {/* Message */}
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              className="inputStyle"
            />

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Inquiry"}
            </motion.button>

          </form>
        </motion.div>
      </div>

      {/* Tailwind Reusable Input Style */}
      <style>
        {`
          .inputStyle {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            outline: none;
            transition: all 0.3s ease;
          }
          .inputStyle:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79,70,229,0.2);
          }
        `}
      </style>
    </div>
  );
};

export default Contact;
