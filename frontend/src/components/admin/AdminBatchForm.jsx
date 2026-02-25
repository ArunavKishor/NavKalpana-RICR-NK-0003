import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/config/Api";

const BatchForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  errors = {},
}) => {
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    batchType: "regular",
    startDate: "",
    endDate: "",
    instructor: "",
    schedule: "",
    maxStudents: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await api.get("/api/teachers");
        const teachersList = response.data?.data?.teachers || [];
        setTeachers(teachersList);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Handle instructor field - could be an object, string ID, or null/undefined
      let instructorValue = "";
      if (initialData.instructor) {
        // If instructor is an object (populated), get its _id
        if (
          typeof initialData.instructor === "object" &&
          initialData.instructor._id
        ) {
          instructorValue = initialData.instructor._id;
        }
        // If instructor is a string (ObjectId), use it directly
        else if (typeof initialData.instructor === "string") {
          instructorValue = initialData.instructor;
        }
      }

      setFormData({
        name: initialData.name || "",
        course: initialData.course || "",
        batchType: initialData.batchType || "regular",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        instructor: instructorValue,
        schedule: initialData.schedule || "",
        maxStudents: initialData.maxStudents || 1,
      });
    } else {
      setFormData({
        name: "",
        course: "",
        startDate: "",
        endDate: "",
        instructor: "",
        schedule: "",
        maxStudents: 1,
      });
    }
    setImageFile(null);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxStudents" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Batch Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Alpha 2024"
            value={formData.name}
            onChange={handleChange}
            required
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="course">Course Name</Label>
          <Input
            id="course"
            name="course"
            placeholder="e.g. FullStack Development"
            value={formData.course}
            onChange={handleChange}
            required
            className={errors.course ? "border-red-500" : ""}
          />
          {errors.course && (
            <p className="text-xs text-red-500">{errors.course}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchType">Batch Type</Label>
          <Select
            value={formData.batchType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, batchType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
              <SelectItem value="fast-track">Fast Track</SelectItem>
              <SelectItem value="self-paced">Self Paced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            className={errors.startDate ? "border-red-500" : ""}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
            className={errors.endDate ? "border-red-500" : ""}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500">{errors.endDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Select
            value={formData.instructor || "none"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                instructor: value === "none" ? "" : value,
              }))
            }
          >
            <SelectTrigger
              className={errors.instructor ? "border-red-500" : ""}
            >
              <SelectValue
                placeholder={
                  loadingTeachers ? "Loading teachers..." : "Select instructor"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not Assigned</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher._id} value={teacher._id}>
                  {teacher.user?.fullName || "Unknown"} ({teacher.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.instructor && (
            <p className="text-xs text-red-500">{errors.instructor}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            name="maxStudents"
            type="number"
            min="1"
            max="500"
            value={formData.maxStudents}
            onChange={handleChange}
            required
            className={errors.maxStudents ? "border-red-500" : ""}
          />
          {errors.maxStudents && (
            <p className="text-xs text-red-500">{errors.maxStudents}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule">Schedule</Label>
        <Input
          id="schedule"
          name="schedule"
          placeholder="e.g. Mon-Fri, 10 AM"
          value={formData.schedule}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Batch Cover Image (Optional)</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            "Update Batch"
          ) : (
            "Create Batch"
          )}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;
