import React, { useRef, useState } from "react";
import { MdOutlineCameraAlt, MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import api from "@/config/Api";

/**
 * ImageUploadComponent
 * Reusable component for uploading images/videos to Cloudinary
 *
 * Props:
 * - imageUrl: Current image URL
 * - onUploadSuccess: Callback when upload succeeds (receives new URL)
 * - type: "avatar" | "cover" | "submission" (default: "avatar")
 * - acceptedFormats: Array of accepted file types (default: ["image/jpeg", "image/png", "image/gif"])
 * - maxSize: Max file size in MB (default: 5)
 */

const ImageUploadComponent = ({
  imageUrl,
  onUploadSuccess,
  type = "avatar",
  acceptedFormats = ["image/jpeg", "image/png", "image/gif"],
  maxSize = 5,
  endpoint = "/api/students/me/upload-photo", // Can be customized per use case
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hoverOpacity, setHoverOpacity] = useState(0);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats.map((f) => f.split("/")[1]).join(", ");
      toast.error(`Only ${formats} files allowed`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size should be less than ${maxSize}MB`);
      return;
    }

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.data?.fileUrl) {
        onUploadSuccess(response.data.data.fileUrl);
        toast.success("Upload successful!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Size classes based on type
  const sizeClasses = {
    avatar: "w-32 h-32",
    cover: "w-full h-40",
    submission: "w-48 h-48",
  };

  return (
    <div className="relative inline-block">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedFormats.join(",")}
        className="hidden"
        disabled={uploading}
      />

      {/* Image Container */}
      <div
        className={`${sizeClasses[type]} relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer transition-all`}
        onMouseEnter={() => setHoverOpacity(1)}
        onMouseLeave={() => setHoverOpacity(0)}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {/* Image/Video Preview */}
        {imageUrl ? (
          <>
            {type === "submission" && imageUrl.includes("video") ? (
              <video
                src={imageUrl}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            )}
          </>
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">No image</p>
          </div>
        )}

        {/* Overlay on Hover */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            hoverOpacity === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center">
            <MdOutlineCameraAlt
              className={`text-white text-4xl mb-2 transition-transform ${
                uploading ? "animate-spin" : ""
              }`}
            />
            <span className="text-white text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload"}
            </span>
          </div>
        </div>

        {/* Camera Icon Always Visible on Rim */}
        <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
          <MdOutlineCameraAlt className="text-indigo-600 text-2xl" />
        </div>
      </div>

      {/* Loading Indicator */}
      {uploading && (
        <div className="absolute inset-0 rounded-lg border-2 border-indigo-500 animate-pulse" />
      )}
    </div>
  );
};

export default ImageUploadComponent;
