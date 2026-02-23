import React, { useState } from "react";
import { FaGithub, FaLinkedin, FaEdit } from "react-icons/fa";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [student, setStudent] = useState({
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    course: "Web Development",
    enrollmentId: "NK-2026-001",
    github: "https://github.com/rahul",
    linkedin: "https://linkedin.com/in/rahul",
  });

  const [tempData, setTempData] = useState(student);

  const handleChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setStudent(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(student);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FaEdit />
              Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {student.name.charAt(0)}
            </div>
            <p className="mt-4 text-lg font-semibold">{student.name}</p>
            <p className="text-gray-500 text-sm">{student.course}</p>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-4">

            <InputField
              label="Full Name"
              name="name"
              value={tempData.name}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              value={student.email}
              disabled
            />

            <InputField
              label="Phone"
              name="phone"
              value={tempData.phone}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <InputField
              label="Enrollment ID"
              value={student.enrollmentId}
              disabled
            />

            <InputField
              label="GitHub"
              name="github"
              value={tempData.github}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <InputField
              label="LinkedIn"
              name="linkedin"
              value={tempData.linkedin}
              disabled={!isEditing}
              onChange={handleChange}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, disabled, onChange }) => (
  <div>
    <label className="text-sm text-gray-500">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={`w-full border rounded-lg p-2 mt-1 ${
        disabled ? "bg-gray-100" : "focus:outline-none focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

export default StudentProfile;