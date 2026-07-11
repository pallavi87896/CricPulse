"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Team {
  _id: string;
  name: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  _id: string;
  name: string;
  role: string;
  team: string; // Team ID
  createdAt?: string;
  updatedAt?: string;
}

export interface Match {
  _id: string;
  teamA: string; // Team ID
  teamB: string; // Team ID
  tossWinner: string; // Team ID
  tossDecision: "Bat" | "Bowl";
  innings: 1 | 2;
  score: number;
  wickets: number;
  extras: number;
  legalBalls: number;
  overs: number; // Max overs in match (e.g., 20)
  currStriker: string; // Player ID
  currNonStriker: string; // Player ID
  currBowler: string; // Player ID
  battingTeam: string; // Team ID
  bowlingTeam: string; // Team ID
  winner?: string; // Team ID
  target: number;
  venue: string;
  status: "Live" | "Upcoming" | "Ended";
  likes: number;
  dateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerStats {
  _id: string;
  match: string; // Match ID
  player: string; // Player ID
  runs: number;
  balls: number;
  wicketsTaken: number;
  legalBallsBowled: number;
  runsConceded: number;
  isOut: boolean;
}

export interface BallEvent {
  _id: string;
  match: string; // Match ID
  striker: string; // Player ID
  bowler: string; // Player ID
  ballType: "Normal" | "Wide" | "NoBall" | "Bye" | "LegBye";
  batsmanRuns: number;
  wicket: boolean;
  wicketType?: "Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped" | "Hit Wicket";
  outPlayer?: string; // Player ID
  newBatsman?: string; // Player ID
  newBowler?: string; // Player ID
  extraRuns: number;
}

export interface Comment {
  _id: string;
  match: string;
  username: string;
  comment: string;
  createdAt: string;
}

interface AppContextType {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerStats: PlayerStats[];
  ballEvents: BallEvent[];
  comments: Comment[];
  
