"use client";

import React from "react";

export type LogoPreset =
  | "default-shield"
  | "bat-ball"
  | "helmet"
  | "wickets"
  | "trophy"
  | "stadium"
  | "gloves"
  | "ball";

interface TeamLogoProps {
  logo?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const logoPresets: Record<LogoPreset, { name: string; icon: React.ReactNode }> = {
  "default-shield": {
    name: "Classic Shield",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="text-zinc-200 fill-zinc-900/30" />
        <path d="M14.7 9.3a1 1 0 0 0-1.4 0L12 10.6 10.7 9.3a1 1 0 0 0-1.4 1.4l1.3 1.3-1.3 1.3a1 1 0 1 0 1.4 1.4l1.3-1.3 1.3 1.3a1 1 0 0 0 1.4-1.4L13.4 12l1.3-1.3a1 1 0 0 0 0-1.4z" className="text-[var(--color-brand-primary)] fill-[var(--color-brand-primary)]" />
        <circle cx="12" cy="12" r="8" className="text-[var(--color-brand-accent)]" />
      </svg>
    ),
  },
  "bat-ball": {
    name: "Bats & Ball",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <line x1="4" y1="20" x2="16" y2="8" className="text-amber-750" strokeWidth="2.5" />
        <line x1="2" y1="22" x2="6" y2="18" className="text-amber-805" strokeWidth="3" />
        <line x1="20" y1="4" x2="8" y2="16" className="text-amber-750" strokeWidth="2.5" />
        <line x1="22" y1="2" x2="18" y2="6" className="text-amber-805" strokeWidth="3" />
        <circle cx="12" cy="12" r="3.5" className="text-red-600 fill-red-500" />
        <circle cx="12" cy="12" r="1.5" className="text-white fill-white" />
      </svg>
    ),
  },
  "helmet": {
    name: "Iron Helmet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 2.24.74 4.3 2 5.97V22h4v-3h8v3h4v-4.03c1.26-1.67 2-3.73 2-5.97 0-5.52-4.48-10-10-10z" className="text-zinc-650 fill-zinc-700/20" />
        <path d="M6 14h12" className="text-zinc-400" />
        <path d="M7 16h10" className="text-zinc-400" />
        <path d="M9 18h6" className="text-zinc-400" />
        <circle cx="8" cy="9" r="1" className="text-[var(--color-brand-primary)] fill-[var(--color-brand-primary)]" />
        <circle cx="16" cy="9" r="1" className="text-[var(--color-brand-primary)] fill-[var(--color-brand-primary)]" />
      </svg>
    ),
  },
  "wickets": {
    name: "Bails & Stumps",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="6" y="2" width="12" height="2" rx="0.5" className="text-amber-800 fill-amber-700" />
        <line x1="8" y1="4" x2="8" y2="22" className="text-amber-600" strokeWidth="2" />
        <line x1="12" y1="4" x2="12" y2="22" className="text-amber-600" strokeWidth="2" />
        <line x1="16" y1="4" x2="16" y2="22" className="text-amber-600" strokeWidth="2" />
      </svg>
    ),
  },
  "trophy": {
    name: "Golden Cup",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" className="text-yellow-600" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" className="text-yellow-600" />
        <path d="M4 22h16" className="text-zinc-500" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" className="text-zinc-400" />
        <path d="M12 2a6 6 0 0 1 6 6c0 3.61-2.7 6.19-6 6.66a6.66 6.66 0 0 1-6-6.66A6 6 0 0 1 12 2z" className="text-yellow-550 fill-yellow-500/20" />
        <polygon points="12 5 13.5 8 16.5 8 14 10 15 13 12 11 9 13 10 10 7.5 8 10.5 8" className="text-yellow-400 fill-yellow-400" />
      </svg>
    ),
  },
  "stadium": {
    name: "Oval Stadium",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <ellipse cx="12" cy="12" rx="10" ry="6" className="text-[var(--color-brand-primary)] fill-[var(--color-brand-secondary)]/30" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="7" ry="4" className="text-[var(--color-brand-accent)]" />
        <line x1="12" y1="8" x2="12" y2="16" className="text-white/80" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1" className="text-white fill-white" />
      </svg>
    ),
  },
  "gloves": {
    name: "Cricket Gloves",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="5" y="8" width="6" height="12" rx="1.5" className="text-zinc-400 fill-zinc-200" />
        <rect x="13" y="8" width="6" height="12" rx="1.5" className="text-zinc-400 fill-zinc-200" />
        <path d="M5 12h6M13 12h6M5 16h6M13 16h6" className="text-zinc-350" />
        <circle cx="8" cy="5" r="1" className="text-[var(--color-brand-accent)] fill-[var(--color-brand-accent)]" />
        <circle cx="16" cy="5" r="1" className="text-[var(--color-brand-accent)] fill-[var(--color-brand-accent)]" />
      </svg>
    ),
  },
  "ball": {
    name: "Seamed Ball",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" className="text-red-700 fill-red-600" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20M11 2a14.5 14.5 0 0 0 0 20M13 2a14.5 14.5 0 0 0 0 20" className="text-white/60" strokeDasharray="1,1" strokeWidth="1.5" />
      </svg>
    ),
  },
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo = "default-shield",
  name = "Team",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
  };

  const isPreset = (key: string): key is LogoPreset => {
    return key in logoPresets;
  };

  const renderLogoContent = () => {
    const trimmedLogo = logo ? logo.trim() : "";

    if (!trimmedLogo) {
      return logoPresets["default-shield"].icon;
    }

    if (isPreset(trimmedLogo)) {
      return logoPresets[trimmedLogo].icon;
    }

    // Check if it's an emoji
    let isEmoji = false;
    try {
      isEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/u.test(trimmedLogo) && trimmedLogo.length <= 4;
    } catch (e) {
      // Fallback regex if browser/environment doesn't support unicode property escapes
      isEmoji = /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/.test(trimmedLogo) && trimmedLogo.length <= 4;
    }

    // Check if it looks like an image URL or has a file extension dot
    if (
      trimmedLogo.includes(".") ||
      trimmedLogo.startsWith("/") ||
      trimmedLogo.startsWith("http://") ||
      trimmedLogo.startsWith("https://")
    ) {
      const srcPath = trimmedLogo.startsWith("http") || trimmedLogo.startsWith("/") ? trimmedLogo : `/${trimmedLogo}`;
      return (
        <img
          src={srcPath}
          alt={`${name} Logo`}
          className="w-full h-full object-contain rounded-full"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-zinc-350">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" class="fill-zinc-100 text-zinc-300" />
                </svg>
              `;
            }
          }}
        />
      );
    }

    if (isEmoji) {
      return (
        <span className="font-bold select-none text-center">
          {trimmedLogo}
        </span>
      );
    }

    // Otherwise, treat arbitrary text like "yo" as invalid logo name, fallback to clean shield icon
    return logoPresets["default-shield"].icon;
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-zinc-50 border border-zinc-200/80 p-2 shadow-xs transition-transform hover:scale-102 ${sizeClasses[size]} ${className}`}
    >
      {renderLogoContent()}
    </div>
  );
};

export default TeamLogo;
