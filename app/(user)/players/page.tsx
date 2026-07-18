"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import SimpleTable from "@/components/SimpleTable";
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
        <div className="relative w-full">
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
      </div>

      {/* Players Directory Table */}
      {loading ? (
        <Loader variant="table" />
      ) : (
        <SimpleTable
          headers={["Player Name", "Skill / Role", "Associated Club"]}
          isEmpty={filteredPlayers.length === 0}
        >
          {filteredPlayers.map((player) => (
            <tr key={player._id} className="hover:bg-zinc-50/50 transition-colors">
              {/* Player Name */}
              <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-900 text-base">
                {player.name}
              </td>
              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-zinc-500">
                {player.role || "All-Rounder"}
              </td>
              {/* Associated Club */}
              <td className="px-6 py-4 whitespace-nowrap text-zinc-900">
                <div className="flex items-center gap-2">
                  <TeamLogo logo={player.team?.logo} name={player.team?.name} size="sm" />
                  <span className="font-semibold text-zinc-700">{player.team?.name || "Independent"}</span>
                </div>
              </td>
            </tr>
          ))}
        </SimpleTable>
      )}
    </div>
  );
}
