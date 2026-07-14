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
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (variant === "spinner") {
    return (
      <div className={`flex justify-center items-center py-6 ${className}`}>
        <svg
          className={`animate-spin text-brand-accent ${sizeClasses[size]}`}
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
  }

  if (variant === "text") {
    return (
      <div className={`animate-pulse space-y-2 py-2 ${className}`}>
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-md w-3/4"></div>
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/2"></div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`animate-pulse border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900/50 space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/3" />
            <div className="h-2 bg-zinc-100/55 dark:bg-zinc-850 rounded-md w-1/4" />
          </div>
          <div className="w-16 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        </div>
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/2" />
          <div className="h-3 bg-zinc-100/55 dark:bg-zinc-850 rounded-md w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`animate-pulse border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40 ${className}`}>
        <div className="h-12 bg-zinc-50/70 dark:bg-zinc-900/80 border-b border-zinc-150 dark:border-zinc-800 px-6 flex items-center gap-4">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/4" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/6" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/6" />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-850 px-6">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 flex items-center gap-4">
              <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/3" />
              <div className="h-3.5 bg-zinc-100/55 dark:bg-zinc-850 rounded-md w-1/5" />
              <div className="h-3.5 bg-zinc-100/55 dark:bg-zinc-850 rounded-md w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default Loader;
