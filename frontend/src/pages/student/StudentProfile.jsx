import React, { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaEdit } from "react-icons/fa";
import api from "../../config/api";
import toast from "react-hot-toast";
import ImageUploadComponent from "../../components/common/ImageUploadComponent";
import Avatar from "../../components/shared/Avatar";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    enrollmentId: "",
    github: "",
    linkedin: "",
    profilePhoto: null,
  });

  const [tempData, setTempData] = useState(student);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/students/me");
      if (res.data.data) {
        setStudent(res.data.data);
        setTempData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      toast.error("Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handlePhotoUploadSuccess = (photoUrl) => {
    // Update both student and tempData with the new photo URL
    setStudent((prev) => ({ ...prev, profilePhoto: photoUrl }));
    setTempData((prev) => ({ ...prev, profilePhoto: photoUrl }));
    // No need to refresh, data persists immediately
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put("/api/students/me", tempData);
      setStudent(res.data.data);
      setTempData(res.data.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(student);
    setIsEditing(false);
  };

  if (loading && !student.name) {
    return (
      <div className="p-6 text-center text-gray-500 min-h-screen">
        Loading profile...
      </div>
    );
  }

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
              disabled={loading}
            >
              <FaEdit />
              Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar with Upload */}
          <div className="flex flex-col items-center">
            <ImageUploadComponent
              imageUrl={student.profilePhoto}
              onUploadSuccess={handlePhotoUploadSuccess}
              type="avatar"
              acceptedFormats={["image/jpeg", "image/png", "image/gif"]}
              maxSize={5}
              endpoint="/api/students/me/upload-photo"
              fallbackName={student.name}
              fallbackEmail={student.email}
            />
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

            <InputField label="Email" value={student.email} disabled />

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
              placeholder="https://github.com/username"
            />

            <InputField
              label="LinkedIn"
              name="linkedin"
              value={tempData.linkedin}
              disabled={!isEditing}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  disabled,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="text-sm text-gray-500">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-lg p-2 mt-1 ${disabled
          ? "bg-gray-100"
          : "focus:outline-none focus:ring-2 focus:ring-blue-400"
        }`}
    />
  </div>
);

export default StudentProfile;
