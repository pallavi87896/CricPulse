import { TeamType } from "./teamType";
import { PlayerType } from "./playerType";
export interface MatchType {
    _id: string;

    teamA: TeamType;
    teamB: TeamType;

    tossWinner: TeamType;
    tossDecision: "Bat" | "Bowl";

    innings: 1 | 2;

    status: "Live" | "Upcoming" | "Ended";

    score: number;
    wickets: number;
    extras: number;
    legalBalls: number;

    currStriker: PlayerType;
    currNonStriker: PlayerType;
    currBowler: PlayerType;

    target: number;
    overs: number;

    likes: number;

    winner?: TeamType;

    dateTime?: Date;

    venue?: string;

    battingTeam: TeamType;
    bowlingTeam: TeamType;

    createdAt: Date;
    updatedAt: Date;
}