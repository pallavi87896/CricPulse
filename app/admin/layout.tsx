"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-zinc-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              className="lg:hidden text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg p-2 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* App Breadcrumb */}
            <div className="flex items-center text-sm font-semibold text-zinc-900 gap-1.5">
              <span>Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-500 font-semibold">
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export default ClientLayout;
