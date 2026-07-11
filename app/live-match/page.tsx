"use client";

import React, { useEffect, useState } from "react";
import { useApp, Match, Player, PlayerStats } from "@/context/AppContext";
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

export default function LiveMatchPage() {
  const {
    matches,
    players,
    teams,
    playerStats,
    ballEvents,
    comments,
    addBall,
    undoBall,
    changeBowler,
    changeStriker,
    changeNonStriker,
    endOver,
    endInnings,
    endMatch,
    addComment,
    getTeamName,
    getTeamLogo,
    getPlayerName,
  } = useApp();

  // Active scoring match state
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [liveMatches,setLiveMatches] = useState<MatchType[]>([]);
  const [loading,setLoading] = useState(true);

  const [match,setMatch] = useState<MatchType | null>(null);
  const [scorecard,setScorecard] = useState<PlayerStatsType[]>([]);
  const [recentBalls,setRecentBalls] = useState<BallEventType[]>([]);
  const [comments,setComments] = useState<CommentType[]>([]);

  const fetchMatches = async()=>{
    const res = await fetch("/api/match");

    const data = await res.json();

    const filteredData = data.filter((match : MatchType)=> match.status === "Live");
    setLiveMatches(filteredData);

    if(filteredData.length>0){
      setSelectedMatchId(liveMatches[0]._id);
    }
  };

  const fetchLiveMatches = async(matchId:string)=>{
    const res = await fetch(`/api/live-match/${matchId}`)

    if(!res.json) throw new Error("error getting the live match");

    const data = await res.json();
  }

  useEffect(()=>{fetchLiveMatches(selectedMatchId)},[]);

  

  const seletedMatch = liveMatches.find((match)=>match._id === selectedMatchId);

  // Wicket Modal State
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [wicketType, setWicketType] = useState<"Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped" | "Hit Wicket">("Bowled");
  const [outPlayerId, setOutPlayerId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");
  const [wicketExtraRuns, setWicketExtraRuns] = useState("0");

  // Change Bowler Modal State
  const [isBowlerModalOpen, setIsBowlerModalOpen] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState("");

  // End Innings Modal State
  const [isInningsModalOpen, setIsInningsModalOpen] = useState(false);
  const [innStriker, setInnStriker] = useState("");
  const [innNonStriker, setInnNonStriker] = useState("");
  const [innBowler, setInnBowler] = useState("");

  // End Match Modal State
  const [isEndMatchModalOpen, setIsEndMatchModalOpen] = useState(false);
  const [winnerId, setWinnerId] = useState("");

  // Custom commentary text input state
  const [customComment, setCustomComment] = useState("");

  // Filter live matches
  const liveMatchesList = matches.filter((m) => m.status === "Live");

  // Automatically select the first live match if not set
  React.useEffect(() => {
    if (!selectedMatchId && liveMatchesList.length > 0) {
      setSelectedMatchId(liveMatchesList[0]._id);
    }
  }, [liveMatchesList, selectedMatchId]);

  const match = matches.find((m) => m._id === selectedMatchId);

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

            {matches.filter((m) => m.status === "Upcoming").length > 0 && (
              <div className="mt-6 w-full max-w-xs flex flex-col gap-3">
                <Select
                  label="Select Upcoming Match to Start"
                  options={[
                    { value: "", label: "-- Choose Match --" },
                    ...matches
                      .filter((m) => m.status === "Upcoming")
                      .map((m) => ({
                        value: m._id,
                        label: `${getTeamName(m.teamA)} vs ${getTeamName(m.teamB)}`,
                      })),
                  ]}
                  value={selectedMatchId}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      const mToStart = matches.find((x) => x._id === id);
                      if (mToStart) {
                        mToStart.status = "Live";
                        localStorage.setItem("cp_matches", JSON.stringify(matches));
                        setSelectedMatchId(id);
                      }
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

  // Derived properties for current match
  const battingPlayers = players.filter((p) => p.team === match.battingTeam);
  const bowlingPlayers = players.filter((p) => p.team === match.bowlingTeam);

  // Stats lookups
  const getStat = (playerId: string) => {
    return (
      playerStats.find((ps) => ps.match === match._id && ps.player === playerId) || {
        runs: 0,
        balls: 0,
        wicketsTaken: 0,
        legalBallsBowled: 0,
        runsConceded: 0,
        isOut: false,
      }
    );
  };

  const strikerStat = getStat(match.currStriker);
  const nonStrikerStat = getStat(match.currNonStriker);
  const bowlerStat = getStat(match.currBowler);

  // Calculations
  const totalOvers = match.overs;
  const legalBalls = match.legalBalls;
  const score = match.score;
  const wickets = match.wickets;

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
  const currentMatchEvents = ballEvents.filter((b) => b.match === match._id);
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
  const handleScoreRuns = (runs: number) => {
    addBall(match._id, {
      ballType: "Normal",
      batsmanRuns: runs,
      wicket: false,
      extraRuns: 0,
    });
  };

  const handleScoreExtra = (type: "Wide" | "NoBall" | "Bye" | "LegBye", runs: number = 0) => {
    // Standard bye / leg bye usually represents run values like 1, 2, 4. So we default to 1, or prompt
    const defaultRuns = type === "Wide" || type === "NoBall" ? 0 : 1;
    addBall(match._id, {
      ballType: type,
      batsmanRuns: type === "NoBall" ? runs : 0, // batsman can score runs off no-balls
      wicket: false,
      extraRuns: type === "Wide" || type === "NoBall" ? runs : runs || defaultRuns,
    });
  };

  // Open Wicket Dialog
  const handleOpenWicket = () => {
    setWicketType("Bowled");
    setOutPlayerId(match.currStriker);
    
    // Suggest first player from batting team who hasn't batted yet
    const alreadyBattedIds = playerStats
      .filter((ps) => ps.match === match._id && (ps.runs > 0 || ps.balls > 0 || ps.isOut || ps.player === match.currStriker || ps.player === match.currNonStriker))
      .map((ps) => ps.player);

    const unbattedPlayers = battingPlayers.filter((p) => !alreadyBattedIds.includes(p._id));
    setNewBatsmanId(unbattedPlayers[0]?._id || "");
    setWicketExtraRuns("0");
    setIsWicketModalOpen(true);
  };

  const handleSaveWicket = (e: React.FormEvent) => {
    e.preventDefault();
    addBall(match._id, {
      ballType: "Normal",
      batsmanRuns: 0,
      wicket: true,
      wicketType,
      outPlayer: outPlayerId,
      newBatsman: newBatsmanId || undefined,
      extraRuns: Number(wicketExtraRuns),
    });
    setIsWicketModalOpen(false);
  };

  // Open Bowler Modal
  const handleOpenBowlerChange = () => {
    const activeBowlers = bowlingPlayers.filter((p) => p.role === "Bowler" || p.role === "All-Rounder");
    const otherBowlers = activeBowlers.filter((p) => p._id !== match.currBowler);
    setNewBowlerId(otherBowlers[0]?._id || bowlingPlayers[0]?._id || "");
    setIsBowlerModalOpen(true);
  };

  const handleSaveBowlerChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBowlerId) {
      changeBowler(match._id, newBowlerId);
    }
    setIsBowlerModalOpen(false);
  };

  // Open Innings Modal
  const handleOpenInningsBreak = () => {
    // Pre-populate selectors for next innings (swap batting and bowling)
    const nextBattingTeamId = match.bowlingTeam;
    const nextBowlingTeamId = match.battingTeam;
    
    const nextBatters = players.filter((p) => p.team === nextBattingTeamId);
    const nextBowlers = players.filter((p) => p.team === nextBowlingTeamId);

    setInnStriker(nextBatters[0]?._id || "");
    setInnNonStriker(nextBatters[1]?._id || "");
    setInnBowler(nextBowlers[0]?._id || "");
    setIsInningsModalOpen(true);
  };

  const handleSaveInningsBreak = (e: React.FormEvent) => {
    e.preventDefault();
    if (innStriker === innNonStriker) {
      alert("Striker and Non-Striker must be different players.");
      return;
    }
    endInnings(match._id, innStriker, innNonStriker, innBowler);
    setIsInningsModalOpen(false);
  };

  // Open End Match Modal
  const handleOpenEndMatch = () => {
    setWinnerId(match.teamA);
    setIsEndMatchModalOpen(true);
  };

  const handleSaveEndMatch = (e: React.FormEvent) => {
    e.preventDefault();
    endMatch(match._id, winnerId);
    setIsEndMatchModalOpen(false);
  };

  // Custom commentary
  const handleAddCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (customComment.trim()) {
      addComment(match._id, "Scorer Panel", customComment.trim());
      setCustomComment("");
    }
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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Title Bar with Match Switcher */}
      <PageHeader
        title="Live Scoring Console"
        description="Score wickets, boundaries, rotates strikes, and publishes commentaries instantly."
        actions={
          <div className="flex items-center gap-2">
            <Select
              options={liveMatchesList.map((m) => ({
                value: m._id,
                label: `${getTeamName(m.teamA)} vs ${getTeamName(m.teamB)}`,
              }))}
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="py-1 px-2.5 max-w-xs shadow-xs text-xs font-semibold"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Redirect user to matches page if they want to manage states
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg text-white p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTeamLogo(match.battingTeam)}</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{getTeamName(match.battingTeam)}</h2>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Batting Innings {match.innings}</p>
                </div>
              </div>
              <div>
                <Badge status="Live" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <div className="col-span-2 sm:col-span-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Score</span>
                <div className="text-4xl font-extrabold font-mono mt-0.5 text-zinc-50">
                  {score}/{wickets}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Overs</span>
                <div className="text-xl font-bold font-mono mt-0.5 text-zinc-150">
                  {oversStr} <span className="text-zinc-500 text-sm">/ {totalOvers}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Run Rate</span>
                <div className="text-xl font-bold font-mono mt-0.5 text-zinc-150">{runRate}</div>
              </div>
            </div>

            {match.target > 0 && (
              <div className="bg-zinc-850 p-2.5 rounded-md border border-zinc-800 text-xs text-zinc-300">
                🎯 Target: <strong>{match.target} runs</strong>. Need{" "}
                <strong>{Math.max(0, match.target - score)} runs</strong> from{" "}
                <strong>{Math.max(0, match.overs * 6 - legalBalls)} balls</strong>.
              </div>
            )}
          </div>

          {/* 2. Middle Cards (Batsman and Bowler Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Striker */}
            <Card className="border-l-4 border-l-blue-600 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Striker 🏏</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{getPlayerName(match.currStriker)}</h4>
                </div>
                <button
                  onClick={() => {
                    const otherId = battingPlayers.find((p) => p._id !== match.currStriker && p._id !== match.currNonStriker && !getStat(p._id).isOut)?._id;
                    if (otherId) changeStriker(match._id, otherId);
                  }}
                  title="Swap Striker"
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <span className="text-xl font-bold font-mono">{strikerStat.runs}</span>
                <span className="text-xs text-zinc-500 font-mono">
                  {strikerStat.balls}b (SR {strikerSR})
                </span>
              </div>
            </Card>

            {/* Non-Striker */}
            <Card className="bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Non-Striker</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{getPlayerName(match.currNonStriker)}</h4>
                </div>
                <button
                  onClick={() => {
                    const otherId = battingPlayers.find((p) => p._id !== match.currStriker && p._id !== match.currNonStriker && !getStat(p._id).isOut)?._id;
                    if (otherId) changeNonStriker(match._id, otherId);
                  }}
                  title="Swap Non-Striker"
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <span className="text-xl font-bold font-mono text-zinc-700">{nonStrikerStat.runs}</span>
                <span className="text-xs text-zinc-500 font-mono">
                  {nonStrikerStat.balls}b (SR {nonStrikerSR})
                </span>
              </div>
            </Card>

            {/* Bowler */}
            <Card className="bg-white border-l-4 border-l-zinc-700">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Bowler ⚾</span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{getPlayerName(match.currBowler)}</h4>
                </div>
                <button
                  onClick={handleOpenBowlerChange}
                  title="Change Bowler"
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <span className="text-xl font-bold font-mono text-zinc-700">
                  {bowlerStat.wicketsTaken}-{bowlerStat.runsConceded}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {bowlerOversStr}ov (Econ {bowlerEcon})
                </span>
              </div>
            </Card>
          </div>

          {/* 3. Large Scoring Keypad Controls */}
          <Card title="Scoring Keypad" subtitle="Click options to register ball outcomes instantly">
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
                  <Button variant="secondary" className="py-2.5 font-semibold text-xs" onClick={() => handleScoreExtra("Wide")}>
                    Wide (+1)
                  </Button>
                  <Button variant="secondary" className="py-2.5 font-semibold text-xs" onClick={() => handleScoreExtra("NoBall")}>
                    No Ball (+1)
                  </Button>
                  <Button variant="secondary" className="py-2.5 font-semibold text-xs" onClick={() => handleScoreExtra("Bye")}>
                    Bye (+1)
                  </Button>
                  <Button variant="secondary" className="py-2.5 font-semibold text-xs" onClick={() => handleScoreExtra("LegBye")}>
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
                  <Button
                    variant="secondary"
                    className="py-2.5 text-zinc-700 hover:bg-zinc-100 font-semibold text-xs"
                    onClick={() => undoBall(match._id)}
                    disabled={currentMatchEvents.length === 0}
                  >
                    Undo Last Ball
                  </Button>
                  <Button variant="secondary" className="py-2.5 font-semibold text-xs" onClick={handleOpenBowlerChange}>
                    Change Bowler
                  </Button>
                  <Button
                    variant="secondary"
                    className="py-2.5 font-semibold text-xs"
                    onClick={() => {
                      // Autocomplete current over end or force swap strikers
                      const nextBId = bowlingPlayers.find(p => p._id !== match.currBowler)?._id || "";
                      if (nextBId) endOver(match._id, nextBId);
                      alert("Over Ended. Strike Swapped. Choose a Bowler!");
                    }}
                  >
                    End Over
                  </Button>
                </div>
              </div>

              {/* Innings and Match End states */}
              <div className="border-t border-zinc-150 pt-3 flex items-center justify-between gap-3">
                <Button variant="secondary" size="sm" className="w-1/2 text-xs" onClick={handleOpenInningsBreak}>
                  End Innings Break
                </Button>
                <Button variant="secondary" size="sm" className="w-1/2 text-xs text-red-650 hover:bg-red-50" onClick={handleOpenEndMatch}>
                  End Match (Declare Winner)
                </Button>
              </div>
            </div>
          </Card>
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
                  else if (val === "4" || val === "6") bg = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
                  
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Batting Scorecard</span>
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
                      if (stats.runs === 0 && stats.balls === 0 && !stats.isOut && p._id !== match.currStriker && p._id !== match.currNonStriker) {
                        return null; // Not batted yet
                      }
                      
                      const isStriker = p._id === match.currStriker;
                      const isNonStriker = p._id === match.currNonStriker;

                      return (
                        <div key={p._id} className={`px-3 py-1.5 flex justify-between items-center ${isStriker || isNonStriker ? "bg-blue-50/30" : ""}`}>
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Bowling Scorecard</span>
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
                      if (stats.legalBallsBowled === 0 && p._id !== match.currBowler) {
                        return null; // Not bowled yet
                      }
                      const isBowler = p._id === match.currBowler;
                      const ovs = `${Math.floor(stats.legalBallsBowled / 6)}.${stats.legalBallsBowled % 6}`;

                      return (
                        <div key={p._id} className={`px-3 py-1.5 flex justify-between items-center ${isBowler ? "bg-zinc-100/50" : ""}`}>
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
                .filter((c) => c.match === match._id)
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
              { value: match.currStriker, label: `${getPlayerName(match.currStriker)} (Striker)` },
              { value: match.currNonStriker, label: `${getPlayerName(match.currNonStriker)} (Non-Striker)` },
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
                  return !stat.isOut && p._id !== match.currStriker && p._id !== match.currNonStriker;
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
              .filter((p) => p._id !== match.currBowler)
              .map((p) => ({ value: p._id, label: `${p.name} (${p.role})` }))}
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
            options={players.filter((p) => p.team === match.bowlingTeam).map((p) => ({ value: p._id, label: p.name }))}
            value={innStriker}
            onChange={(e) => setInnStriker(e.target.value)}
          />
          <Select
            label="Innings Opening Non-Striker"
            options={players.filter((p) => p.team === match.bowlingTeam).map((p) => ({ value: p._id, label: p.name }))}
            value={innNonStriker}
            onChange={(e) => setInnNonStriker(e.target.value)}
          />
          <Select
            label="First Bowler"
            options={players.filter((p) => p.team === match.battingTeam).map((p) => ({ value: p._id, label: p.name }))}
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
              { value: match.teamA, label: getTeamName(match.teamA) },
              { value: match.teamB, label: getTeamName(match.teamB) },
            ]}
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