  // Teams CRUD
  addTeam: (team: Omit<Team, "_id">) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  // Players CRUD
  addPlayer: (player: Omit<Player, "_id">) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  
  // Matches CRUD
  addMatch: (match: Omit<Match, "_id" | "score" | "wickets" | "extras" | "legalBalls" | "innings" | "target" | "likes">) => string;
  updateMatch: (id: string, match: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  
  // Live Score Actions
  addBall: (matchId: string, ball: Omit<BallEvent, "_id" | "match" | "striker" | "bowler">) => void;
  undoBall: (matchId: string) => void;
  changeBowler: (matchId: string, bowlerId: string) => void;
  changeStriker: (matchId: string, playerId: string) => void;
  changeNonStriker: (matchId: string, playerId: string) => void;
  endOver: (matchId: string, nextBowlerId: string) => void;
  endInnings: (matchId: string, newStriker: string, newNonStriker: string, newBowler: string) => void;
  endMatch: (matchId: string, winnerId: string) => void;
  addComment: (matchId: string, username: string, text: string) => void;
  
  // Getters helper
  getTeamName: (id: string) => string;
  getTeamLogo: (id: string) => string;
  getPlayerName: (id: string) => string;
  getPlayerRole: (id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Seed Data
const defaultTeams: Team[] = [
  { _id: "t1", name: "India", logo: "🇮🇳" },
  { _id: "t2", name: "Australia", logo: "🇦🇺" },
  { _id: "t3", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { _id: "t4", name: "South Africa", logo: "🇿🇦" },
];

const defaultPlayers: Player[] = [
  // India Players
  { _id: "p101", name: "Rohit Sharma", role: "Batsman", team: "t1" },
  { _id: "p102", name: "Virat Kohli", role: "Batsman", team: "t1" },
  { _id: "p103", name: "KL Rahul", role: "Wicketkeeper", team: "t1" },
  { _id: "p104", name: "Hardik Pandya", role: "All-Rounder", team: "t1" },
  { _id: "p105", name: "Jasprit Bumrah", role: "Bowler", team: "t1" },
  { _id: "p106", name: "Ravindra Jadeja", role: "All-Rounder", team: "t1" },
  { _id: "p107", name: "Mohammed Shami", role: "Bowler", team: "t1" },
  
  // Australia Players
  { _id: "p201", name: "Travis Head", role: "Batsman", team: "t2" },
  { _id: "p202", name: "Steve Smith", role: "Batsman", team: "t2" },
  { _id: "p203", name: "Glenn Maxwell", role: "All-Rounder", team: "t2" },
  { _id: "p204", name: "Alex Carey", role: "Wicketkeeper", team: "t2" },
  { _id: "p205", name: "Pat Cummins", role: "Bowler", team: "t2" },
  { _id: "p206", name: "Mitchell Starc", role: "Bowler", team: "t2" },
  { _id: "p207", name: "Josh Hazlewood", role: "Bowler", team: "t2" },

  // England Players
  { _id: "p301", name: "Jos Buttler", role: "Wicketkeeper", team: "t3" },
  { _id: "p302", name: "Joe Root", role: "Batsman", team: "t3" },
  { _id: "p303", name: "Ben Stokes", role: "All-Rounder", team: "t3" },
  { _id: "p304", name: "Jofra Archer", role: "Bowler", team: "t3" },

  // South Africa Players
  { _id: "p401", name: "Quinton de Kock", role: "Wicketkeeper", team: "t4" },
  { _id: "p402", name: "Heinrich Klaasen", role: "Batsman", team: "t4" },
  { _id: "p403", name: "Aiden Markram", role: "Batsman", team: "t4" },
  { _id: "p404", name: "Kagiso Rabada", role: "Bowler", team: "t4" },
];

const defaultMatches: Match[] = [
  {
    _id: "m1",
    teamA: "t1",
    teamB: "t2",
    tossWinner: "t1",
    tossDecision: "Bat",
    innings: 1,
    score: 124,
    wickets: 3,
    extras: 6,
    legalBalls: 86, // 14.2 overs
    overs: 20,
    currStriker: "p101",
    currNonStriker: "p102",
    currBowler: "p205",
    battingTeam: "t1",
    bowlingTeam: "t2",
    target: 0,
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "Live",
    likes: 428,
    dateTime: "2026-07-08T14:30",
  },
  {
    _id: "m2",
    teamA: "t3",
    teamB: "t4",
    tossWinner: "t4",
    tossDecision: "Bowl",
    innings: 2,
    score: 186,
    wickets: 8,
    extras: 12,
    legalBalls: 120, // 20 overs
    overs: 20,
    currStriker: "p301",
    currNonStriker: "p302",
    currBowler: "p404",
    battingTeam: "t3",
    bowlingTeam: "t4",
    winner: "t4",
    target: 185,
    venue: "Lord's, London",
    status: "Ended",
    likes: 198,
    dateTime: "2026-07-07T10:00",
  },
];

const defaultPlayerStats: PlayerStats[] = [
  // Rohit Sharma
  { _id: "ps1", match: "m1", player: "p101", runs: 58, balls: 38, wicketsTaken: 0, legalBallsBowled: 0, runsConceded: 0, isOut: false },
  // Virat Kohli
  { _id: "ps2", match: "m1", player: "p102", runs: 42, balls: 31, wicketsTaken: 0, legalBallsBowled: 0, runsConceded: 0, isOut: false },
  // Pat Cummins
  { _id: "ps3", match: "m1", player: "p205", runs: 0, balls: 0, wicketsTaken: 1, legalBallsBowled: 18, runsConceded: 24, isOut: false },
  // Mitchell Starc
  { _id: "ps4", match: "m1", player: "p206", runs: 0, balls: 0, wicketsTaken: 2, legalBallsBowled: 24, runsConceded: 35, isOut: false },
];

const defaultBallEvents: BallEvent[] = [
  { _id: "b1", match: "m1", striker: "p101", bowler: "p205", ballType: "Normal", batsmanRuns: 4, wicket: false, extraRuns: 0 },
  { _id: "b2", match: "m1", striker: "p101", bowler: "p205", ballType: "Wide", batsmanRuns: 0, wicket: false, extraRuns: 1 },
  { _id: "b3", match: "m1", striker: "p101", bowler: "p205", ballType: "Normal", batsmanRuns: 1, wicket: false, extraRuns: 0 },
  { _id: "b4", match: "m1", striker: "p102", bowler: "p205", ballType: "Normal", batsmanRuns: 0, wicket: true, wicketType: "Caught", outPlayer: "p103", extraRuns: 0 },
];

const defaultComments: Comment[] = [
  { _id: "c1", match: "m1", username: "Admin", comment: "Welcome to the live match scoring of India vs Australia!", createdAt: new Date().toISOString() },
  { _id: "c2", match: "m1", username: "Admin", comment: "Rohit Sharma looking in fine form today, hits a gorgeous boundary!", createdAt: new Date().toISOString() },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [ballEvents, setBallEvents] = useState<BallEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Load initial data from localStorage or seed
  useEffect(() => {
    const localTeams = localStorage.getItem("cp_teams");
    const localPlayers = localStorage.getItem("cp_players");
    const localMatches = localStorage.getItem("cp_matches");
    const localPlayerStats = localStorage.getItem("cp_playerStats");
    const localBallEvents = localStorage.getItem("cp_ballEvents");
    const localComments = localStorage.getItem("cp_comments");

    if (localTeams) setTeams(JSON.parse(localTeams));
    else {
      setTeams(defaultTeams);
      localStorage.setItem("cp_teams", JSON.stringify(defaultTeams));
    }

    if (localPlayers) setPlayers(JSON.parse(localPlayers));
    else {
      setPlayers(defaultPlayers);
      localStorage.setItem("cp_players", JSON.stringify(defaultPlayers));
    }

    if (localMatches) setMatches(JSON.parse(localMatches));
    else {
      setMatches(defaultMatches);
      localStorage.setItem("cp_matches", JSON.stringify(defaultMatches));
    }

    if (localPlayerStats) setPlayerStats(JSON.parse(localPlayerStats));
    else {
      setPlayerStats(defaultPlayerStats);
      localStorage.setItem("cp_playerStats", JSON.stringify(defaultPlayerStats));
    }

    if (localBallEvents) setBallEvents(JSON.parse(localBallEvents));
    else {
      setBallEvents(defaultBallEvents);
      localStorage.setItem("cp_ballEvents", JSON.stringify(defaultBallEvents));
    }

    if (localComments) setComments(JSON.parse(localComments));
    else {
      setComments(defaultComments);
      localStorage.setItem("cp_comments", JSON.stringify(defaultComments));
    }
  }, []);

  // Save utility
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper getters
  const getTeamName = (id: string) => teams.find(t => t._id === id)?.name || "Unknown Team";
  const getTeamLogo = (id: string) => teams.find(t => t._id === id)?.logo || "🏏";
  const getPlayerName = (id: string) => players.find(p => p._id === id)?.name || "Unknown Player";
  const getPlayerRole = (id: string) => players.find(p => p._id === id)?.role || "Player";

  // Teams CRUD
  const addTeam = (teamData: Omit<Team, "_id">) => {
    const newTeam: Team = {
      ...teamData,
      _id: "team_" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...teams, newTeam];
    setTeams(updated);
    saveToLocal("cp_teams", updated);
  };

  const updateTeam = (id: string, teamData: Partial<Team>) => {
    const updated = teams.map(t => t._id === id ? { ...t, ...teamData, updatedAt: new Date().toISOString() } : t);
    setTeams(updated);
    saveToLocal("cp_teams", updated);
  };

  const deleteTeam = (id: string) => {
    const updated = teams.filter(t => t._id !== id);
    setTeams(updated);
    saveToLocal("cp_teams", updated);
    // Cascade delete players in this team
    const updatedPlayers = players.filter(p => p.team !== id);
    setPlayers(updatedPlayers);
    saveToLocal("cp_players", updatedPlayers);
  };

  // Players CRUD
  const addPlayer = (playerData: Omit<Player, "_id">) => {
    const newPlayer: Player = {
      ...playerData,
      _id: "player_" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    saveToLocal("cp_players", updated);
  };

  const updatePlayer = (id: string, playerData: Partial<Player>) => {
    const updated = players.map(p => p._id === id ? { ...p, ...playerData, updatedAt: new Date().toISOString() } : p);
    setPlayers(updated);
    saveToLocal("cp_players", updated);
  };

  const deletePlayer = (id: string) => {
    const updated = players.filter(p => p._id !== id);
    setPlayers(updated);
    saveToLocal("cp_players", updated);
  };

  // Matches CRUD
  const addMatch = (matchData: Omit<Match, "_id" | "score" | "wickets" | "extras" | "legalBalls" | "innings" | "target" | "likes">) => {
    const newId = "match_" + Date.now();
    const newMatch: Match = {
      ...matchData,
      _id: newId,
      score: 0,
      wickets: 0,
      extras: 0,
      legalBalls: 0,
      innings: 1,
      target: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...matches, newMatch];
    setMatches(updated);
    saveToLocal("cp_matches", updated);

    // Initialize batsman/bowler player stats for this match if they are set
    const initStats: PlayerStats[] = [];
    if (matchData.currStriker) {
      initStats.push({
        _id: "ps_" + Date.now() + "_1",
        match: newId,
        player: matchData.currStriker,
        runs: 0,
        balls: 0,
        wicketsTaken: 0,
        legalBallsBowled: 0,
        runsConceded: 0,
        isOut: false,
      });
    }
    if (matchData.currNonStriker) {
      initStats.push({
        _id: "ps_" + Date.now() + "_2",
        match: newId,
        player: matchData.currNonStriker,
        runs: 0,
        balls: 0,
        wicketsTaken: 0,
        legalBallsBowled: 0,
        runsConceded: 0,
        isOut: false,
      });
    }
    if (matchData.currBowler) {
      initStats.push({
        _id: "ps_" + Date.now() + "_3",
        match: newId,
        player: matchData.currBowler,
        runs: 0,
        balls: 0,
        wicketsTaken: 0,
        legalBallsBowled: 0,
        runsConceded: 0,
        isOut: false,
      });
    }

    if (initStats.length > 0) {
      const updatedStats = [...playerStats, ...initStats];
      setPlayerStats(updatedStats);
      saveToLocal("cp_playerStats", updatedStats);
    }

    return newId;
  };

  const updateMatch = (id: string, matchData: Partial<Match>) => {
    const updated = matches.map(m => m._id === id ? { ...m, ...matchData, updatedAt: new Date().toISOString() } : m);
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  const deleteMatch = (id: string) => {
    const updated = matches.filter(m => m._id !== id);
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  // Helper to ensure a player's stats record exists for this match
  const getOrCreateStats = (mId: string, pId: string, currentStatsList: PlayerStats[]): { list: PlayerStats[]; stat: PlayerStats } => {
    const existing = currentStatsList.find(ps => ps.match === mId && ps.player === pId);
    if (existing) {
      return { list: currentStatsList, stat: existing };
    }
    const newStat: PlayerStats = {
      _id: "ps_" + mId + "_" + pId + "_" + Date.now(),
      match: mId,
      player: pId,
      runs: 0,
      balls: 0,
      wicketsTaken: 0,
      legalBallsBowled: 0,
      runsConceded: 0,
      isOut: false,
    };
    return { list: [...currentStatsList, newStat], stat: newStat };
  };

  // Live Score Action
  const addBall = (matchId: string, eventData: Omit<BallEvent, "_id" | "match" | "striker" | "bowler">) => {
    const match = matches.find(m => m._id === matchId);
    if (!match) return;

    const strikerId = match.currStriker;
    const bowlerId = match.currBowler;

    const ballEventId = "ball_" + Date.now();
    const newBallEvent: BallEvent = {
      ...eventData,
      _id: ballEventId,
      match: matchId,
      striker: strikerId,
      bowler: bowlerId,
    };

    // 1. Calculate Score & Extras
    let runsScored = eventData.batsmanRuns;
    let extraRuns = eventData.extraRuns;
    let isLegalBall = true;
    let teamRunsToAdd = 0;
    let teamExtrasToAdd = 0;

    switch (eventData.ballType) {
      case "Normal":
        teamRunsToAdd = runsScored + extraRuns;
        break;
      case "Wide":
        isLegalBall = false;
        teamRunsToAdd = 1 + extraRuns; // 1 run for Wide + any extra runs
        teamExtrasToAdd = 1 + extraRuns;
        break;
      case "NoBall":
        isLegalBall = false;
        teamRunsToAdd = 1 + runsScored + extraRuns; // 1 run for NoBall + batsman runs + extraRuns
        teamExtrasToAdd = 1 + extraRuns;
        break;
      case "Bye":
      case "LegBye":
        teamRunsToAdd = extraRuns; // no batsman runs, all extras
        teamExtrasToAdd = extraRuns;
        break;
    }

    // 2. Update Player Stats (Batsman and Bowler)
    let currentStats = [...playerStats];
    
    // Get/create striker stats
    const strikerRes = getOrCreateStats(matchId, strikerId, currentStats);
    currentStats = strikerRes.list;
    const strikerStat = strikerRes.stat;

    // Get/create bowler stats
    const bowlerRes = getOrCreateStats(matchId, bowlerId, currentStats);
    currentStats = bowlerRes.list;
    const bowlerStat = bowlerRes.stat;

    // Batsman stats updates
    if (eventData.ballType !== "Wide") {
      strikerStat.balls += 1;
    }
    strikerStat.runs += runsScored;

    // Bowler stats updates
    if (isLegalBall) {
      bowlerStat.legalBallsBowled += 1;
    }
    // Conceded runs
    let bowlerConceded = 0;
    if (eventData.ballType === "Wide") {
      bowlerConceded = 1 + extraRuns;
    } else if (eventData.ballType === "NoBall") {
      bowlerConceded = 1 + runsScored + extraRuns;
    } else {
      bowlerConceded = runsScored;
    }
    bowlerStat.runsConceded += bowlerConceded;

    // Handle wicket
    let nextStriker = match.currStriker;
    let nextNonStriker = match.currNonStriker;
    let isWicket = eventData.wicket;

    if (isWicket) {
      const outPlayerId = eventData.outPlayer || strikerId;
      // Mark out player as out
      const outRes = getOrCreateStats(matchId, outPlayerId, currentStats);
      currentStats = outRes.list;
      outRes.stat.isOut = true;

      // Update bowler wicket count
      if (eventData.wicketType !== "Run Out") {
        bowlerStat.wicketsTaken += 1;
      }

      // Replace out player with new batsman
      if (eventData.newBatsman) {
        if (outPlayerId === strikerId) {
          nextStriker = eventData.newBatsman;
        } else {
          nextNonStriker = eventData.newBatsman;
        }
        // Initialize new batsman stats
        currentStats = getOrCreateStats(matchId, eventData.newBatsman, currentStats).list;
      }
    }

    // Update match scores
    const updatedMatch = { ...match };
    updatedMatch.score += teamRunsToAdd;
    updatedMatch.extras += teamExtrasToAdd;
    if (isLegalBall) {
      updatedMatch.legalBalls += 1;
    }
    if (isWicket) {
      updatedMatch.wickets += 1;
    }

    // Strike rotation logic
    const totalMoveRuns = (eventData.ballType === "Normal" || eventData.ballType === "NoBall") ? runsScored : 0;
    const byeLegByeMoveRuns = (eventData.ballType === "Bye" || eventData.ballType === "LegBye") ? extraRuns : 0;
    const rotateForRuns = (totalMoveRuns + byeLegByeMoveRuns) % 2 === 1;

    if (rotateForRuns) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    // If over completed, swap strikers
    const isOverEnd = isLegalBall && (updatedMatch.legalBalls % 6 === 0);
    if (isOverEnd) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    updatedMatch.currStriker = nextStriker;
    updatedMatch.currNonStriker = nextNonStriker;

    // Apply bowler changes if provided
    if (eventData.newBowler) {
      updatedMatch.currBowler = eventData.newBowler;
      currentStats = getOrCreateStats(matchId, eventData.newBowler, currentStats).list;
    }

    // Update state
    const updatedMatches = matches.map(m => m._id === matchId ? updatedMatch : m);
    setMatches(updatedMatches);
    saveToLocal("cp_matches", updatedMatches);

    const updatedEvents = [...ballEvents, newBallEvent];
    setBallEvents(updatedEvents);
    saveToLocal("cp_ballEvents", updatedEvents);

    setPlayerStats(currentStats);
    saveToLocal("cp_playerStats", currentStats);

    // Auto commentary
    let commText = `Ball ${Math.floor(updatedMatch.legalBalls / 6)}.${updatedMatch.legalBalls % 6}: ${getPlayerName(bowlerId)} to ${getPlayerName(strikerId)}, `;
    if (isWicket) {
      commText += `OUT! (${eventData.wicketType}) ${getPlayerName(eventData.outPlayer || strikerId)} departs!`;
    } else {
      if (eventData.ballType === "Normal") {
        commText += `${runsScored} run${runsScored === 1 ? "" : "s"}.`;
      } else {
        commText += `${eventData.ballType} (${teamRunsToAdd} runs total).`;
      }
    }

    const newComment: Comment = {
      _id: "comm_" + Date.now(),
      match: matchId,
      username: "Live Scoring",
      comment: commText,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveToLocal("cp_comments", updatedComments);
  };

  const undoBall = (matchId: string) => {
    const matchEvents = ballEvents.filter(b => b.match === matchId);
    if (matchEvents.length === 0) return;

    const lastEvent = matchEvents[matchEvents.length - 1];
    const match = matches.find(m => m._id === matchId);
    if (!match) return;

    let runsScored = lastEvent.batsmanRuns;
    let extraRuns = lastEvent.extraRuns;
    let isLegalBall = true;
    let teamRunsToRemove = 0;
    let teamExtrasToRemove = 0;

    switch (lastEvent.ballType) {
      case "Normal":
        teamRunsToRemove = runsScored + extraRuns;
        break;
      case "Wide":
        isLegalBall = false;
        teamRunsToRemove = 1 + extraRuns;
        teamExtrasToRemove = 1 + extraRuns;
        break;
      case "NoBall":
        isLegalBall = false;
        teamRunsToRemove = 1 + runsScored + extraRuns;
        teamExtrasToRemove = 1 + extraRuns;
        break;
      case "Bye":
      case "LegBye":
        teamRunsToRemove = extraRuns;
        teamExtrasToRemove = extraRuns;
        break;
    }

    // Revert match stats
    const updatedMatch = { ...match };
    updatedMatch.score = Math.max(0, updatedMatch.score - teamRunsToRemove);
    updatedMatch.extras = Math.max(0, updatedMatch.extras - teamExtrasToRemove);
    if (isLegalBall) {
      updatedMatch.legalBalls = Math.max(0, updatedMatch.legalBalls - 1);
    }
    if (lastEvent.wicket) {
      updatedMatch.wickets = Math.max(0, updatedMatch.wickets - 1);
    }

    // Revert Player Stats
    let currentStats = [...playerStats];
    const strikerStat = currentStats.find(ps => ps.match === matchId && ps.player === lastEvent.striker);
    const bowlerStat = currentStats.find(ps => ps.match === matchId && ps.player === lastEvent.bowler);

    if (strikerStat) {
      if (lastEvent.ballType !== "Wide") {
        strikerStat.balls = Math.max(0, strikerStat.balls - 1);
      }
      strikerStat.runs = Math.max(0, strikerStat.runs - runsScored);
      if (lastEvent.wicket && (lastEvent.outPlayer === lastEvent.striker || !lastEvent.outPlayer)) {
        strikerStat.isOut = false;
      }
    }

    if (bowlerStat) {
      if (isLegalBall) {
        bowlerStat.legalBallsBowled = Math.max(0, bowlerStat.legalBallsBowled - 1);
      }
      let bowlerConceded = 0;
      if (lastEvent.ballType === "Wide") {
        bowlerConceded = 1 + extraRuns;
      } else if (lastEvent.ballType === "NoBall") {
        bowlerConceded = 1 + runsScored + extraRuns;
      } else {
        bowlerConceded = runsScored;
      }
      bowlerStat.runsConceded = Math.max(0, bowlerStat.runsConceded - bowlerConceded);

      if (lastEvent.wicket && lastEvent.wicketType !== "Run Out") {
        bowlerStat.wicketsTaken = Math.max(0, bowlerStat.wicketsTaken - 1);
      }
    }

    if (lastEvent.wicket && lastEvent.outPlayer && lastEvent.outPlayer !== lastEvent.striker) {
      const otherOutStat = currentStats.find(ps => ps.match === matchId && ps.player === lastEvent.outPlayer);
      if (otherOutStat) otherOutStat.isOut = false;
    }

    // Restore strikers to how they were before this ball
    updatedMatch.currStriker = lastEvent.striker;

    // Remove the ball event
    const updatedEvents = ballEvents.filter(b => b._id !== lastEvent._id);
    setBallEvents(updatedEvents);
    saveToLocal("cp_ballEvents", updatedEvents);

    const updatedMatches = matches.map(m => m._id === matchId ? updatedMatch : m);
    setMatches(updatedMatches);
    saveToLocal("cp_matches", updatedMatches);

    setPlayerStats(currentStats);
    saveToLocal("cp_playerStats", currentStats);

    // Remove last commentary
    const matchComments = comments.filter(c => c.match === matchId);
    if (matchComments.length > 0) {
      const lastCommId = matchComments[matchComments.length - 1]._id;
      const updatedComments = comments.filter(c => c._id !== lastCommId);
      setComments(updatedComments);
      saveToLocal("cp_comments", updatedComments);
    }
  };

  const changeBowler = (matchId: string, bowlerId: string) => {
    const updated = matches.map(m => m._id === matchId ? { ...m, currBowler: bowlerId } : m);
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  const changeStriker = (matchId: string, playerId: string) => {
    const updated = matches.map(m => m._id === matchId ? { ...m, currStriker: playerId } : m);
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  const changeNonStriker = (matchId: string, playerId: string) => {
    const updated = matches.map(m => m._id === matchId ? { ...m, currNonStriker: playerId } : m);
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  const endOver = (matchId: string, nextBowlerId: string) => {
    const updated = matches.map(m => {
      if (m._id === matchId) {
        return {
          ...m,
          currBowler: nextBowlerId,
        };
      }
      return m;
    });
    setMatches(updated);
    saveToLocal("cp_matches", updated);
  };

  const endInnings = (matchId: string, newStriker: string, newNonStriker: string, newBowler: string) => {
    const updated = matches.map(m => {
      if (m._id === matchId) {
        const nextInnings = m.innings === 1 ? 2 : 1;
        const newBatting = m.bowlingTeam;
        const newBowling = m.battingTeam;
        return {
          ...m,
          innings: nextInnings as 1 | 2,
          target: m.score + 1,
          score: 0,
          wickets: 0,
          extras: 0,
          legalBalls: 0,
          battingTeam: newBatting,
          bowlingTeam: newBowling,
          currStriker: newStriker,
          currNonStriker: newNonStriker,
          currBowler: newBowler,
        };
      }
      return m;
    });
    setMatches(updated);
    saveToLocal("cp_matches", updated);

    const newComment: Comment = {
      _id: "comm_" + Date.now(),
      match: matchId,
      username: "Live Scoring",
      comment: `Innings break! Batting team changes. Target: ${updated.find(m => m._id === matchId)?.target}`,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveToLocal("cp_comments", updatedComments);
  };

  const endMatch = (matchId: string, winnerId: string) => {
    const updated = matches.map(m => m._id === matchId ? { ...m, status: "Ended" as const, winner: winnerId } : m);
    setMatches(updated);
    saveToLocal("cp_matches", updated);

    const newComment: Comment = {
      _id: "comm_" + Date.now(),
      match: matchId,
      username: "Live Scoring",
      comment: `Match Ended! Winner: ${getTeamName(winnerId)}`,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveToLocal("cp_comments", updatedComments);
  };

  const addComment = (matchId: string, username: string, text: string) => {
    const newComment: Comment = {
      _id: "comm_" + Date.now(),
      match: matchId,
      username,
      comment: text,
      createdAt: new Date().toISOString(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    saveToLocal("cp_comments", updated);
  };

  return (
    <AppContext.Provider
      value={{
        teams,
        players,
        matches,
        playerStats,
        ballEvents,
        comments,
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addMatch,
        updateMatch,
        deleteMatch,
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
        getPlayerRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
