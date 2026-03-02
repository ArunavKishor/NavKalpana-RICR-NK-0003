import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const TeacherForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  errors,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.name || "",
        email: initialData.email || "",
        password: "", // Leave blank on edit
        phone: initialData.phone || "",
        joiningDate: initialData.joiningDate
          ? new Date(initialData.joiningDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: initialData.status?.toLowerCase() || "active",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initialData && !formData.password) {
      toast.error("Password is required for new teachers");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.fullName ? "border-red-500" : "border-slate-300"
            }`}
            placeholder="John Doe"
          />
          {errors?.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.email ? "border-red-500" : "border-slate-300"
            }`}
            placeholder="john@example.com"
          />
          {errors?.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password (only required on create) */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              required={!initialData}
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.password ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Min 6 characters"
            />
            {errors?.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
        )}

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.phone ? "border-red-500" : "border-slate-300"
            }`}
            placeholder="+1 234 567 8900"
          />
          {errors?.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Joining Date
          </label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.joiningDate ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors?.joiningDate && (
            <p className="mt-1 text-xs text-red-500">{errors.joiningDate}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.status ? "border-red-500" : "border-slate-300"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="resigned">Resigned</option>
          </select>
          {errors?.status && (
            <p className="mt-1 text-xs text-red-500">{errors.status}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Create Teacher"
          )}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;
