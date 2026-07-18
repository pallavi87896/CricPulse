"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Teams", href: "/teams" },
    { name: "Players", href: "/players" },
  ];

  return (
    <nav className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              {/* Cricket Inspired Brand Icon / Pulse Logo */}
              <div className="bg-[var(--color-brand-secondary)] p-2 rounded-lg border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-accent)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" className="opacity-30" />
                  <path d="M3 12h3.5l1.5-3.5L10 16.5l2-9.5 2 11.5 1.5-5.5L19 12h2" />
                </svg>
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-zinc-900">
                Cric<span className="text-[var(--color-brand-accent)]">Pulse</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 h-16 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? "border-[var(--color-brand-accent)] text-zinc-900"
                        : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-200"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Elements */}
          <div className="hidden sm:flex sm:items-center gap-4">

            {/* Admin Login Button */}
            <Link href="/admin/login">
              <button className="inline-flex items-center justify-center px-3.5 py-1.5 border border-zinc-200 text-xs font-bold rounded-lg text-zinc-600 bg-white hover:text-zinc-950 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                Admin Login
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-zinc-50 border-t border-zinc-200" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "bg-[var(--color-brand-secondary)] text-[var(--color-brand-dark)] font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Admin Action Section */}
            <div className="pt-4 pb-2 border-t border-zinc-200 mt-2">
              <Link
                href="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors shadow-sm"
              >
                Admin Login Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}