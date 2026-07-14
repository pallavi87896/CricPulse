"use client";

import React, { useEffect, useState } from "react";
import { TeamType } from "@/types/teamType";
import PageHeader from "@/components/PageHeader";
import SimpleTable from "@/components/SimpleTable";
import TeamLogo from "@/components/TeamLogo";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getTeam = async () => {
      try {
        const res = await fetch("/api/team");
        if (!res.ok) throw new Error("failed to get teams");
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error(err);
      }
    };

    getTeam();
  }, []);

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Participating Teams"
        description="View all registered cricket teams, club groups, and tournament franchises competing in the league."
      />

      {/* User Search & Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--color-brand-primary)]"
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

        <div className="text-xs text-zinc-500 font-medium">
          Showing {filteredTeams.length} of {teams.length} tournament squads
        </div>
      </div>

      {/* Teams Presentational Directory */}
      <SimpleTable
        headers={["Logo insignia", "Club Name"]}
        isEmpty={filteredTeams.length === 0}
      >
        {filteredTeams.map((team) => (
          <tr key={team._id} className="hover:bg-zinc-50/75 transition-colors group">
            {/* Logo Display */}
            <td className="px-6 py-3.5 whitespace-nowrap w-28 text-center select-none bg-zinc-50/30 group-hover:bg-zinc-50 border-r border-zinc-100 flex items-center justify-center">
              <TeamLogo logo={team.logo} name={team.name} size="sm" />
            </td>
            
            {/* Club Name */}
            <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-900 text-lg tracking-tight">
              {team.name}
            </td>
          </tr>
        ))}
      </SimpleTable>
    </div>
  );
}