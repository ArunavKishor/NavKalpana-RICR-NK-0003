import React from "react";

const Avatar = ({ name, email, src, size = "md", className = "" }) => {
    const getInitials = (n) => {
        if (!n) return "?";
        const parts = n.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return n.slice(0, 2).toUpperCase();
    };

    const getBackgroundColor = (n) => {
        const colors = [
            "bg-blue-500",
            "bg-emerald-500",
            "bg-violet-500",
            "bg-amber-500",
            "bg-rose-500",
            "bg-cyan-500",
            "bg-indigo-500",
            "bg-orange-500",
        ];
        if (!n) return colors[0];
        let hash = 0;
        for (let i = 0; i < n.length; i++) {
            hash = n.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-xl",
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover shrink-0 ${className}`}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                }}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${getBackgroundColor(name || email)} ${className}`}
        >
            {getInitials(name || email)}
        </div>
    );
};

export default Avatar;
