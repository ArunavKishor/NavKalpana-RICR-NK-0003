import React, { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

const getStoredUser = () => {
  try {
    let raw = sessionStorage.getItem("AdminUser");
    if (raw) return JSON.parse(raw);

    raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const emptyTeacherForm = {
  name: "",
  email: "",
  subject: "",
  phone: "",
};

const AdminDashbord = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredUser());

  // Check Auth on Mount
  React.useEffect(() => {
    let token = sessionStorage.getItem("AdminToken");
    const user = getStoredUser();

    if (!token && user?.token) {
      token = user.token;
    }

    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("AdminUser");
    sessionStorage.removeItem("AdminToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(emptyTeacherForm);
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(emptyTeacherForm);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === editingId ? { ...teacher, ...formData } : teacher
        )
      );
      handleClear();
      return;
    }

    const newTeacher = {
      id: Date.now().toString(),
      ...formData,
    };

    setTeachers((prev) => [newTeacher, ...prev]);
    setFormData(emptyTeacherForm);
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      phone: teacher.phone,
    });
    setEditingId(teacher.id);
  };

  const handleDelete = (id) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    if (editingId === id) {
      handleClear();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("CravingUser");
    setAdmin(null);
    window.location.href = "/login"; // redirect to login page
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your profile and teachers in one place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition"
            >
              Sign Out
            </button>
            <div className="bg-white rounded-xl shadow px-6 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Logged in as
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {admin?.fullName || admin?.name || "Admin User"}
              </p>
              <p className="text-sm text-slate-600">
                {admin?.email || "admin@example.com"}
              </p>
            </div>

          {/* Admin Info + Logout */}
          <div className="bg-white rounded-xl shadow px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Logged in as
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {admin?.name || "Admin User"}
              </p>
              <p className="text-sm text-slate-600">
                {admin?.email || "admin@example.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 md:mt-0 bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Profile */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Admin Profile
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Name
                </p>
                <p className="text-base text-slate-900">
                  {admin?.fullName || admin?.name || "Admin User"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Email
                </p>
                <p className="text-base text-slate-900">
                  {admin?.email || "admin@example.com"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Role
                </p>
                <p className="text-base text-slate-900">{admin?.role || "admin"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <p className="text-base text-emerald-600 font-semibold">Active</p>
              </div>
            </div>
          </div>

          {/* Teacher Form + List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Register/Edit Teacher */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {isEditing ? "Edit Teacher" : "Register Teacher"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Teacher name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Teacher email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {isEditing ? "Update Teacher" : "Register Teacher"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Teacher List */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Teachers</h2>
                <span className="text-sm text-slate-500">{teachers.length} total</span>
              </div>

              {teachers.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No teachers registered yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {teacher.name}
                        </p>
                        <p className="text-sm text-slate-600">{teacher.email}</p>
                        <p className="text-sm text-slate-600">
                          {teacher.subject} · {teacher.phone}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(teacher)}
                          className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(teacher.id)}
                          className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashbord;
