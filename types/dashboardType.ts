import { MatchType } from "./matchType";

export interface DashboardType {
    totalTeams : number;
    totalPlayers : number;
    totalMatches : number;
    totalLiveMatches : number;

    recentMatches : MatchType[];
}