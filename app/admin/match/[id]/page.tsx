"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import { MatchType } from "@/types/matchType";
import { PlayerStatsType } from "@/types/playerStatsType";
import { BallEventType } from "@/types/ballEventType";
import { CommentType } from "@/types/commentType";
import { PlayerType } from "@/types/playerType";

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

  const fetchLiveMatchData = async () => {
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
  };

  useEffect(() => {
    fetchLiveMatchData();
    // Setup polling every 5 seconds
    const interval = setInterval(fetchLiveMatchData, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="md" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col gap-6 text-center py-12">
        <h3 className="text-lg font-semibold text-zinc-900">Match not found</h3>
        <p className="text-sm text-zinc-500">The match details could not be loaded or the ID is incorrect.</p>
        <Link href="/admin">
          <Button variant="secondary">Go back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Helper to look up stats
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

  // Match calculations
  const totalOvers = match.overs ?? 20;
  const legalBalls = match.legalBalls ?? 0;
  const score = match.score ?? 0;
  const wickets = match.wickets ?? 0;

  const oversStr = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
  const totalOversFractions = legalBalls / 6;
  const runRate = totalOversFractions > 0 ? (score / totalOversFractions).toFixed(2) : "0.00";

  // Batting Strike Rates
  const strikerSR = strikerStat.balls > 0 ? ((strikerStat.runs / strikerStat.balls) * 100).toFixed(1) : "0.0";
  const nonStrikerSR = nonStrikerStat.balls > 0 ? ((nonStrikerStat.runs / nonStrikerStat.balls) * 100).toFixed(1) : "0.0";

  // Bowler Economy
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

  // Format ball texts chronologically (most recent on right)
  const recentBallsList = [...recentBalls].slice(0, 6).reverse();

  const getBallText = (ball: any) => {
    if (ball.wicket) return "W";
    if (ball.ballType === "Wide") return "Wd";
    if (ball.ballType === "NoBall") return "Nb";
    if (ball.ballType === "Bye") return `B${ball.extraRuns}`;
    if (ball.ballType === "LegBye") return `Lb${ball.extraRuns}`;
    return ball.batsmanRuns.toString();
  };

  const isInitialized = match.currStriker && match.currNonStriker && match.currBowler;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title={`${match.teamA.name} vs ${match.teamB.name}`}
        description={`Live coverage from ${match.venue || "Stadium Venue"}.`}
        actions={
          <Link href="/admin">
            <Button variant="secondary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      {/* Main Scoreboard Dashboard */}
      <div className="bg-white border border-zinc-200 border-t-4 border-t-brand-accent rounded-lg text-zinc-900 p-5 flex flex-col gap-4 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{match.battingTeam?.logo ?? "🏏"}</span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{match.battingTeam?.name ?? "Batting Team"}</h2>
              <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">
                Innings {match.innings} {match.status === "Ended" && "(Completed)"}
              </p>
            </div>
          </div>
          <div>
            <Badge status={match.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div className="col-span-2 sm:col-span-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Score</span>
            <div className="text-4xl font-extrabold font-mono mt-0.5 text-zinc-900">
              {score}/{wickets}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Overs</span>
            <div className="text-xl font-bold font-mono mt-0.5 text-zinc-800">
              {oversStr} <span className="text-zinc-400 text-sm font-normal">/ {totalOvers}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Run Rate</span>
            <div className="text-xl font-bold font-mono mt-0.5 text-zinc-800">{runRate}</div>
          </div>
        </div>

        {match.target > 0 && (
          <div className="bg-brand-secondary/40 border border-brand-primary/30 p-3 rounded-md text-xs text-brand-dark font-semibold">
            🎯 Target: <strong>{match.target} runs</strong>. Need{" "}
            <strong>{Math.max(0, match.target - score)} runs</strong> from{" "}
            <strong>{Math.max(0, match.overs * 6 - legalBalls)} balls</strong> (Required RR:{" "}
            {((Math.max(0, match.target - score) / (Math.max(1, match.overs * 6 - legalBalls) / 6))).toFixed(2)}).
          </div>
        )}

        {match.status === "Ended" && match.winner && (
          <div className="bg-green-50 border border-green-200 p-3.5 rounded-md text-xs text-green-800 font-bold flex items-center gap-2">
            🏆 Winner: {match.winner.name} won the match!
          </div>
        )}
      </div>

      {/* Middle Cards (Batsman and Bowler Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Striker */}
        <Card className={`border-l-4 ${match.currStriker ? "border-l-brand-accent" : "border-l-zinc-300"} bg-white`}>
          <div>
            <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">Striker 🏏</span>
            <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currStriker?.name ?? "Not Selected"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-xl font-bold font-mono text-zinc-900">{match.currStriker ? strikerStat.runs : "-"}</span>
            <span className="text-xs text-zinc-500 font-mono">
              {match.currStriker ? `${strikerStat.balls}b (SR ${strikerSR})` : ""}
            </span>
          </div>
        </Card>

        {/* Non-Striker */}
        <Card className="bg-white border-l-4 border-l-zinc-300">
          <div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Non-Striker</span>
            <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currNonStriker?.name ?? "Not Selected"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-xl font-bold font-mono text-zinc-700">{match.currNonStriker ? nonStrikerStat.runs : "-"}</span>
            <span className="text-xs text-zinc-500 font-mono">
              {match.currNonStriker ? `${nonStrikerStat.balls}b (SR ${nonStrikerSR})` : ""}
            </span>
          </div>
        </Card>

        {/* Bowler */}
        <Card className="bg-white border-l-4 border-l-zinc-400">
          <div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Bowler ⚾</span>
            <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currBowler?.name ?? "Not Selected"}</h4>
          </div>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-xl font-bold font-mono text-zinc-700">
              {match.currBowler ? `${bowlerStat.wicketsTaken}-${bowlerStat.runsConceded}` : "-"}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {match.currBowler ? `${bowlerOversStr}ov (Econ ${bowlerEcon})` : ""}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        <div className="flex border-b border-zinc-200 bg-zinc-50/50">
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === "scorecard"
                ? "border-brand-accent text-brand-accent bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Full Scorecard
          </button>
          <button
            onClick={() => setActiveTab("commentary")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === "commentary"
                ? "border-brand-accent text-brand-accent bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Live Commentary
          </button>
        </div>

        <div className="p-5">
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
                        ? "bg-brand-accent text-white shadow-xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Innings 1 ({match.bowlingTeam?.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInnings(2)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedInnings === 2
                        ? "bg-brand-accent text-white shadow-xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Innings 2 ({match.battingTeam?.name})
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Batting Card */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Batting Scorecard ({!isViewingSecondInnings ? match.bowlingTeam?.name : match.battingTeam?.name})
                    </h4>
                    <span className="text-xs font-bold text-zinc-700">
                      {!isViewingSecondInnings 
                        ? `${match.target > 0 ? match.target - 1 : 0}/${innings1Wickets} (${innings1OversStr} ov)`
                        : `${score}/${wickets} (${oversStr} ov)`
                      }
                    </span>
                  </div>
                  <div className="border border-zinc-200 rounded-md overflow-hidden bg-white text-xs">
                    <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-2 flex justify-between font-semibold text-zinc-500">
                      <span>Batsman</span>
                      <div className="flex gap-4 font-mono">
                        <span className="w-8 text-right">R</span>
                        <span className="w-8 text-right">B</span>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-100 bg-white">
                      {selectedBattingPlayers.map((p) => {
                        const stats = getStat(p._id);
                        if (stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== activeStrikerId && p._id !== activeNonStrikerId) {
                          return null; // Not batted yet
                        }
                        const isStriker = p._id === activeStrikerId;
                        const isNonStriker = p._id === activeNonStrikerId;
                        return (
                          <div key={p._id} className={`px-3 py-2 flex justify-between items-center ${isStriker || isNonStriker ? "bg-brand-secondary/35 font-semibold" : ""}`}>
                            <span className="font-semibold text-zinc-700 flex items-center gap-1">
                              {p.name}
                              {isStriker && <span>🏏</span>}
                              {stats.isOut && <span className="text-[10px] text-red-500 font-normal ml-1.5">(out)</span>}
                            </span>
                            <div className="flex gap-4 font-mono text-zinc-900">
                              <span className="w-8 text-right font-bold">{stats.runs}</span>
                              <span className="w-8 text-right text-zinc-500">{stats.balls}</span>
                            </div>
                          </div>
                        );
                      })}
                      {selectedBattingPlayers.filter(p => {
                        const stats = getStat(p._id);
                        return stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== activeStrikerId && p._id !== activeNonStrikerId;
                      }).length > 0 && (
                        <div className="px-3 py-2 bg-zinc-50/40 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-200">
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
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
                    Bowling Scorecard ({!isViewingSecondInnings ? match.battingTeam?.name : match.bowlingTeam?.name})
                  </h4>
                  <div className="border border-zinc-200 rounded-md overflow-hidden bg-white text-xs">
                    <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-2 flex justify-between font-semibold text-zinc-500">
                      <span>Bowler</span>
                      <div className="flex gap-4 font-mono">
                        <span className="w-8 text-right">O</span>
                        <span className="w-8 text-right">R</span>
                        <span className="w-8 text-right">W</span>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-100 bg-white">
                      {selectedBowlingPlayers.map((p) => {
                        const stats = getStat(p._id);
                        if (stats.legalBallsBowled === 0 && p._id !== activeBowlerId) {
                          return null; // Not bowled yet
                        }
                        const isBowler = p._id === activeBowlerId;
                        const ovs = `${Math.floor(stats.legalBallsBowled / 6)}.${stats.legalBallsBowled % 6}`;
                        return (
                          <div key={p._id} className={`px-3 py-2 flex justify-between items-center ${isBowler ? "bg-brand-secondary/25 font-semibold" : ""}`}>
                            <span className="font-semibold text-zinc-700">{p.name}</span>
                            <div className="flex gap-4 font-mono text-zinc-900">
                              <span className="w-8 text-right text-zinc-500">{ovs}</span>
                              <span className="w-8 text-right text-zinc-500">{stats.runsConceded}</span>
                              <span className="w-8 text-right font-bold text-zinc-900">{stats.wicketsTaken}</span>
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
            <div className="flex flex-col gap-4">
              {/* Over history bubble feed */}
              <div className="border border-zinc-200 bg-zinc-50/50 p-4 rounded-lg flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Current Over Ball log</span>
                  <p className="text-xs text-zinc-500">Outcome representation (Left to Right, Chronological)</p>
                </div>
                <div className="flex items-center gap-2">
                  {recentBallsList.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">No deliveries recorded in this over yet.</span>
                  ) : (
                    recentBallsList.map((ball, idx) => {
                      const val = getBallText(ball);
                      let bg = "bg-zinc-100 text-zinc-800 border-zinc-200";
                      if (val === "W") bg = "bg-red-100 text-red-700 border-red-200 font-bold";
                      else if (val === "4" || val === "6") bg = "bg-brand-secondary text-brand-accent border-brand-primary/45 font-bold";

                      return (
                        <span
                          key={idx}
                          className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold ${bg}`}
                        >
                          {val}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Feed lists */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto divide-y divide-zinc-100">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-500 italic">No commentary logged yet.</div>
                ) : (
                  comments
                    .slice()
                    .reverse()
                    .map((comm) => (
                      <div key={comm._id} className="pt-2 text-xs flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span className="font-bold text-zinc-500">{comm.username || "System Log"}</span>
                          <span>{comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString() : ""}</span>
                        </div>
                        <p className="text-zinc-800 font-medium leading-relaxed">{comm.comment}</p>
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
