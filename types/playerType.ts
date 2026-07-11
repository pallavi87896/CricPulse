import { TeamType } from "./teamType";

export interface PlayerType {
    _id : string;

    name : string;

    role ?: string;

    team : TeamType;

    createdAt : Date;

    updatedAt  : Date;

}