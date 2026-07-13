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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid credentials provided");
      }

      // On success, redirect straight to the admin control desk
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-zinc-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="bg-[var(--color-brand-secondary)] p-2 rounded-lg border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-accent)] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-sans font-black text-2xl tracking-tight text-zinc-900">
              Cric<span className="text-[var(--color-brand-accent)]">Pulse</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            Control Portal Login
          </h2>
          <p className="text-xs text-zinc-400 font-medium max-w-xs">
            Authorized management credentials required to mutate scorecards, players, or active fixtures.
          </p>
        </div>

        {/* Main Interactive Container */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 font-semibold rounded-lg flex items-center gap-2 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Username Input Group */}
            <div>
              <label htmlFor="username" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. core_admin"
                disabled={loading}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all font-medium"
              />
            </div>

            {/* Password Input Group */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
              />
            </div>

            {/* Submission Gate */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full justify-center font-bold text-xs py-2.5 shadow-sm"
              >
                {loading ? "Authenticating Platform Keys..." : "Verify Identity"}
              </Button>
            </div>
          </form>
        </div>

        {/* Dynamic Return Navigation Footprint */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-600 font-medium transition-colors gap-1">
            ← Cancel and return to Live Hub
          </Link>
        </div>
      </div>
    </div>
  );
}