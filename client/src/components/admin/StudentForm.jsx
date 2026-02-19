import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const StudentForm = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    errors = {},
}) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        status: "active",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.user?.fullName || initialData.fullName || "",
                email: initialData.user?.email || initialData.email || "",
                password: "", // Never populate password for security
                phone: initialData.phone || "",
                status: initialData.status || "active",
            });
        } else {
            setFormData({
                fullName: "",
                email: "",
                password: "",
                phone: "",
                status: "active",
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
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Student's name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                )}
            </div>

            {!initialData && (
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    name="phone"
                    placeholder="Contact number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                )}
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
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
                        "Update Student"
                    ) : (
                        "Create Student"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default StudentForm;
