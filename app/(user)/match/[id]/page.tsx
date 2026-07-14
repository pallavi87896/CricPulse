"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { MatchType } from "@/types/matchType";
import { PlayerStatsType } from "@/types/playerStatsType";
import { BallEventType } from "@/types/ballEventType";
import { CommentType } from "@/types/commentType";
import { PlayerType } from "@/types/playerType";
import { getSocket } from "@/socket/client";
import { useCallback } from "react";

interface MatchViewProps {
  params: Promise<{ id: string }>;
}

export default function MatchViewPage({ params }: MatchViewProps) {
  const { id: matchId } = use(params);

  const [match, setMatch] = useState<MatchType | null>(null);
  const [scorecard, setScorecard] = useState<PlayerStatsType[]>([]);
  const [recentBalls, setRecentBalls] = useState<BallEventType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [battingPlayers, setBattingPlayers] = useState<PlayerType[]>([]);
  const [bowlingPlayers, setBowlingPlayers] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"scorecard" | "commentary">("scorecard");
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(1);

  useEffect(() => {
    if (match) {
      setSelectedInnings(match.innings as 1 | 2);
    }
  }, [match?.innings]);

  const fetchLiveMatchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/match/${matchId}/live`);
      if (!res.ok) {
        throw new Error("Failed to fetch live match details");
      }
      const data = await res.json();
      setMatch(data.match);
      setScorecard(data.scorecard);
      setRecentBalls(data.recentBalls);
      setComments(data.comments);
      setBattingPlayers(data.battingPlayers);
      setBowlingPlayers(data.bowlingPlayers);
    } catch (err) {
      console.error("Error fetching live match data:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const socket = getSocket();

    // join match room
    socket.emit("join_match", matchId);

    // listen to live updates
    socket.on("match_updated", () => {
      fetchLiveMatchData();
    });

    fetchLiveMatchData();
    return () => {
      socket.off("match_updated");
    };
  }, [matchId, fetchLiveMatchData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-zinc-200 min-h-[70vh] shadow-xs">
        <div className="h-10 bg-zinc-200 w-1/3 rounded-lg animate-pulse" />
        <Loader variant="card" className="bg-white border-zinc-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-white text-zinc-800 min-h-[50vh] rounded-3xl p-8 border border-zinc-200 flex flex-col justify-center items-center gap-6 text-center shadow-xs">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-zinc-900">Match not found</h3>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          The match details could not be loaded or the match ID is incorrect.
        </p>
        <Link href="/">
          <Button variant="secondary" className="border-zinc-200 text-zinc-650 hover:text-zinc-900">
            Return to Live Hub
          </Button>
        </Link>
      </div>
    );
  }

  const getStat = (playerId: string) => {
    if (!playerId) return { runs: 0, balls: 0, wicketsTaken: 0, legalBallsBowled: 0, runsConceded: 0, isOut: false };
    return (
      scorecard.find((ps) => ps.player?._id === playerId) || {
        runs: 0,
        balls: 0,
        wicketsTaken: 0,
        legalBallsBowled: 0,
        runsConceded: 0,
        isOut: false,
      }
    );
  };

  const strikerStat = getStat(match.currStriker?._id ?? "");
  const nonStrikerStat = getStat(match.currNonStriker?._id ?? "");
  const bowlerStat = getStat(match.currBowler?._id ?? "");

  const totalOvers = match.overs ?? 20;
  const legalBalls = match.legalBalls ?? 0;
  const score = match.score ?? 0;
  const wickets = match.wickets ?? 0;

  const oversStr = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
  const totalOversFractions = legalBalls / 6;
  const runRate = totalOversFractions > 0 ? (score / totalOversFractions).toFixed(2) : "0.00";

  const strikerSR = strikerStat.balls > 0 ? ((strikerStat.runs / strikerStat.balls) * 100).toFixed(1) : "0.0";
  const nonStrikerSR = nonStrikerStat.balls > 0 ? ((nonStrikerStat.runs / nonStrikerStat.balls) * 100).toFixed(1) : "0.0";

  const bowlerOversStr = `${Math.floor(bowlerStat.legalBallsBowled / 6)}.${bowlerStat.legalBallsBowled % 6}`;
  const bowlerOversFractions = bowlerStat.legalBallsBowled / 6;
  const bowlerEcon = bowlerOversFractions > 0 ? (bowlerStat.runsConceded / bowlerOversFractions).toFixed(2) : "0.00";

  // Innings-specific scorecard variables
  const isSecondInnings = match.innings === 2;
  const isViewingSecondInnings = !isSecondInnings || selectedInnings === 2;

  const selectedBattingPlayers = isSecondInnings && selectedInnings === 1 ? bowlingPlayers : battingPlayers;
  const selectedBowlingPlayers = isSecondInnings && selectedInnings === 1 ? battingPlayers : bowlingPlayers;

  const activeStrikerId = !isViewingSecondInnings ? "" : (match.currStriker?._id ?? "");
  const activeNonStrikerId = !isViewingSecondInnings ? "" : (match.currNonStriker?._id ?? "");
  const activeBowlerId = !isViewingSecondInnings ? "" : (match.currBowler?._id ?? "");

  const innings1Wickets = scorecard.filter(ps => 
    bowlingPlayers.some(p => p._id === ps.player?._id) && ps.isOut
  ).length;

  const innings1Balls = battingPlayers.reduce((acc, p) => {
    const stats = scorecard.find(ps => ps.player?._id === p._id);
    return acc + (stats?.legalBallsBowled ?? 0);
  }, 0);
  const innings1OversStr = `${Math.floor(innings1Balls / 6)}.${innings1Balls % 6}`;

  const recentBallsList = [...recentBalls].slice(0, 6).reverse();

  const getBallText = (ball: any) => {
    if (ball.wicket) return "W";
    if (ball.ballType === "Wide") return "Wd";
    if (ball.ballType === "NoBall") return "Nb";
    if (ball.ballType === "Bye") return `B${ball.extraRuns}`;
    if (ball.ballType === "LegBye") return `Lb${ball.extraRuns}`;
    return ball.batsmanRuns.toString();
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="text-left">
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            {match.teamA.name} <span className="text-zinc-400 font-medium text-xs">VS</span> {match.teamB.name}
          </h1>
          <p className="text-xs text-zinc-550 mt-1 font-semibold tracking-wide">
            Venue: {match.venue || "Stadium Venue"}
          </p>
        </div>

        <Link href="/">
          <Button variant="secondary" className="border-zinc-200 text-zinc-650 hover:bg-zinc-50 font-bold text-xs py-2 rounded-xl">
            ← Back to Live Hub
          </Button>
        </Link>
      </div>

      {/* 1. Main scoreboard Dashboard */}
      <div className="bg-white border border-zinc-200 border-t-4 border-t-[var(--color-brand-accent)] rounded-2xl p-6 flex flex-col gap-5 shadow-xs relative overflow-hidden">
        
        <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
          <div className="flex items-center gap-3">
            <TeamLogo logo={match.battingTeam?.logo} name={match.battingTeam?.name} size="md" className="bg-zinc-50 border-zinc-200" />
            <div className="text-left">
              <h2 className="text-base font-extrabold text-zinc-900">{match.battingTeam?.name ?? "Batting Team"}</h2>
              <p className="text-[9px] text-[var(--color-brand-accent)] font-bold uppercase tracking-wider mt-0.5">
                Innings {match.innings} {match.status === "Ended" && "(Completed)"}
              </p>
            </div>
          </div>
          <div>
            <Badge status={match.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center text-left">
          <div className="col-span-2 sm:col-span-2">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Team Score</span>
            <div className="text-4xl sm:text-5xl font-black font-mono mt-1 text-zinc-900 flex items-baseline gap-1">
              <span>{score}/{wickets}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Overs Completed</span>
            <div className="text-2xl font-black font-mono mt-1 text-zinc-800">
              {oversStr} <span className="text-zinc-500 text-sm font-semibold">/ {totalOvers}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Run Rate</span>
            <div className="text-2xl font-black font-mono mt-1 text-zinc-800">{runRate}</div>
          </div>
        </div>

        {/* Target runs banner */}
        {match.target > 0 && (
          <div className="bg-[var(--color-brand-secondary)] border border-[var(--color-brand-primary)]/15 p-4 rounded-xl text-xs text-[var(--color-brand-dark)] font-bold text-left leading-relaxed flex items-center gap-2">
            🎯 Target Chase: Need {Math.max(0, match.target - score)} runs from {Math.max(0, match.overs * 6 - legalBalls)} balls (Req R/R: {((Math.max(0, match.target - score) / (Math.max(1, match.overs * 6 - legalBalls) / 6))).toFixed(2)})
          </div>
        )}

        {match.status === "Ended" && match.winner && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-xs text-green-700 font-bold text-left flex items-center gap-2">
            🏆 Winner: {match.winner.name} won the match!
          </div>
        )}
      </div>

      {/* 2. Middle Cards (Batsman and Bowler Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
        {/* Striker */}
        <div className={`border border-zinc-200 border-l-4 ${match.currStriker ? "border-l-[var(--color-brand-primary)]" : "border-l-zinc-350"} bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs`}>
          <div>
            <span className="text-[9px] font-bold text-[var(--color-brand-accent)] uppercase tracking-wider">Striker 🏏</span>
            <h4 className="text-sm font-black text-zinc-900 mt-1">{match.currStriker?.name ?? "Not In-Play"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-2xl font-black font-mono text-zinc-900">{match.currStriker ? strikerStat.runs : "-"}</span>
            <span className="text-xs text-zinc-550 font-bold font-mono">
              {match.currStriker ? `${strikerStat.balls}b (SR ${strikerSR})` : ""}
            </span>
          </div>
        </div>

        {/* Non-Striker */}
        <div className="border border-zinc-200 border-l-4 border-l-zinc-300 bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Non-Striker</span>
            <h4 className="text-sm font-black text-zinc-900 mt-1">{match.currNonStriker?.name ?? "Not In-Play"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-2xl font-black font-mono text-zinc-800">{match.currNonStriker ? nonStrikerStat.runs : "-"}</span>
            <span className="text-xs text-zinc-550 font-bold font-mono">
              {match.currNonStriker ? `${nonStrikerStat.balls}b (SR ${nonStrikerSR})` : ""}
            </span>
          </div>
        </div>

        {/* Bowler */}
        <div className="border border-zinc-200 border-l-4 border-l-zinc-300 bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Active Bowler ⚾</span>
            <h4 className="text-sm font-black text-zinc-900 mt-1">{match.currBowler?.name ?? "Not Selected"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-2xl font-black font-mono text-zinc-800">
              {match.currBowler ? `${bowlerStat.wicketsTaken}-${bowlerStat.runsConceded}` : "-"}
            </span>
            <span className="text-xs text-zinc-550 font-bold font-mono">
              {match.currBowler ? `${bowlerOversStr}ov (Econ ${bowlerEcon})` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Scorecard & Commentary Tabs */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Tab triggers */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/50">
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
              activeTab === "scorecard"
                ? "border-[var(--color-brand-primary)] text-[var(--color-brand-dark)] bg-zinc-100/10"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Full Scorecard
          </button>
          <button
            onClick={() => setActiveTab("commentary")}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
              activeTab === "commentary"
                ? "border-[var(--color-brand-primary)] text-[var(--color-brand-dark)] bg-zinc-100/10"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Live Commentary
          </button>
        </div>

        <div className="p-6 text-left">
          {/* Tab 1: Full Scorecard */}
          {activeTab === "scorecard" && (
            <div className="flex flex-col gap-4 w-full">
              {match.innings === 2 && (
                <div className="flex justify-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInnings(1)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedInnings === 1
                        ? "bg-[var(--color-brand-primary)] text-white shadow-xs"
                        : "bg-zinc-105 text-zinc-650 hover:bg-zinc-200"
                    }`}
                  >
                    Innings 1 ({match.bowlingTeam?.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInnings(2)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedInnings === 2
                        ? "bg-[var(--color-brand-primary)] text-white shadow-xs"
                        : "bg-zinc-105 text-zinc-650 hover:bg-zinc-200"
                    }`}
                  >
                    Innings 2 ({match.battingTeam?.name})
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Batting Card */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-555">
                      Batting Scorecard ({!isViewingSecondInnings ? match.bowlingTeam?.name : match.battingTeam?.name})
                    </h4>
                    <span className="text-xs font-extrabold text-zinc-700">
                      {!isViewingSecondInnings 
                        ? `${match.target > 0 ? match.target - 1 : 0}/${innings1Wickets} (${innings1OversStr} ov)`
                        : `${score}/${wickets} (${oversStr} ov)`
                      }
                    </span>
                  </div>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/20 text-xs">
                    <div className="bg-zinc-55 border-b border-zinc-200 px-4 py-3 flex justify-between font-bold text-zinc-500">
                      <span>Batsman</span>
                      <div className="flex gap-6 font-mono text-sm">
                        <span className="w-8 text-right">R</span>
                        <span className="w-8 text-right">B</span>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-200 bg-white">
                      {selectedBattingPlayers.map((p) => {
                        const stats = getStat(p._id);
                        if (stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== activeStrikerId && p._id !== activeNonStrikerId) {
                          return null; // Not batted yet
                        }
                        const isStriker = p._id === activeStrikerId;
                        const isNonStriker = p._id === activeNonStrikerId;
                        return (
                          <div key={p._id} className={`px-4 py-3 flex justify-between items-center ${isStriker || isNonStriker ? "bg-[var(--color-brand-secondary)]/30 font-semibold" : ""}`}>
                            <span className="font-semibold text-zinc-700 flex items-center gap-1">
                              {p.name}
                              {isStriker && <span className="text-[var(--color-brand-accent)]">🏏</span>}
                              {stats.isOut && <span className="text-[10px] text-red-650 font-bold ml-1.5">(out)</span>}
                            </span>
                            <div className="flex gap-6 font-mono text-zinc-800 text-sm">
                              <span className="w-8 text-right font-bold text-zinc-950">{stats.runs}</span>
                              <span className="w-8 text-right text-zinc-400">{stats.balls}</span>
                            </div>
                          </div>
                        );
                      })}
                      {selectedBattingPlayers.filter(p => {
                        const stats = getStat(p._id);
                        return stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== activeStrikerId && p._id !== activeNonStrikerId;
                      }).length > 0 && (
                        <div className="px-4 py-3 bg-zinc-50/50 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-200">
                          <strong>Yet to bat: </strong>
                          {selectedBattingPlayers
                            .filter(p => {
                              const stats = getStat(p._id);
                              return stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== activeStrikerId && p._id !== activeNonStrikerId;
                            })
                            .map(p => p.name)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bowling Card */}
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    Bowling Scorecard ({!isViewingSecondInnings ? match.battingTeam?.name : match.bowlingTeam?.name})
                  </h4>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/20 text-xs">
                    <div className="bg-zinc-55 border-b border-zinc-200 px-4 py-3 flex justify-between font-bold text-zinc-500">
                      <span>Bowler</span>
                      <div className="flex gap-6 font-mono text-sm">
                        <span className="w-8 text-right">O</span>
                        <span className="w-8 text-right">R</span>
                        <span className="w-8 text-right">W</span>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-200 bg-white">
                      {selectedBowlingPlayers.map((p) => {
                        const stats = getStat(p._id);
                        if (stats.legalBallsBowled === 0 && p._id !== activeBowlerId) {
                          return null; // Not bowled yet
                        }
                        const isBowler = p._id === activeBowlerId;
                        const ovs = `${Math.floor(stats.legalBallsBowled / 6)}.${stats.legalBallsBowled % 6}`;
                        return (
                          <div key={p._id} className={`px-4 py-3 flex justify-between items-center ${isBowler ? "bg-[var(--color-brand-secondary)]/30 font-semibold" : ""}`}>
                            <span className="font-semibold text-zinc-700">{p.name}</span>
                            <div className="flex gap-6 font-mono text-zinc-800 text-sm">
                              <span className="w-8 text-right text-zinc-405">{ovs}</span>
                              <span className="w-8 text-right text-zinc-405">{stats.runsConceded}</span>
                              <span className="w-8 text-right font-bold text-zinc-950">{stats.wicketsTaken}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live Commentary */}
          {activeTab === "commentary" && (
            <div className="flex flex-col gap-5">
              {/* Over history bubbles */}
              <div className="border border-zinc-200 bg-zinc-50/50 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Current Over Ball log</span>
                  <p className="text-[10px] text-zinc-450 font-semibold mt-0.5">Chronological delivery outcomes (left-to-right)</p>
                </div>
                <div className="flex items-center gap-2">
                  {recentBallsList.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic font-semibold">No deliveries recorded in this over.</span>
                  ) : (
                    recentBallsList.map((ball, idx) => {
                      const val = getBallText(ball);
                      let bg = "bg-zinc-100 text-zinc-650 border-zinc-200";
                      if (val === "W") bg = "bg-red-50 text-red-650 border-red-200 font-bold";
                      else if (val === "4" || val === "6") bg = "bg-[var(--color-brand-secondary)] text-[var(--color-brand-dark)] border-[var(--color-brand-primary)]/25 font-bold";

                      return (
                        <span
                          key={idx}
                          className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold select-none ${bg}`}
                        >
                          {val}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Commentary logs list */}
              <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto divide-y divide-zinc-200">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-400 italic font-semibold">No match events logged yet.</div>
                ) : (
                  comments
                    .slice()
                    .reverse()
                    .map((comm) => (
                      <div key={comm._id} className="pt-3 text-xs flex flex-col gap-1 first:pt-0">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                          <span>{comm.username || "Live Scorer"}</span>
                          <span>{comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString() : ""}</span>
                        </div>
                        <p className="text-zinc-650 font-medium leading-relaxed">{comm.comment}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
