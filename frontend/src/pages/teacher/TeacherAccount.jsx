import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import api from "@/config/Api";
import toast from "react-hot-toast";

const TeacherAccount = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Fetch teacher profile
  useEffect(() => {
    loadTeacherProfile();
  }, []);

  const loadTeacherProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/teachers/me");
      const teacherData = data?.data;
      setTeacher(teacherData);
      setFormData({
        fullName: teacherData?.user?.fullName || "",
        email: teacherData?.user?.email || "",
        phone: teacherData?.phone || "",
      });
    } catch (err) {
      console.error("Load teacher profile failed:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!teacher?._id) return;

    try {
      setSaving(true);
      await api.put(`/api/teachers/${teacher._id}`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      // Update local user context if name or email changed
      if (user) {
        setUser({
          ...user,
          fullName: formData.fullName,
          email: formData.email,
        });
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            fullName: formData.fullName,
            email: formData.email,
          })
        );
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      await loadTeacherProfile();
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !teacher?._id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/api/teachers/${teacher._id}/upload-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile photo updated");
      await loadTeacherProfile();
    } catch (err) {
      console.error("Upload photo failed:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "inactive":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "resigned":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-slate-600">Failed to load profile</p>
          <Button onClick={loadTeacherProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
        <p className="text-slate-500">
          Manage your profile information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Profile Photo */}
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                  {teacher.profilePhoto ? (
                    <img
                      src={teacher.profilePhoto}
                      alt={teacher.user?.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                      <User className="w-16 h-16 text-indigo-600" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </div>

              {/* Name & Role */}
              <h2 className="text-xl font-bold text-slate-900">
                {teacher.user?.fullName}
              </h2>
              <p className="text-slate-500 text-sm">{teacher.user?.email}</p>

              <Badge
                className={`mt-3 ${getStatusColor(teacher.status)} capitalize`}
              >
                {teacher.status}
              </Badge>

              <Separator className="my-6" />

              {/* Quick Info */}
              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Employee ID:</span>
                  <span className="font-medium text-slate-900 ml-auto">
                    {teacher.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Joined:</span>
                  <span className="font-medium text-slate-900 ml-auto">
                    {teacher.joiningDate
                      ? new Date(teacher.joiningDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Role:</span>
                  <span className="font-medium text-slate-900 ml-auto capitalize">
                    Faculty
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Profile Information</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: teacher?.user?.fullName || "",
                      email: teacher?.user?.email || "",
                      phone: teacher?.phone || "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="Enter phone number"
              />
            </div>

            <Separator />

            {/* Account Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Account Status
              </h3>
              <p className="text-sm text-slate-600">
                Your account is <span className="font-medium text-emerald-600">active</span>.
                You have full access to all teacher features including batch management,
                assessments, and student analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAccount;
