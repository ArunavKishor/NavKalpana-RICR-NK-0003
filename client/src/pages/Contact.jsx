import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
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

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

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
      handleClear();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-semibold text-gray-900">
            Contact Our Team
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Have questions about courses or enrollment?
            <span className="text-indigo-600 font-medium">
              {" "}
              We’re here to help.
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Reach Us Directly
              </h3>

              <div className="space-y-6 text-gray-600">
                {[
                  {
                    icon: Mail,
                    title: "Email",
                    value: "punitpawar59@gmail.com",
                  },
                  { icon: Phone, title: "Phone", value: "+91 98765 43210" },
                  {
                    icon: MapPin,
                    title: "Location",
                    value: "Your City, India",
                  },
                  {
                    icon: Clock,
                    title: "Working Hours",
                    value: "Mon – Sat | 9 AM – 7 PM",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <item.icon className="text-indigo-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-50">
              <h4 className="font-semibold text-gray-900 mb-3">
                Why Choose Us?
              </h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="text-indigo-600">
                  ✔ Industry-focused curriculum
                </li>
                <li>✔ Real-world projects</li>
                <li>✔ Placement assistance</li>
                <li>✔ Experienced mentors</li>
              </ul>
            </div>
          </motion.div>

          {/* RIGHT SIDE - FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-10 border border-indigo-50"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="inputStyle"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="inputStyle"
                />
              </div>

              <input
                type="text"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="inputStyle"
              />

              <textarea
                name="message"
                rows="4"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="inputStyle resize-none"
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
                >
                  {isLoading ? "Sending..." : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-3 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                >
                  Clear
                </button>
              </div>

              {(formData.fullName ||
                formData.email ||
                formData.mobileNumber ||
                formData.message) && (
                <p className="text-sm text-indigo-500">
                  Draft saved automatically
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      <style>
        {`
        .inputStyle {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          outline: none;
          transition: all 0.3s ease;
          background: #fff;
        }
        .inputStyle:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
      `}
      </style>
    </div>
  );
};

export default Contact;
