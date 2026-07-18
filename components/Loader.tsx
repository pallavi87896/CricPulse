"use client";

import React from "react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "text" | "card" | "table";
}

export const Loader: React.FC<LoaderProps> = ({
  className = "",
  size = "md",
  variant = "spinner",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <svg
        className={`animate-spin text-brand-accent ${sizeClasses[size] || sizeClasses.md}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export default Loader;
