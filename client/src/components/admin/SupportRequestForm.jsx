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

const SupportRequestForm = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    students = [],
    errors = {},
}) => {
    const [formData, setFormData] = useState({
        student: "",
        subject: "",
        description: "",
        category: "technical",
        priority: "medium",
        status: "open",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                student: initialData.student?._id || initialData.student || "",
                subject: initialData.subject || "",
                description: initialData.description || "",
                category: initialData.category || "technical",
                priority: initialData.priority || "medium",
                status: initialData.status || "open",
            });
        } else {
            setFormData({
                student: "",
                subject: "",
                description: "",
                category: "technical",
                priority: "medium",
                status: "open",
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                <Label>Student</Label>
                <Select
                    value={formData.student}
                    onValueChange={(value) => handleSelectChange("student", value)}
                    disabled={!!initialData}
                >
                    <SelectTrigger className={errors.student ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map((student) => (
                            <SelectItem key={student._id} value={student._id}>
                                {student.name} ({student.email})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.student && (
                    <p className="text-xs text-red-500">{errors.student}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                    id="subject"
                    name="subject"
                    placeholder="Summary of the issue"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={errors.subject ? "border-red-500" : ""}
                />
                {errors.subject && (
                    <p className="text-xs text-red-500">{errors.subject}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed explanation of the request..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className={`h-32 ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="administrative">Administrative</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) => handleSelectChange("priority", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {initialData && (
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
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

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
                        "Update Request"
                    ) : (
                        "Create Request"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default SupportRequestForm;
