export interface BallEventType {
  _id: string;

  match: string;

  striker: string;

  bowler: string;

  ballType: "Normal" | "Wide" | "NoBall" | "Bye" | "LegBye";

  batsmanRuns: number;

  wicket: boolean;

  wicketType?:
    | "Bowled"
    | "Caught"
    | "LBW"
    | "Run Out"
    | "Stumped"
    | "Hit Wicket";

  outPlayer?: string;

  newBatsman?: string;

  newBowler?: string;

  extraRuns: number;

  createdAt: Date;

  updatedAt: Date;
}