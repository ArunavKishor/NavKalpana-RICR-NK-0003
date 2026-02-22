import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const AssessmentForm = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    batches = [],
    errors = {},
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "assignment",
        batch: "",
        dueDate: "",
        totalMarks: 1,
        status: "draft",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                type: initialData.type || "assignment",
                batch: initialData.batch?._id || initialData.batch || "",
                dueDate: initialData.dueDate
                    ? new Date(initialData.dueDate).toISOString().split("T")[0]
                    : "",
                totalMarks: initialData.totalMarks || 1,
                status: initialData.status || "draft",
            });
        } else {
            setFormData({
                title: "",
                description: "",
                type: "assignment",
                batch: "",
                dueDate: "",
                totalMarks: 1,
                status: "draft",
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "totalMarks" ? Number(value) : value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. React Fundamentals Quiz"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about the assessment..."
                    value={formData.description}
                    onChange={handleChange}
                    className="h-24"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Assessment Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Assign to Batch</Label>
                    <Select
                        value={formData.batch}
                        onValueChange={(value) => handleSelectChange("batch", value)}
                    >
                        <SelectTrigger className={errors.batch ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((batch) => (
                                <SelectItem key={batch._id} value={batch._id}>
                                    {batch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.batch && <p className="text-xs text-red-500">{errors.batch}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className={errors.dueDate ? "border-red-500" : ""}
                    />
                    {errors.dueDate && (
                        <p className="text-xs text-red-500">{errors.dueDate}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                        id="totalMarks"
                        name="totalMarks"
                        type="number"
                        min="1"
                        value={formData.totalMarks}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
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
                        "Update Assessment"
                    ) : (
                        `Create ${formData.type === "quiz" ? "Quiz" : "Assignment"}`
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AssessmentForm;
