import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../config/Api";

const STORAGE_KEY = "ContactFormDraft";

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

  // ✅ Load saved draft when component mounts
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // ✅ Save draft automatically whenever formData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    const emptyForm = {
      fullName: "",
      email: "",
      mobileNumber: "",
      courseInterested: "",
      qualification: "",
      experienceLevel: "",
      preferredMode: "",
      city: "",
      message: "",
    };

    setFormData(emptyForm);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await api.post("/api/contact", formData);

      toast.success(res?.data?.message || "Message sent successfully!");

      handleClear(); // clear only after success
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">
          Contact Us
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Get in touch with us for any queries or support.
        </p>

        <div className="bg-white rounded-xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
            />

            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
            />

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
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition resize-none"
            />

            <div className="flex gap-4">

              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Clear
              </button>

            </div>

            {/* Draft indicator */}
            {formData.fullName ||
            formData.email ||
            formData.mobileNumber ||
            formData.message ? (
              <p className="text-sm text-slate-500">
                Draft saved automatically
              </p>
            ) : null}

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
