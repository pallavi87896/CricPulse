"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid credentials provided");
      }

      // Redirect straight to the actual admin index page at /admin
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 text-zinc-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--color-brand-primary)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--color-brand-accent)]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Top Header Card */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center gap-3 group mb-2">
            <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 text-[var(--color-brand-primary)] group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" className="opacity-30" />
                <path d="M3 12h3.5l1.5-3.5L10 16.5l2-9.5 2 11.5 1.5-5.5L19 12h2" />
              </svg>
            </div>
            <span className="font-sans font-black text-3xl tracking-tight text-white">
              Cric<span className="text-[var(--color-brand-accent)]">Pulse</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
           Admin Panel
          </h2>
          <p className="text-xs text-zinc-400 font-medium max-w-xs leading-relaxed">
            Please enter your credentials to access live scoring dashboard.
          </p>
        </div>

        {/* Main Interactive Container */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 text-xs bg-red-950/40 border border-red-900/50 text-red-400 font-medium rounded-xl flex items-center gap-3 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Username Input Group */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. administrator"
                disabled={loading}
                className="w-full px-4 py-3 text-sm bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-all font-medium"
              />
            </div>

            {/* Password Input Group */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Secret Access Token
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="w-full px-4 py-3 text-sm bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-all font-mono"
              />
            </div>

            {/* Submission Gate */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full justify-center font-bold text-xs py-3 rounded-xl shadow-lg shadow-[var(--color-brand-primary)]/10"
              >
                {loading ? "Logging in" : "Verify & Access Panel"}
              </Button>
            </div>
          </form>
        </div>

        {/* Dynamic Return Navigation Footprint */}
        <div className="text-center pt-2">
          <Link href="/" className="inline-flex items-center text-xs text-zinc-500 hover:text-zinc-300 font-semibold transition-colors gap-1">
             Cancel and Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}