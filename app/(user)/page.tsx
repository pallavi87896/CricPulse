"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { MatchType } from "@/types/matchType";
import { getSocket } from "@/socket/client";

export default function UserMatchDashboard() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetch("/api/match");
      if (!res.ok) throw new Error("Failed to load match listings");
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(true);
  }, []);

  // Set up socket listener for real-time updates
  useEffect(() => {
    const socket = getSocket();

    // Join room for each match so we get real-time updates
    matches.forEach((match) => {
      socket.emit("join_match", match._id);
    });

    const handleUpdate = () => {
      // Silently refetch matches without resetting loading state
      fetchMatches(false);
    };

    socket.on("match_updated", handleUpdate);

    return () => {
      socket.off("match_updated", handleUpdate);
    };
  }, [matches]);

  const liveMatches = matches.filter((m) => m.status === "Live");
  const upcomingMatches = matches.filter((m) => m.status === "Upcoming");
  const completedMatches = matches.filter((m) => m.status === "Ended");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  // Common card renderer for active and ended scorecards to keep them exactly uniform
  const renderScorecard = (match: MatchType, isLive: boolean) => {
    const legalBalls = match.legalBalls || 0;
    const ovsStr = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

    return (
      <Link key={match._id} href={`/match/${match._id}`} className="block">
        <div className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer">

          {/* Header line: Venue and status */}
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-3">
            <span>{match.venue || "Stadium Ground"}</span>
            {isLive ? (
              <span className="text-[var(--color-brand-accent)] bg-[var(--color-brand-secondary)] px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                Live • Innings {match.innings}
              </span>
            ) : (
              <span className="text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md font-bold">
                Ended
              </span>
            )}
          </div>

          {/* Highly Aligned Match score display */}
          <div className="grid grid-cols-3 items-center justify-center py-2 sm:py-4 gap-4">
            {/* Team A Details */}
            <div className="flex flex-col items-center text-center gap-2">
              <TeamLogo logo={match.teamA?.logo} name={match.teamA?.name ?? "Deleted Team"} size="md" className="bg-zinc-50" />
              <span className={`text-sm font-bold leading-tight ${!isLive && match.winner?._id === match.teamB?._id ? "text-zinc-400" : "text-zinc-900"}`}>
                {match.teamA?.name ?? "Deleted Team"}
              </span>
              {isLive && match.battingTeam?._id === match.teamA?._id && (
                <span className="text-[9px] font-bold text-white bg-[var(--color-brand-accent)] px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Batting
                </span>
              )}
            </div>

            {/* Score Indicator */}
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 tracking-tight">
                {match.score}/{match.wickets}
              </div>
              <div className="text-xs text-zinc-500 font-mono font-semibold">
                {ovsStr} / {match.overs} ov
              </div>
            </div>

            {/* Team B Details */}
            <div className="flex flex-col items-center text-center gap-2">
              <TeamLogo logo={match.teamB?.logo} name={match.teamB?.name ?? "Deleted Team"} size="md" className="bg-zinc-50" />
              <span className={`text-sm font-bold leading-tight ${!isLive && match.winner?._id === match.teamA?._id ? "text-zinc-400" : "text-zinc-900"}`}>
                {match.teamB?.name ?? "Deleted Team"}
              </span>
              {isLive && match.battingTeam?._id === match.teamB?._id && (
                <span className="text-[9px] font-bold text-white bg-[var(--color-brand-accent)] px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Batting
                </span>
              )}
            </div>
          </div>

          {/* Bottom details */}
          {isLive ? (
            match.target > 0 ? (
              <div className="bg-[var(--color-brand-secondary)] border border-[var(--color-brand-primary)]/15 p-2.5 rounded-xl text-center text-xs font-bold text-[var(--color-brand-dark)]">
                Target: {match.target} runs • Need {Math.max(0, match.target - match.score)} runs in {Math.max(0, match.overs * 6 - legalBalls)} balls
              </div>
            ) : (
              match.tossWinner && (
                <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {match.tossWinner?.name ?? "Unknown"} won the toss and elected to {match.tossDecision} first
                </div>
              )
            )
          ) : (
            match.winner ? (
              <div className="bg-green-50 border border-green-200/50 p-2.5 rounded-xl text-center text-xs font-bold text-green-700">
                🏆 Winner: {match.winner?.name ?? "Unknown"} won the match!
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl text-center text-xs font-bold text-zinc-600">
                Match Finished
              </div>
            )
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto py-2">
      {/* 1. LIVE MATCHES SECTION */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-zinc-200 pb-3 text-left">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            Live Matches
            {liveMatches.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-650 border border-red-100 animate-pulse">
                LIVE
              </span>
            )}
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {liveMatches.length === 0 ? (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 text-center text-zinc-500 shadow-sm flex flex-col items-center gap-2">
              <span className="text-2xl">🏏</span>
              <span className="font-bold text-zinc-700 text-xs">No active matches at the moment</span>
            </div>
          ) : (
            liveMatches.map((match) => renderScorecard(match, true))
          )}
        </div>
      </div>

      {/* 2. UPCOMING MATCHES SECTION */}
      {upcomingMatches.length > 0 && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="border-b border-zinc-200 pb-3 text-left">
            <h2 className="text-lg font-bold text-zinc-800">
              Upcoming Fixtures
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingMatches.map((match) => (
              <Link key={match._id} href={`/match/${match._id}`} className="block">
                <div className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-5 flex flex-col gap-4 shadow-xs transition-colors">
                  <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
                    <span>{match.venue || "TBD Stadium"}</span>
                    <span className="text-[var(--color-brand-accent)] font-bold">
                      {match.dateTime ? new Date(match.dateTime).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TeamLogo logo={match.teamA?.logo} name={match.teamA?.name ?? "Deleted Team"} size="sm" />
                      <span className="text-sm font-bold text-zinc-900">{match.teamA?.name ?? "Deleted Team"}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-bold px-2">VS</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-900">{match.teamB?.name ?? "Deleted Team"}</span>
                      <TeamLogo logo={match.teamB?.logo} name={match.teamB?.name ?? "Deleted Team"} size="sm" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. COMPLETED MATCHES SECTION */}
      {completedMatches.length > 0 && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="border-b border-zinc-200 pb-3 text-left">
            <h2 className="text-lg font-bold text-zinc-800">
              Completed Results
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {completedMatches.map((match) => renderScorecard(match, false))}
          </div>
        </div>
      )}
    </div>
  );
}
