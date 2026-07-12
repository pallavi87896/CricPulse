import { Match } from "@/context/AppContext";
import { MatchType } from "./matchType";

export interface CommentType {
  _id: string;

  match: string;

  username: string;

  comment: string;

  createdAt: Date;

  updatedAt: Date;
}