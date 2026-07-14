"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import SimpleTable from "@/components/SimpleTable";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import TeamLogo from "@/components/TeamLogo";
import Loader from "@/components/Loader";
import { DashboardType } from "@/types/dashboardType";

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardType | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data: DashboardType = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Dashboard"
          description="Quick overview of your cricket application statistics and recent activity."
        />
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <Loader variant="table" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Quick overview of your cricket application statistics and recent activity."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Teams</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{dashboardData?.totalTeams}</h3>
            </div>
            <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-650">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Players</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{dashboardData?.totalPlayers}</h3>
            </div>
            <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-655">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Matches</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{dashboardData?.totalMatches}</h3>
            </div>
            <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-650">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Live Matches</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{dashboardData?.totalLiveMatches}</h3>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg text-green-600 border border-green-200">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Matches Section */}
      <Card title="Recent Matches" subtitle="Overview of newly created, active, or finalized games">
        <SimpleTable
          headers={["Matchup", "Venue", "Status", "Live Score", "Overs", "Action"]}
          isEmpty={dashboardData?.recentMatches.length === 0}
        >
          {dashboardData?.recentMatches.map((match) => (
            <tr
              key={match._id}
              onClick={() => router.push(`/match/${match._id}`)}
              className="hover:bg-zinc-50/50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-900">
                <div className="flex items-center gap-2">
                  <TeamLogo logo={match.teamA.logo} name={match.teamA.name} size="sm" />
                  <span>{match.teamA.name}</span>
                  <span className="text-xs text-zinc-400 font-semibold uppercase">vs</span>
                  <TeamLogo logo={match.teamB.logo} name={match.teamB.name} size="sm" />
                  <span>{match.teamB.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-550 font-medium">
                {match.venue || "TBD"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={match.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-zinc-800 text-sm">
                {match.status !== "Upcoming" ? (
                  <span>
                    {match.score}/{match.wickets}
                    {match.target > 0 && (
                      <span className="text-[10px] text-zinc-450 font-semibold ml-1">
                        {" "}
                        (Tgt {match.target})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-zinc-450 italic text-xs font-semibold">Not Started</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-550 text-xs font-semibold">
                {match.status !== "Upcoming" ? (
                  <span>
                    {Math.floor(match.legalBalls / 6)}.{match.legalBalls % 6} / {match.overs}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  {match.status === "Live" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-zinc-650 hover:text-zinc-900 border-zinc-200 font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/admin/live-match");
                      }}
                    >
                      Score 🛠️
                    </Button>
                  ) : (
                    <span className="text-xs text-zinc-400 italic font-semibold">Ready</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </SimpleTable>
      </Card>
    </div>
  );
}
