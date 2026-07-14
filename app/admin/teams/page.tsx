"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import SimpleTable from "@/components/SimpleTable";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";
import TeamLogo, { logoPresets, LogoPreset } from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { TeamType } from "@/types/teamType";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeamForSquad, setSelectedTeamForSquad] = useState<TeamType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals & confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamType | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string>("");
  const [customLogoMode, setCustomLogoMode] = useState(false);
  const [customLogoText, setCustomLogoText] = useState("");
  
  // Validation errors
  const [nameError, setNameError] = useState("");

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("failed to get teams");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/player");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const handleAdd = () => {
    setEditingTeam(null);
    setName("");
    setLogo("default-shield");
    setCustomLogoMode(false);
    setCustomLogoText("");
    setNameError("");
    setIsModalOpen(true);
  };

  const handleEdit = (team: TeamType) => {
    setEditingTeam(team);
    setName(team.name);
    setNameError("");

    const isBuiltIn = Object.keys(logoPresets).includes(team.logo || "");
    if (isBuiltIn || !team.logo) {
      setLogo(team.logo || "default-shield");
      setCustomLogoMode(false);
      setCustomLogoText("");
    } else {
      setLogo("custom");
      setCustomLogoMode(true);
      setCustomLogoText(team.logo);
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingTeamId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeamId) return;

    try {
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deletingTeamId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Failed to delete team");
      }

      setTeams((prev) => prev.filter((team) => team._id !== deletingTeamId));
      setIsConfirmOpen(false);
      setDeletingTeamId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Team name is required");
      return;
    }

    const finalLogo = customLogoMode ? customLogoText.trim() : logo;

    try {
      const isEdit = !!editingTeam;
      const res = await fetch("/api/team", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTeam?._id,
          name: name.trim(),
          logo: finalLogo || "default-shield",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Failed to save team");
      }

      setIsModalOpen(false);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="team-form">
        {editingTeam ? "Save Changes" : "Create Team"}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Participating Teams"
        description="View and configure registered cricket teams, club groups, and tournament franchises competing in the league."
        actions={
          <Button variant="primary" onClick={handleAdd}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Team
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]"
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

      {/* Table Presentation */}
      {loading ? (
        <Loader variant="table" />
      ) : (
        <SimpleTable
          headers={["Logo Insignia", "Club Name", "Actions"]}
          isEmpty={filteredTeams.length === 0}
        >
          {filteredTeams.map((team) => (
            <tr
              key={team._id}
              onClick={() => setSelectedTeamForSquad(team)}
              className="hover:bg-zinc-50/75 transition-colors cursor-pointer group"
            >
              {/* Logo Display */}
              <td className="px-6 py-3 whitespace-nowrap w-36 text-center select-none bg-zinc-50/30 group-hover:bg-zinc-50 border-r border-zinc-100">
                <TeamLogo logo={team.logo} name={team.name} size="sm" />
              </td>

              {/* Club Name */}
              <td className="px-6 py-3 whitespace-nowrap font-bold text-zinc-900 text-base tracking-tight">
                {team.name}
              </td>

              {/* Edit/Delete Actions */}
              <td className="px-6 py-3 whitespace-nowrap w-48">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(team);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(team._id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </SimpleTable>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? "Modify Team Profile" : "Register New Team"}
        footer={modalFooter}
        size="lg"
      >
        <form id="team-form" onSubmit={handleSave} className="flex flex-col gap-5 text-left">
          <Input
            label="Club / Franchise Name"
            placeholder="e.g. Mumbai Mavericks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
          />

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Team Identity insignia
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {(Object.keys(logoPresets) as LogoPreset[]).map((presetKey) => {
                const preset = logoPresets[presetKey];
                const isSelected = !customLogoMode && logo === presetKey;

                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => {
                      setCustomLogoMode(false);
                      setLogo(presetKey);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-secondary)]/50 ring-2 ring-[var(--color-brand-primary)]"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="w-8 h-8 mb-1">
                      {preset.icon}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-650 truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom option toggle */}
            <div className="flex items-center gap-2 border-t border-zinc-150 pt-3">
              <input
                type="checkbox"
                id="custom-logo-toggle"
                checked={customLogoMode}
                onChange={(e) => {
                  setCustomLogoMode(e.target.checked);
                  if (e.target.checked) {
                    setLogo("custom");
                  } else {
                    setLogo("default-shield");
                  }
                }}
                className="h-4 w-4 rounded border-zinc-300 text-[var(--color-brand-accent)] focus:ring-[var(--color-brand-primary)]"
              />
              <label htmlFor="custom-logo-toggle" className="text-xs font-bold text-zinc-600 cursor-pointer">
                Use custom emoji or web image URL instead
              </label>
            </div>

            {customLogoMode && (
              <div className="mt-3 animate-fadeIn">
                <Input
                  placeholder="e.g. 🦁 or https://link.to/my-image.png"
                  value={customLogoText}
                  onChange={(e) => setCustomLogoText(e.target.value)}
                  label="Custom Emoji / Logo Image URL"
                />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Disband Team Squad"
        message="Are you sure you want to delete this team squad? This will remove them from the tournament registration database. Players affiliated with this team will lose their team association."
      />

      {/* Squad Modal */}
      <Modal
        isOpen={!!selectedTeamForSquad}
        onClose={() => setSelectedTeamForSquad(null)}
        title={selectedTeamForSquad ? `${selectedTeamForSquad.name} - Squad Roster` : "Squad"}
        size="md"
      >
        <div className="flex flex-col gap-4 text-left">
          {players.filter((p) => {
            const teamId = p.team?._id || (typeof p.team === "string" ? p.team : "");
            return selectedTeamForSquad && teamId === selectedTeamForSquad._id;
          }).length === 0 ? (
            <p className="text-zinc-500 text-xs italic text-center py-6">No players registered under this team squad yet.</p>
          ) : (
            <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 bg-white">
              {players.filter((p) => {
                const teamId = p.team?._id || (typeof p.team === "string" ? p.team : "");
                return selectedTeamForSquad && teamId === selectedTeamForSquad._id;
              }).map((player) => (
                <div key={player._id} className="p-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800">{player.name}</span>
                  <span className="font-semibold text-zinc-500 uppercase bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                    {player.role || "All-Rounder"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}