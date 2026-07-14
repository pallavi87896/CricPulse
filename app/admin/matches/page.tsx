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

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [battingTeam, setBattingTeam] = useState("");
  const [bowlingTeam, setBowlingTeam] = useState("");

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

  // Deletion confirmation
  const [isConfirmationModal, setIsConfirmationModal] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<MatchType | null>(null);

  const handleOpenView = (match: MatchType) => {
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
      teamA: match.teamA._id,
      teamB: match.teamB._id,
      tossWinner: match.tossWinner._id,
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

      {/* Matches List Table */}
      {loading ? (
        <Loader variant="table" />
      ) : (
        <SimpleTable
          headers={["Teams", "Status", "Date / Time", "Actions"]}
          isEmpty={matches.length === 0}
        >
          {matches.map((match) => (
            <tr
              key={match._id}
              onClick={() => handleOpenView(match)}
              className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-950">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <TeamLogo logo={match.teamA.logo} name={match.teamA.name} size="sm" />
                    <span>{match.teamA.name}</span>
                  </div>
                  <span className="text-zinc-400 font-semibold text-xs tracking-wider">VS</span>
                  <div className="flex items-center gap-1.5">
                    <TeamLogo logo={match.teamB.logo} name={match.teamB.name} size="sm" />
                    <span>{match.teamB.name}</span>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={match.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-550 font-medium text-sm">
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
                setFormData({ ...formData, teamB: e.target.value })
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

          {/* Dynamic player fields derived from batting and bowling team */}
          {battingTeam && bowlingTeam && (
            <div className="mt-2 border-t border-zinc-150 pt-4 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">
                Starter Setup Preview
              </h4>

              <div className="bg-zinc-50 p-3.5 border border-zinc-200 rounded-xl text-xs text-zinc-650 flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5">
                  🏏 <strong>Batting First:</strong>{" "}
                  <span>
                    {teams.find((team) => team._id === battingTeam)?.name}
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  ⚾ <strong>Bowling First:</strong>{" "}
                  <span>
                    {teams.find((team) => team._id === bowlingTeam)?.name}
                  </span>
                </p>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* View Modal Detail Panel */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingMatch(null);
        }}
        title="Match Details Preview"
        size="md"
      >
        {viewingMatch && (
          <div className="flex flex-col gap-5 text-sm text-left">
            <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 rounded-xl p-5 shadow-xs">
              <div className="text-center flex-1 font-bold text-base text-zinc-950 flex flex-col items-center gap-1">
                <TeamLogo logo={viewingMatch.teamA.logo} name={viewingMatch.teamA.name} size="md" />
                <div className="mt-1 leading-tight">{viewingMatch.teamA.name}</div>
              </div>
              <div className="text-zinc-400 font-extrabold px-3 text-xs tracking-wider">VS</div>
              <div className="text-center flex-1 font-bold text-base text-zinc-950 flex flex-col items-center gap-1">
                <TeamLogo logo={viewingMatch.teamB.logo} name={viewingMatch.teamB.name} size="md" />
                <div className="mt-1 leading-tight">{viewingMatch.teamB.name}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-zinc-150 pt-4 text-xs font-semibold">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Venue</span>
                <p className="text-sm font-bold text-zinc-800">{viewingMatch.venue || "TBD"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Date</span>
                <p className="text-sm font-bold text-zinc-800">
                  {viewingMatch.dateTime
                    ? new Date(viewingMatch.dateTime).toLocaleString()
                    : "Not scheduled"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Status</span>
                <div className="mt-0.5">
                  <Badge status={viewingMatch.status} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Overs Limit</span>
                <p className="text-sm font-bold font-mono text-zinc-800">{viewingMatch.overs} Overs</p>
              </div>
              <div className="col-span-2 border-t border-zinc-150 pt-4 text-zinc-650">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Toss Setup</span>
                <p className="font-semibold text-zinc-700">
                  {viewingMatch.tossWinner.name} won the toss and elected to {viewingMatch.tossDecision} first.
                </p>
              </div>
              {viewingMatch.status !== "Upcoming" && (
                <div className="col-span-2 border-t border-zinc-150 pt-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Innings Scorecard Summary</span>
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-mono text-base font-bold text-zinc-900 shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <TeamLogo logo={viewingMatch.battingTeam?.logo} name={viewingMatch.battingTeam?.name} size="sm" />
                      <span>{viewingMatch.battingTeam?.name}</span>
                    </span>
                    <span>
                      {viewingMatch.score}/{viewingMatch.wickets} ({Math.floor(viewingMatch.legalBalls / 6)}.{viewingMatch.legalBalls % 6} ov)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
