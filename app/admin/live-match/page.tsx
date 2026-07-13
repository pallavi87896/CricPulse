"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Select, Input } from "@/components/Input";
import { MatchType } from "@/types/matchType";
import { BallEventType } from "@/types/ballEventType";
import { CommentType } from "@/types/commentType";
import { PlayerStatsType } from "@/types/playerStatsType";
import { PlayerType } from "@/types/playerType";

export default function LiveMatchesPage() {
  // Active scoring match state
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [liveMatches, setLiveMatches] = useState<MatchType[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(true);

  const [match, setMatch] = useState<MatchType | null>(null);
  const [scorecard, setScorecard] = useState<PlayerStatsType[]>([]);
  const [recentBalls, setRecentBalls] = useState<BallEventType[]>([]);

  const [bowlingPlayers, setBowlingPlayers] = useState<PlayerType[]>([]);
  const [battingPlayers, setBattingPlayers] = useState<PlayerType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

  // Starting players setup state
  const [startStrikerId, setStartStrikerId] = useState("");
  const [startNonStrikerId, setStartNonStrikerId] = useState("");
  const [startBowlerId, setStartBowlerId] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/match");
      if (!res.ok) {
        alert("Failed to fetch matches");
        return;
      }

      const data = await res.json();
      
      const live = data.filter((m: MatchType) => m.status === "Live");
      const upcoming = data.filter((m: MatchType) => m.status === "Upcoming");
      
      setLiveMatches(live);
      setUpcomingMatches(upcoming);

      if (live.length > 0) {
        setSelectedMatchId(live[0]._id);
      } else if (upcoming.length > 0) {
        setSelectedMatchId(upcoming[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveMatches = async (matchId: string) => {
    try {
      const res = await fetch(`/api/match/${matchId}/live`);
      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        alert(err.msg);
        return;
      }

      const data = await res.json();

      setMatch(data.match);
      setScorecard(data.scorecard);
      setRecentBalls(data.recentBalls);
      setComments(data.comments);
      setBattingPlayers(data.battingPlayers);
      setBowlingPlayers(data.bowlingPlayers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedMatchId) {
      fetchLiveMatches(selectedMatchId);
    }
  }, [selectedMatchId]);

  useEffect(() => {
    fetchMatches();
  }, []);

  // Prepopulate starter setup states when players load
  useEffect(() => {
    if (battingPlayers.length > 0) {
      setStartStrikerId(battingPlayers[0]?._id || "");
      setStartNonStrikerId(battingPlayers[1]?._id || battingPlayers[0]?._id || "");
    }
  }, [battingPlayers]);

  useEffect(() => {
    if (bowlingPlayers.length > 0) {
      setStartBowlerId(bowlingPlayers[0]?._id || "");
    }
  }, [bowlingPlayers]);

  // Wicket Modal State
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [wicketType, setWicketType] = useState<"Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped" | "Hit Wicket">("Bowled");
  const [outPlayerId, setOutPlayerId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");
  const [wicketExtraRuns, setWicketExtraRuns] = useState("0");

  // Change Bowler Modal State
  const [isBowlerModalOpen, setIsBowlerModalOpen] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState("");

  // End Innings Modal State (Now handled inline/manually if required)
  const [isInningsModalOpen, setIsInningsModalOpen] = useState(false);
  const [innStriker, setInnStriker] = useState("");
  const [innNonStriker, setInnNonStriker] = useState("");
  const [innBowler, setInnBowler] = useState("");

  // End Match Modal State
  const [isEndMatchModalOpen, setIsEndMatchModalOpen] = useState(false);
  const [winnerId, setWinnerId] = useState("");

  // Custom commentary text input state
  const [customComment, setCustomComment] = useState("");

  // Stats lookups
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

  const strikerStat = getStat(match?.currStriker?._id ?? "");
  const nonStrikerStat = getStat(match?.currNonStriker?._id ?? "");
  const bowlerStat = getStat(match?.currBowler?._id ?? "");

  // Calculations
  const totalOvers = match?.overs ?? 20;
  const legalBalls = match?.legalBalls ?? 0;
  const score = match?.score ?? 0;
  const wickets = match?.wickets ?? 0;

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

  // Over History Calculation
  const currentMatchEvents = recentBalls;
  const recentBallsList = currentMatchEvents.slice(-6); // last 6 balls

  // Group events by overs for over history
  const oversHistory: { number: number; runs: number; wickets: number; balls: any[] }[] = [];
  let tempBalls: any[] = [];
  let tempRuns = 0;
  let tempWickets = 0;
  let currentLegalBalls = 0;

  currentMatchEvents.forEach((ev) => {
    let isLegal = ev.ballType === "Normal" || ev.ballType === "Bye" || ev.ballType === "LegBye";
    tempBalls.push(ev);
    
    // Add runs
    if (ev.ballType === "Normal") tempRuns += ev.batsmanRuns + ev.extraRuns;
    else if (ev.ballType === "Wide") tempRuns += 1 + ev.extraRuns;
    else if (ev.ballType === "NoBall") tempRuns += 1 + ev.batsmanRuns + ev.extraRuns;
    else if (ev.ballType === "Bye" || ev.ballType === "LegBye") tempRuns += ev.extraRuns;

    if (ev.wicket) tempWickets += 1;

    if (isLegal) {
      currentLegalBalls += 1;
      if (currentLegalBalls % 6 === 0) {
        oversHistory.push({
          number: Math.floor(currentLegalBalls / 6),
          runs: tempRuns,
          wickets: tempWickets,
          balls: tempBalls,
        });
        tempBalls = [];
        tempRuns = 0;
        tempWickets = 0;
      }
    }
  });
  
  // If unfinished over is active
  if (tempBalls.length > 0) {
    oversHistory.push({
      number: Math.floor(currentLegalBalls / 6) + 1,
      runs: tempRuns,
      wickets: tempWickets,
      balls: tempBalls,
    });
  }

  // Handle Score keypad actions
  const postBallEvent = async (payload: {
    match: string;
    ballType: "Normal" | "Wide" | "NoBall" | "Bye" | "LegBye";
    batsmanRuns: number;
    wicket: boolean;
    extraRuns: number;
    wicketType?: string;
    outPlayer?: string;
    newBatsman?: string;
    newBowler?: string;
    newStriker?: string;
    newNonStriker?: string;
  }) => {
    try {
      const res = await fetch("/api/ballEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      if (data.overEnded) {
        setIsBowlerModalOpen(true);
      }

      await fetchLiveMatches(selectedMatchId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreRuns = async (runs: number) => {
    if (!match) return;
    await postBallEvent({
      match: match._id,
      ballType: "Normal",
      batsmanRuns: runs,
      wicket: false,
      extraRuns: 0,
    });
  };

  const handleScoreExtra = async (type: "Wide" | "NoBall" | "Bye" | "LegBye", runs: number = 0) => {
    if (!match) return;
    await postBallEvent({
      match: match._id,
      ballType: type,
      batsmanRuns: type === "NoBall" ? runs : 0,
      wicket: false,
      extraRuns: type === "Wide" || type === "NoBall" ? runs + 1 : runs
    });
  };

  // Open Wicket Dialog
  const handleOpenWicket = () => {
    if (!match) return;
    setWicketType("Bowled");
    setOutPlayerId(match.currStriker?._id || "");
    
    // Suggest first player from batting team who hasn't batted yet
    const alreadyBattedIds = scorecard
      .filter((ps) => (ps.runs > 0 || ps.balls > 0 || ps.isOut || ps.player?._id === match.currStriker?._id || ps.player?._id === match.currNonStriker?._id))
      .map((ps) => ps.player?._id);

    const unbattedPlayers = battingPlayers.filter((p) => !alreadyBattedIds.includes(p._id));
    setNewBatsmanId(unbattedPlayers[0]?._id || "");
    setWicketExtraRuns("0");
    setIsWicketModalOpen(true);
  };

  const handleSaveWicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    postBallEvent({
      match: match._id,
      ballType: "Normal",
      batsmanRuns: 0,
      wicket: true,
      wicketType,
      outPlayer: outPlayerId,
      newBatsman: newBatsmanId,
      extraRuns: Number(wicketExtraRuns)
    });
    setIsWicketModalOpen(false);
  };

  // Open Bowler Modal
  const handleOpenBowlerChange = () => {
    if (!match) return;
    const activeBowlers = bowlingPlayers.filter((p) => p.role === "Bowler" || p.role === "All-Rounder");
    const otherBowlers = activeBowlers.filter((p) => p._id !== match.currBowler?._id);
    setNewBowlerId(otherBowlers[0]?._id || bowlingPlayers[0]?._id || "");
    setIsBowlerModalOpen(true);
  };

  const handleSaveBowlerChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    const res = await fetch("/api/match", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: match._id,
        action: "changeBowler",
        newBowler: newBowlerId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    setIsBowlerModalOpen(false);
    await fetchLiveMatches(selectedMatchId);
  };

  // Open Innings Modal (Manual setups)
  const handleOpenInningsBreak = () => {
    if (!match) return;
    setInnStriker(bowlingPlayers[0]?._id || "");
    setInnNonStriker(bowlingPlayers[1]?._id || "");
    setInnBowler(battingPlayers[0]?._id || "");
    setIsInningsModalOpen(true);
  };

  const handleSaveInningsBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    if (innStriker === innNonStriker) {
      alert("Striker and Non-Striker must be different players.");
      return;
    }

    try {
      const res = await fetch("/api/match", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: match._id,
          action: "startInnings",
          currStriker: innStriker,
          currNonStriker: innNonStriker,
          newBowler: innBowler,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg);
        return;
      }

      setIsInningsModalOpen(false);
      await fetchLiveMatches(selectedMatchId);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Starter Setup
  const handleSaveStarterSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    if (!startStrikerId || !startNonStrikerId || !startBowlerId) {
      alert("Please select both batsmen and the bowler.");
      return;
    }
    if (startStrikerId === startNonStrikerId) {
      alert("Striker and Non-Striker must be different players.");
      return;
    }

    try {
      const res = await fetch("/api/match", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: match._id,
          action: "initializePlayers",
          currStriker: startStrikerId,
          currNonStriker: startNonStrikerId,
          newBowler: startBowlerId,
          status: "Live",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg);
        return;
      }

      await fetchLiveMatches(selectedMatchId);
    } catch (err) {
      console.error(err);
    }
  };

  // Open End Match Modal
  const handleOpenEndMatch = () => {
    if (!match) return;
    setWinnerId(match.teamA._id);
    setIsEndMatchModalOpen(true);
  };

  const handleSaveEndMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;

    const res = await fetch("/api/match", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: match._id,
        action: "endMatch",
        winner: winnerId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    setIsEndMatchModalOpen(false);
    await fetchMatches();
    await fetchLiveMatches(selectedMatchId);
  };

  // Custom commentary
  const handleAddCustomComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    if (!customComment.trim()) return;

    const res = await fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        match: match._id,
        username: "Scorer Panel",
        comment: customComment.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    setCustomComment("");
    await fetchLiveMatches(selectedMatchId);
  };

  // Get ball string representation (e.g. "4", "W", "Wd")
  const getBallText = (ball: any) => {
    if (ball.wicket) return "W";
    if (ball.ballType === "Wide") return "Wd";
    if (ball.ballType === "NoBall") return "Nb";
    if (ball.ballType === "Bye") return `B${ball.extraRuns}`;
    if (ball.ballType === "LegBye") return `Lb${ball.extraRuns}`;
    return ball.batsmanRuns.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100px">
        <div className="animate-spin text-brand-accent rounded-full h-10 w-10 border-b-2 border-current"></div>
      </div>
    );
  }

  // If no match selected
  if (!match) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Live Match Scoring" description="Manage active matches and score live deliveries." />
        <Card>
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-900">No active live matches found</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-md">
              Create a match and set its status to "Live" on the Matches page, or select an upcoming match below to set it Live.
            </p>

            {upcomingMatches.length > 0 && (
              <div className="mt-6 w-full max-w-xs flex flex-col gap-3">
                <Select
                  label="Select Upcoming Match to Start"
                  options={[
                    { value: "", label: "-- Choose Match --" },
                    ...upcomingMatches.map((m) => ({
                      value: m._id,
                      label: `${m.teamA.name} vs ${m.teamB.name}`,
                    })),
                  ]}
                  value={selectedMatchId}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      setSelectedMatchId(id);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const isInitialized = match.currStriker && match.currNonStriker && match.currBowler;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Title Bar with Match Switcher */}
      <PageHeader
        title="Live Scoring Console"
        description="Score wickets, boundaries, rotates strikes, and publishes commentaries instantly."
        actions={
          <div className="flex items-center gap-2">
            {(liveMatches.length > 0 || upcomingMatches.length > 0) && (
              <select
                className="px-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-md font-semibold text-zinc-700 outline-none focus:border-brand-accent cursor-pointer"
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
              >
                {liveMatches.map((m) => (
                  <option key={m._id} value={m._id}>
                    Live: {m.teamA.name} vs {m.teamB.name}
                  </option>
                ))}
                {upcomingMatches.map((m) => (
                  <option key={m._id} value={m._id}>
                    Upcoming: {m.teamA.name} vs {m.teamB.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = "/matches";
              }}
            >
              Configure Matches
            </Button>
          </div>
        }
      />

      {/* Main Console Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Scoring Console Controls (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* 1. Top Scoreboard Dashboard */}
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
                <strong>{Math.max(0, match.overs * 6 - legalBalls)} balls</strong>.
              </div>
            )}
          </div>

          {/* 2. Middle Cards (Batsman and Bowler Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Striker */}
            <Card className={`border-l-4 ${match.currStriker ? "border-l-brand-accent" : "border-l-zinc-300"} bg-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">Striker 🏏</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currStriker?.name ?? "Not Selected"}</h4>
                </div>
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
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Non-Striker</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currNonStriker?.name ?? "Not Selected"}</h4>
                </div>
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
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Bowler ⚾</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{match.currBowler?.name ?? "Not Selected"}</h4>
                </div>
                {isInitialized && (
                  <button
                    onClick={handleOpenBowlerChange}
                    title="Change Bowler"
                    className="text-zinc-400 hover:text-brand-accent cursor-pointer p-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                    </svg>
                  </button>
                )}
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

          {/* 3. Scoring Actions Panel */}
          {!isInitialized ? (
            /* Starter / Innings Setup Card */
            <Card title="Starter Configuration Required" subtitle="Set the opening batsmen and bowler to start scoring">
              <form onSubmit={handleSaveStarterSetup} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Opening Striker"
                    options={[
                      { value: "", label: "-- Choose Striker --" },
                      ...battingPlayers.map((p) => ({ value: p._id, label: p.name })),
                    ]}
                    value={startStrikerId}
                    onChange={(e) => setStartStrikerId(e.target.value)}
                  />
                  <Select
                    label="Opening Non-Striker"
                    options={[
                      { value: "", label: "-- Choose Non-Striker --" },
                      ...battingPlayers
                        .filter((p) => p._id !== startStrikerId)
                        .map((p) => ({ value: p._id, label: p.name })),
                    ]}
                    value={startNonStrikerId}
                    onChange={(e) => setStartNonStrikerId(e.target.value)}
                  />
                  <Select
                    label="Opening Bowler"
                    options={[
                      { value: "", label: "-- Choose Bowler --" },
                      ...bowlingPlayers.map((p) => ({ value: p._id, label: `${p.name} (${p.role ?? "Bowler"})` })),
                    ]}
                    value={startBowlerId}
                    onChange={(e) => setStartBowlerId(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button type="submit" variant="primary">
                    Start Match scoring
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* Large Scoring Keypad Controls */
            <Card title="Scoring Keypad" subtitle={match.status === "Ended" ? "Match Completed" : "Click options to register ball outcomes instantly"}>
              {match.status === "Ended" ? (
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-md text-center flex flex-col items-center justify-center">
                  <span className="text-3xl">🏆</span>
                  <h4 className="text-sm font-bold text-zinc-800 mt-2">This match has ended</h4>
                  <p className="text-xs text-zinc-500 mt-1">The game is complete. To resume scoring, change its status in Matches.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Runs buttons */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Runs Off Bat</span>
                    <div className="grid grid-cols-6 gap-2">
                      {[0, 1, 2, 3, 4, 6].map((run) => (
                        <Button
                          key={run}
                          variant={run === 4 || run === 6 ? "primary" : "secondary"}
                          className="py-3 font-mono font-bold text-base"
                          onClick={() => handleScoreRuns(run)}
                        >
                          {run}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Extras buttons */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Extras</span>
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="secondary" className="py-2.5 font-semibold text-xs text-zinc-700" onClick={() => handleScoreExtra("Wide")}>
                        Wide (+1)
                      </Button>
                      <Button variant="secondary" className="py-2.5 font-semibold text-xs text-zinc-700" onClick={() => handleScoreExtra("NoBall")}>
                        No Ball (+1)
                      </Button>
                      <Button variant="secondary" className="py-2.5 font-semibold text-xs text-zinc-700" onClick={() => handleScoreExtra("Bye")}>
                        Bye (+1)
                      </Button>
                      <Button variant="secondary" className="py-2.5 font-semibold text-xs text-zinc-700" onClick={() => handleScoreExtra("LegBye")}>
                        Leg Bye (+1)
                      </Button>
                    </div>
                  </div>

                  {/* Wickets & Match controls */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Wicket & State Controls</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button variant="danger" className="py-2.5 font-bold text-xs" onClick={handleOpenWicket}>
                        Wicket 🔴
                      </Button>
                      <Button variant="secondary" className="py-2.5 font-semibold text-xs text-zinc-700" onClick={handleOpenBowlerChange}>
                        Change Bowler
                      </Button>
                    </div>
                  </div>

                  {/* Innings and Match End states */}
                  <div className="border-t border-zinc-150 pt-3 flex items-center justify-between gap-3">
                    <Button variant="secondary" size="sm" className="w-1/2 text-xs text-zinc-700" onClick={handleOpenInningsBreak}>
                      End Innings Break
                    </Button>
                    <Button variant="secondary" size="sm" className="w-1/2 text-xs text-red-650 hover:bg-red-50" onClick={handleOpenEndMatch}>
                      End Match (Declare Winner)
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Side Panel (Recent Balls, Comments, Scorecard Preview) */}
        <div className="flex flex-col gap-5">
          {/* 1. Recent Balls & Over History */}
          <Card title="Current Over History" subtitle="Outcome of recent deliveries">
            <div className="flex items-center gap-2 mb-3">
              {recentBallsList.length === 0 ? (
                <span className="text-xs text-zinc-400 italic">No balls bowled in this over yet.</span>
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

            {/* Over log list */}
            <div className="mt-4 border-t border-zinc-150 pt-3 flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Over Summaries</span>
              {oversHistory.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No overs completed yet.</p>
              ) : (
                oversHistory.slice(-4).reverse().map((ov, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-zinc-650">
                    <span>Over {ov.number}</span>
                    <span className="font-semibold text-zinc-800">
                      {ov.runs} runs, {ov.wickets} wickets
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 2. Compact Scorecard Preview */}
          <Card title="Scorecard Preview" subtitle="Current batsman and bowler card records">
            <div className="flex flex-col gap-4">
              {/* Batting Card */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 block mb-1.5">Batting Scorecard</span>
                <div className="border border-zinc-200 rounded-md overflow-hidden bg-white text-xs">
                  <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-1.5 flex justify-between font-semibold text-zinc-550">
                    <span>Batsman</span>
                    <div className="flex gap-4 font-mono">
                      <span className="w-8 text-right">R</span>
                      <span className="w-8 text-right">B</span>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {battingPlayers.map((p) => {
                      const stats = getStat(p._id);
                      if (stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== match.currStriker?._id && p._id !== match.currNonStriker?._id) {
                        return null; // Not batted yet
                      }
                      
                      const isStriker = p._id === match.currStriker?._id;
                      const isNonStriker = p._id === match.currNonStriker?._id;

                      return (
                        <div key={p._id} className={`px-3 py-1.5 flex justify-between items-center ${isStriker || isNonStriker ? "bg-brand-secondary/30" : ""}`}>
                          <span className="font-semibold text-zinc-700">
                            {p.name}
                            {isStriker && " 🏏"}
                            {stats.isOut && <span className="text-[10px] text-red-500 font-normal ml-1">(out)</span>}
                          </span>
                          <div className="flex gap-4 font-mono text-zinc-900">
                            <span className="w-8 text-right font-bold">{stats.runs}</span>
                            <span className="w-8 text-right text-zinc-500">{stats.balls}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bowling Card */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 block mb-1.5">Bowling Scorecard</span>
                <div className="border border-zinc-200 rounded-md overflow-hidden bg-white text-xs">
                  <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-1.5 flex justify-between font-semibold text-zinc-550">
                    <span>Bowler</span>
                    <div className="flex gap-4 font-mono">
                      <span className="w-8 text-right">O</span>
                      <span className="w-8 text-right">R</span>
                      <span className="w-8 text-right">W</span>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {bowlingPlayers.map((p) => {
                      const stats = getStat(p._id);
                      if (stats.legalBallsBowled === 0 && p._id !== match.currBowler?._id) {
                        return null; // Not bowled yet
                      }
                      const isBowler = p._id === match.currBowler?._id;
                      const ovs = `${Math.floor(stats.legalBallsBowled / 6)}.${stats.legalBallsBowled % 6}`;

                      return (
                        <div key={p._id} className={`px-3 py-1.5 flex justify-between items-center ${isBowler ? "bg-brand-secondary/20" : ""}`}>
                          <span className="font-semibold text-zinc-700">{p.name}</span>
                          <div className="flex gap-4 font-mono text-zinc-900">
                            <span className="w-8 text-right text-zinc-550">{ovs}</span>
                            <span className="w-8 text-right text-zinc-550">{stats.runsConceded}</span>
                            <span className="w-8 text-right font-bold">{stats.wicketsTaken}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Live commentary list feed */}
          <Card title="Live Comments & Commentary" subtitle="Auto-generated events and custom commentator items">
            {/* Custom comments box */}
            <form onSubmit={handleAddCustomComment} className="flex gap-2 mb-3">
              <Input
                placeholder="Type dynamic comment details..."
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                className="py-1.5 px-3 text-xs"
              />
              <Button type="submit" variant="primary" className="py-1 px-3 text-xs">
                Post
              </Button>
            </form>

            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto divide-y divide-zinc-100">
              {comments
                .slice()
                .reverse()
                .map((comm) => (
                  <div key={comm._id} className="pt-2 text-xs flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span className="font-bold text-zinc-500">{comm.username}</span>
                      <span>{new Date(comm.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed font-semibold">{comm.comment}</p>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Wicket Modal */}
      <Modal isOpen={isWicketModalOpen} onClose={() => setIsWicketModalOpen(false)} title="Register Wicket Out" footer={<><Button variant="secondary" onClick={() => setIsWicketModalOpen(false)}>Cancel</Button><Button variant="danger" type="submit" form="wicket-form">Register Out</Button></>}>
        <form id="wicket-form" onSubmit={handleSaveWicket} className="flex flex-col gap-4">
          <Select
            label="Wicket Dismissal Type"
            options={[
              { value: "Bowled", label: "Bowled" },
              { value: "Caught", label: "Caught" },
              { value: "LBW", label: "LBW" },
              { value: "Run Out", label: "Run Out" },
              { value: "Stumped", label: "Stumped" },
              { value: "Hit Wicket", label: "Hit Wicket" },
            ]}
            value={wicketType}
            onChange={(e) => setWicketType(e.target.value as any)}
          />

          <Select
            label="Dismissed Player"
            options={[
              ...(match.currStriker ? [{ value: match.currStriker._id, label: `${match.currStriker.name} (Striker)` }] : []),
              ...(match.currNonStriker ? [{ value: match.currNonStriker._id, label: `${match.currNonStriker.name} (Non-Striker)` }] : []),
            ]}
            value={outPlayerId}
            onChange={(e) => setOutPlayerId(e.target.value)}
          />

          {/* New batsman selection */}
          <Select
            label="Incoming Batsman"
            options={[
              { value: "", label: "-- Select Incoming Player --" },
              ...battingPlayers
                .filter((p) => {
                  const stat = getStat(p._id);
                  return !stat.isOut && p._id !== match.currStriker?._id && p._id !== match.currNonStriker?._id;
                })
                .map((p) => ({ value: p._id, label: p.name })),
            ]}
            value={newBatsmanId}
            onChange={(e) => setNewBatsmanId(e.target.value)}
          />

          <Input
            label="Extra Runs conceded during dismissal (e.g. overthrows on run-out)"
            type="number"
            min="0"
            max="10"
            value={wicketExtraRuns}
            onChange={(e) => setWicketExtraRuns(e.target.value)}
          />
        </form>
      </Modal>

      {/* Change Bowler Modal */}
      <Modal isOpen={isBowlerModalOpen} onClose={() => setIsBowlerModalOpen(false)} title="Change Bowler" footer={<><Button variant="secondary" onClick={() => setIsBowlerModalOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="change-bowler-form">Apply Bowler</Button></>}>
        <form id="change-bowler-form" onSubmit={handleSaveBowlerChange} className="flex flex-col gap-4">
          <Select
            label="Select Next Bowler"
            options={bowlingPlayers
              .filter((p) => p._id !== match.currBowler?._id)
              .map((p) => ({ value: p._id, label: `${p.name} (${p.role ?? "Bowler"})` }))}
            value={newBowlerId}
            onChange={(e) => setNewBowlerId(e.target.value)}
          />
        </form>
      </Modal>

      {/* Innings Break Setup Modal */}
      <Modal isOpen={isInningsModalOpen} onClose={() => setIsInningsModalOpen(false)} title="Start New Innings Break Setup" footer={<><Button variant="secondary" onClick={() => setIsInningsModalOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="innings-form">Start Innings</Button></>}>
        <form id="innings-form" onSubmit={handleSaveInningsBreak} className="flex flex-col gap-4">
          <p className="text-xs text-zinc-550 border border-zinc-200 p-2.5 rounded-md bg-zinc-50 leading-relaxed font-semibold">
            Innings swap toggles batting and bowling teams. The opponent batting squad will now bat. Choose the opening batsman pair and the first bowler.
          </p>

          <Select
            label="Innings Opening Striker"
            options={bowlingPlayers.map((p) => ({ value: p._id, label: p.name }))}
            value={innStriker}
            onChange={(e) => setInnStriker(e.target.value)}
          />
          <Select
            label="Innings Opening Non-Striker"
            options={bowlingPlayers.filter((p) => p._id !== innStriker).map((p) => ({ value: p._id, label: p.name }))}
            value={innNonStriker}
            onChange={(e) => setInnNonStriker(e.target.value)}
          />
          <Select
            label="First Bowler"
            options={battingPlayers.map((p) => ({ value: p._id, label: p.name }))}
            value={innBowler}
            onChange={(e) => setInnBowler(e.target.value)}
          />
        </form>
      </Modal>

      {/* End Match Modal */}
      <Modal isOpen={isEndMatchModalOpen} onClose={() => setIsEndMatchModalOpen(false)} title="End Match & Set Winner" footer={<><Button variant="secondary" onClick={() => setIsEndMatchModalOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="end-match-form">Finalize Game</Button></>}>
        <form id="end-match-form" onSubmit={handleSaveEndMatch} className="flex flex-col gap-4">
          <Select
            label="Declare Match Winner"
            options={[
              { value: match.teamA._id, label: match.teamA.name },
              { value: match.teamB._id, label: match.teamB.name },
            ]}
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
