export interface MatchFormType {
  teamA: string;
  teamB: string;

  tossWinner: string;
  tossDecision: "Bat" | "Bowl";

  venue: string;
  overs: number;
  dateTime: string;

  status: "Upcoming" | "Live" | "Ended";


}