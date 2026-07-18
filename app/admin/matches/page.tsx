"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import SimpleTable from "@/components/SimpleTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Input, { Select } from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { MatchType } from "@/types/matchType";
import { TeamType } from "@/types/teamType";
import { MatchFormType } from "@/types/matchFormType";
import { useRouter } from "next/navigation";

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [battingTeam, setBattingTeam] = useState("");
  const [bowlingTeam, setBowlingTeam] = useState("");

  const [searchQuery,setSearchQuery] = useState("");
  // Views & Modals
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingMatch, setViewingMatch] = useState<MatchType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchType | null>(null);

  const initialFormData: MatchFormType = {
    teamA: "",
    teamB: "",
    tossWinner: "",
    tossDecision: "Bat",
    venue: "",
    overs: 20,
    dateTime: "",
    status: "Upcoming",
  };

  const [formData, setFormData] = useState(initialFormData);
  const router= useRouter();

  // Deletion confirmation
  const [isConfirmationModal, setIsConfirmationModal] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<MatchType | null>(null);

  const handleOpenView = (match: MatchType) => {
    router.push(`/admin/live-match`)
    setViewingMatch(match);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (match: MatchType) => {
    setMatchToDelete(match);
    
    setIsConfirmationModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!matchToDelete) return;
    try {
      const res = await fetch("/api/match", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id: matchToDelete._id }),
      });

      if (!res.ok) throw new Error("Match cannot be deleted");

      setIsConfirmationModal(false);
      setMatchToDelete(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMatch = () => {
    setFormData(initialFormData);
    setEditingMatch(null);
    setIsModalOpen(true);
  };

  const createMatch = async () => {
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Cannot post the match");

      setIsModalOpen(false);
      setFormData(initialFormData);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateMatch = async () => {
    if (!editingMatch) return;

    try {
      const res = await fetch("/api/match", {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id: editingMatch._id, ...formData }),
      });

      if (!res.ok) {
        throw new Error("Failed to update match");
      }

      setIsModalOpen(false);
      setEditingMatch(null);
      setFormData(initialFormData);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditMatch = (match: MatchType) => {
    setEditingMatch(match);
    setFormData({
      teamA: match.teamA?._id ?? "",
      teamB: match.teamB?._id ?? "",
      tossWinner: match.tossWinner?._id ?? "",
      tossDecision: match.tossDecision,
      venue: match.venue ?? "",
      overs: match.overs,
      dateTime: match.dateTime
        ? new Date(match.dateTime).toISOString().slice(0, 16)
        : "",
      status: match.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.teamA) {
      alert("Select Team A");
      return;
    }
    if (!formData.teamB) {
      alert("Select Team B");
      return;
    }
    if (formData.teamA === formData.teamB) {
      alert("Teams cannot be same");
      return;
    }
    if (!formData.tossWinner) {
      alert("Select toss winner");
      return;
    }

    if (editingMatch) {
      await updateMatch();
    } else {
      await createMatch();
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res1 = await fetch("/api/match");
      if (!res1.ok) throw new Error("failed to get matches");
      const data1 = await res1.json();
      setMatches(data1);

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

  useEffect(() => {
    loadData();
  }, []);

  const teamOptions =
    teams?.map((team) => ({
      value: team._id,
      label: `${team.name}`,
    })) ?? [];

  const tossWinnerOptions = [
    {
      value: formData.teamA,
      label: teams?.find((t) => t._id === formData.teamA)?.name || "",
    },
    {
      value: formData.teamB,
      label: teams?.find((t) => t._id === formData.teamB)?.name || "",
    },
  ].filter((item) => item.value);
  //keep only the options tht has a valid team id

  useEffect(() => {
    if (!formData.teamA || !formData.teamB || !formData.tossWinner) {
      setBattingTeam("");
      setBowlingTeam("");
      return;
    }

    if (formData.tossDecision === "Bat") {
      setBattingTeam(formData.tossWinner);
      setBowlingTeam(
        formData.tossWinner === formData.teamA
          ? formData.teamB
          : formData.teamA
      );
    } else {
      setBowlingTeam(formData.tossWinner);
      setBattingTeam(
        formData.tossWinner === formData.teamA
          ? formData.teamB
          : formData.teamA
      );
    }
  }, [
    formData.teamA,
    formData.teamB,
    formData.tossWinner,
    formData.tossDecision,
  ]);

  const filteredMatches = matches.filter((match)=>{
    const query = searchQuery.toLowerCase();
    const teamAName = match.teamA?.name?.toLowerCase() || "";
    const teamBName = match.teamB?.name?.toLowerCase() || "";
    const venue = match.venue?.toLowerCase() || "";

    return teamAName.includes(query) || teamBName.includes(query) || venue.includes(query);
  });

  const createFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="create-match-form">
        {editingMatch ? "Update Match" : "Create Match"}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Scheduled Matches"
        description="Schedule and configure cricket matches, including venue and starter configurations."
        actions={
          <Button variant="primary" onClick={handleAddMatch}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Match
          </Button>
        }
      />
            {/* Search & Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border w-full border-zinc-200 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--color-brand-primary)]"
          />
          <svg
            className="w-4 h-4 text-zinc-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        
      </div>



      {/* Matches List Table */}
      {loading ? (
        <Loader variant="table" />
      ) : (
        <SimpleTable
          headers={["Teams", "Status", "Date / Time", "Actions"]}
          isEmpty={filteredMatches.length === 0}
        >
          {filteredMatches.map((match) => (
            <tr
              key={match._id}
              onClick={() => handleOpenView(match)}
              className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-950">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <TeamLogo logo={match.teamA?.logo} name={match.teamA?.name ?? "Deleted Team"} size="sm" />
                    <span>{match.teamA?.name ?? "Deleted Team"}</span>
                  </div>
                  <span className="text-zinc-400 font-semibold text-xs tracking-wider">VS</span>
                  <div className="flex items-center gap-1.5">
                    <TeamLogo logo={match.teamB?.logo} name={match.teamB?.name ?? "Deleted Team"} size="sm" />
                    <span>{match.teamB?.name ?? "Deleted Team"}</span>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={match.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-medium text-sm">
                {match.dateTime
                  ? new Date(match.dateTime).toLocaleString()
                  : "Upcoming"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-48">
                <div className="flex items-center gap-2">
                  {match.status !== "Ended" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMatch(match);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(match);
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

      {/* Create Match Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatch ? "Modify Match Configuration" : "Schedule Match Fixture"}
        footer={createFooter}
        size="lg"
      >
        <form
          id="create-match-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-4 text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Team A"
              options={teamOptions}
              value={formData.teamA}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  teamA: e.target.value,
                  tossWinner: formData.tossWinner || e.target.value,
                });
              }}
            />
            <Select
              label="Team B"
              options={teamOptions}
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  teamB: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Toss Winner"
              options={tossWinnerOptions}
              value={formData.tossWinner}
              onChange={(e) =>
                setFormData({ ...formData, tossWinner: e.target.value })
              }
            />
            <Select
              label="Toss Decision"
              options={[
                { value: "Bat", label: "Bat first" },
                { value: "Bowl", label: "Bowl first" },
              ]}
              value={formData.tossDecision}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tossDecision: e.target.value as "Bat" | "Bowl",
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Venue"
              placeholder="e.g. Wankhede Stadium"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
            />
            <Input
              label="Overs Limit"
              type="number"
              min="1"
              max="50"
              value={formData.overs}
              onChange={(e) =>
                setFormData({ ...formData, overs: Number(e.target.value) })
              }
            />
            <Select
              label="Status"
              options={[
                { value: "Upcoming", label: "Upcoming" },
                { value: "Live", label: "Live" },
                { value: "Ended", label: "Ended" },
              ]}
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "Live" | "Upcoming" | "Ended",
                })
              }
            />
          </div>

          <Input
            label="Match Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) =>
              setFormData({ ...formData, dateTime: e.target.value })
            }
          />
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModal}
        onClose={() => setIsConfirmationModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Match Record"
        message="Are you sure you want to delete this match record? All score records and commentary logs will be removed."
      />
    </div>
  );
}
