"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Teams",
      href: "/admin/teams",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
    },
    {
      name: "Players",
      href: "/admin/players",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Matches",
      href: "/admin/matches",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Live Match",
      href: "/admin/live-match",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      
      const res = await fetch("/api/auth/logout",{
        method: "POST",
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error("cannot logout")
      }
      
      setIsOpen(false);
      router.push("/admin/login");
      
    } catch (err) {
      console.error("Logout execution fault:", err);
    }
  };

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-zinc-200 flex items-center gap-2.5">
          <div className="bg-brand-accent text-white p-1.5 rounded-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" className="opacity-30" />
              <path d="M3 12h3.5l1.5-3.5L10 16.5l2-9.5 2 11.5 1.5-5.5L19 12h2" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-zinc-900 text-base leading-none block">CricPulse</span>
            <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Score Admin</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  isActive
                    ? "bg-brand-secondary text-brand-accent"
                    : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <span className={isActive ? "text-brand-accent" : "text-zinc-400"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Tray Container (Logout) */}
        <div className="px-4 py-3 border-t border-zinc-100 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors group text-left"
          >
            <span className="text-red-400 group-hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Exit Terminal
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-150 bg-zinc-50/70 text-xs text-zinc-550 flex items-center justify-between">
          <span>System status</span>
          <div className="flex items-center gap-1.5 font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;