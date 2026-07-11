import React from "react";

interface BadgeProps {
  status: "Live" | "Upcoming" | "Ended" | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = "" }) => {
  const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border";
  
  let statusClasses = "";
  switch (status) {
    case "Live":
      statusClasses = "bg-green-50 text-green-700 border-green-200";
      break;
    case "Upcoming":
      statusClasses = "bg-zinc-50 text-zinc-600 border-zinc-200";
      break;
    case "Ended":
      statusClasses = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    default:
      statusClasses = "bg-zinc-50 text-zinc-600 border-zinc-200";
  }

  return (
    <span className={`${baseClasses} ${statusClasses} ${className}`}>
      {status === "Live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
      )}
      {status}
    </span>
  );
};
export default Badge;
