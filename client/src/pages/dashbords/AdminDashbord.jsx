import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- GET STORED USER ---------------- */
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
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(emptyTeacherForm);
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    let token = sessionStorage.getItem("AdminToken");
    const user = getStoredUser();

    if (!token && user?.token) {
      token = user.token;
    }

    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate]);

  /* ---------------- LOGOUT (FIXED) ---------------- */
  const handleLogout = () => {
    sessionStorage.removeItem("AdminUser");
    sessionStorage.removeItem("AdminToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("CravingUser");

    setAdmin(null);
    navigate("/login");
  };

  /* ---------------- FORM HANDLERS ---------------- */
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
    if (editingId === id) handleClear();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your profile and teachers in one place.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-6">
            <div>
              <p className="text-xs uppercase text-slate-400">Logged in as</p>
              <p className="text-lg font-semibold text-slate-900">
                {admin?.fullName || admin?.name || "Admin User"}
              </p>
              <p className="text-sm text-slate-600">
                {admin?.email || "admin@example.com"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ADMIN PROFILE */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Profile</h2>

            <div className="space-y-3">
              <p>
                <strong>Name:</strong>{" "}
                {admin?.fullName || admin?.name || "Admin User"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {admin?.email || "admin@example.com"}
              </p>
              <p>
                <strong>Role:</strong> {admin?.role || "admin"}
              </p>
              <p className="text-emerald-600 font-semibold">Active</p>
            </div>
          </div>

          {/* TEACHER SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* FORM */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {isEditing ? "Edit Teacher" : "Register Teacher"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    placeholder="Teacher name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input"
                  />

                  <input
                    name="email"
                    type="email"
                    placeholder="Teacher email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input"
                  />

                  <input
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input"
                  />

                  <input
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div className="flex gap-3">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                    {isEditing ? "Update Teacher" : "Register Teacher"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="bg-slate-200 px-6 py-2 rounded-lg"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* TEACHER LIST */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Teachers ({teachers.length})
              </h2>

              {teachers.length === 0 ? (
                <p className="text-slate-500">
                  No teachers registered yet.
                </p>
              ) : (
                teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="border rounded-xl p-4 mb-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{teacher.name}</p>
                      <p className="text-sm text-slate-600">
                        {teacher.email}
                      </p>
                      <p className="text-sm text-slate-600">
                        {teacher.subject} · {teacher.phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="px-3 py-1 border text-blue-600 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="px-3 py-1 border text-rose-600 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashbord;