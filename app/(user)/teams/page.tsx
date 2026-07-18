"use client";

import React, { useEffect, useState } from "react";
import { TeamType } from "@/types/teamType";
import PageHeader from "@/components/PageHeader";
import SimpleTable from "@/components/SimpleTable";
import TeamLogo from "@/components/TeamLogo";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeamForSquad, setSelectedTeamForSquad] = useState<TeamType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const teamRes = await fetch("/api/team");
        const playerRes = await fetch("/api/player");
        
        if (teamRes.ok && playerRes.ok) {
          const teamData = await teamRes.json();
          const playerData = await playerRes.json();
          setTeams(teamData);
          setPlayers(playerData);
        }
      } catch (err) {
        console.error("Error loading squad listings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        <div className="relative w-full">
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

        
      </div>

      {/* Teams Presentational Directory */}
      {loading ? (
        <Loader variant="table" />
      ) : (
        <SimpleTable
          headers={["Logo", "Club Name"]}
          isEmpty={filteredTeams.length === 0}
        >
          {filteredTeams.map((team) => (
            <tr
              key={team._id}
              onClick={() => setSelectedTeamForSquad(team)}
              className="hover:bg-zinc-50/75 transition-colors group cursor-pointer"
            >
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
      )}

      {/* Squad Modal */}
      <Modal
        isOpen={!!selectedTeamForSquad}
        onClose={() => setSelectedTeamForSquad(null)}
        title={selectedTeamForSquad ? `${selectedTeamForSquad.name}` : "Squad"}
        size="md"
      >
        <div className="flex flex-col gap-4 text-left">
          {players.filter((p) => {
            const teamId = p.team?._id || (typeof p.team === "string" ? p.team : "");
            return selectedTeamForSquad && teamId === selectedTeamForSquad._id;
          }).length === 0 ? (
            <p className="text-zinc-500 text-xs italic text-center py-6">No players registered under this team squad yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 bg-white rounded-xl border border-zinc-200 overflow-hidden">
              {players
                .filter((p) => {
                  const teamId = p.team?._id || (typeof p.team === "string" ? p.team : "");
                  return selectedTeamForSquad && teamId === selectedTeamForSquad._id;
                })
                .map((p) => (
                  <div key={p._id} className="px-4 py-3 flex justify-between items-center text-sm font-semibold text-zinc-800">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{p.role}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}