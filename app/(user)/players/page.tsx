"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { PlayerType } from "@/types/playerType";

export default function UserPlayersPage() {
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/player");
      if (!res.ok) throw new Error("Failed to fetch players database");
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filter players based on search query
  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="League Players"
        description="Browse player rosters, team assignments, and performance roles across all registered club groups."
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search players, roles, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] font-medium"
          />
          <svg
            className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-zinc-500 font-semibold">
          Showing {filteredPlayers.length} of {players.length} active athletes
        </div>
      </div>

      {/* Players Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Loader variant="card" />
          <Loader variant="card" />
          <Loader variant="card" />
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-250 rounded-2xl bg-zinc-50/50">
          <svg
            className="w-12 h-12 mx-auto text-zinc-300 mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <h3 className="text-sm font-bold text-zinc-900">No players found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            No player match the specified search queries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player) => (
            <div
              key={player._id}
              className="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              <div className="flex flex-col gap-1 text-left">
                <h4 className="font-extrabold text-zinc-900 text-lg leading-tight">
                  {player.name}
                </h4>
                <span className="text-[10px] font-bold text-[var(--color-brand-primary)] bg-[var(--color-brand-secondary)]/50 px-2 py-0.5 rounded-md uppercase tracking-wider w-max">
                  {player.role || "All-Rounder"}
                </span>
                
                {/* Team Info row */}
                <div className="flex items-center gap-1.5 mt-2">
                  <TeamLogo logo={player.team?.logo} name={player.team?.name} size="sm" />
                  <span className="text-xs font-bold text-zinc-650 truncate max-w-[150px]">
                    {player.team?.name || "Independent"}
                  </span>
                </div>
              </div>

              {/* Decorative Cap/Cricket graphic */}
              <div className="bg-zinc-50 border border-zinc-150 p-2.5 rounded-xl text-zinc-400 select-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
