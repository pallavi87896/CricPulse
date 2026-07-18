"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import SimpleTable from "@/components/SimpleTable";
import Modal from "@/components/Modal";
import Input, { Select } from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { PlayerType } from "@/types/playerType";
import { TeamType } from "@/types/teamType";

export default function PlayersPage() {
  // Modal and Confirmation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Selected items
  const [editingPlayer, setEditingPlayer] = useState<PlayerType | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form inputs
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);

  // Form errors
  const [nameError, setNameError] = useState("");
  const [teamError, setTeamError] = useState("");

  const roleOptions = [
    { label: "Batsman", value: "Batsman" },
    { label: "Bowler", value: "Bowler" },
    { label: "All-Rounder", value: "All-Rounder" },
    { label: "Wicket Keeper", value: "Wicket Keeper" },
  ];

  const teamOptions = teams.map((team) => ({
    label: team.name,
    value: team._id,
  }));

  const handleAdd = () => {
    setEditingPlayer(null);
    setName("");
    setRole("Batsman");
    setTeam(teams[0]?._id || "");
    setNameError("");
    setTeamError("");
    setIsModalOpen(true);
  };

  const handleEdit = (player: PlayerType) => {
    setEditingPlayer(player);
    setName(player.name);
    setRole(player.role || "Batsman");
    setTeam(
      player.team?._id ||
        (typeof player.team === "string" ? player.team : "")
    );
    setNameError("");
    setTeamError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Player name is required");
      return;
    }
    if (!team.trim()) {
      setTeamError("Team selection is required");
      return;
    }

    if (editingPlayer) {
      await updatedPlayer(editingPlayer._id);
    } else {
      await createdPlayer();
    }

    setIsModalOpen(false);
    setEditingPlayer(null);
    setName("");
    setRole("");
    setTeam("");
  };

  const handleDelete = (id: string) => {
    setDeletingPlayerId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingPlayerId) {
      await deletedPlayer(deletingPlayerId);
      setDeletingPlayerId(null);
      setIsConfirmOpen(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/player");
      const data = await res.json();
      if (!res.ok) throw new Error("cannot get players");
      setPlayers(data);

      const resTeams = await fetch("/api/team");
      const dataTeams = await resTeams.json();
      if (!resTeams.ok) throw new Error("cannot get teams");
      setTeams(dataTeams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updatedPlayer = async (id: string) => {
    try {
      const res = await fetch("/api/player", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          role,
          team,
        }),
      });

      if (!res.ok) {
        throw new Error("failed to update player");
      }

      const updated = await res.json();
      setNameError("");
      setTeamError("");
      setPlayers((prev) =>
        prev.map((player) => (player._id === updated._id ? updated : player))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deletedPlayer = async (id: string) => {
    try {
      const res = await fetch("/api/player", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("failed to delete player");
      }

      setPlayers((prev) => prev.filter((player) => player._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const createdPlayer = async () => {
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          role,
          team,
        }),
      });

      if (!res.ok) {
        throw new Error("failed to create player");
      }

      const newPlayer = await res.json();
      setNameError("");
      setTeamError("");
      setPlayers((prev) => [...prev, newPlayer]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.role || "All-Rounder").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.team?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="player-form">
        {editingPlayer ? "Save Changes" : "Add Player"}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Players Registry"
        description="Configure roles, profiles, and team affiliations of the players."
        actions={
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={teams.length === 0}
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Player
          </Button>
        }
      />

      {/* Search Bar */}
      {teams.length > 0 && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search players..."
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

        
        </div>
      )}

      {loading ? (
        <Loader variant="table" />
      ) : teams.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <svg
            className="w-12 h-12 mx-auto text-zinc-300 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <h3 className="text-sm font-bold text-zinc-900">No teams available</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Please register a Participating Team before adding any players.
          </p>
        </div>
      ) : (
        <SimpleTable
          headers={["Player", "Role", "Club ", "Actions"]}
          isEmpty={filteredPlayers.length === 0}
        >
          {filteredPlayers.map((player) => (
            <tr key={player._id} className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-950">
                {player.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-bold text-xs uppercase tracking-wider">
                {player.role || "All-Rounder"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-900">
                <div className="flex items-center gap-2">
                  <TeamLogo logo={player.team?.logo} name={player.team?.name} size="sm" />
                  <span className="font-medium text-zinc-800">{player.team?.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-48">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(player)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(player._id)}
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
        title={editingPlayer ? "Modify Player Details" : "Register Player"}
        footer={formFooter}
        size="sm"
      >
        <form
          id="player-form"
          onSubmit={handleSave}
          className="flex flex-col gap-4 text-left"
        >
          <Input
            label="Full Name"
            placeholder="e.g. Virat Kohli"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
          />

          <Select
            label="Skill Profile / Role"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <Select
            label="Associated Club / Team"
            options={teamOptions}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            error={teamError}
          />
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Player Record"
        message="Are you sure you want to delete this player? This will remove them from the database. Scoring averages and historical stats associated with this player ID will no longer resolve."
      />
    </div>
  );
}
