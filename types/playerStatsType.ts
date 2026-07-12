import { PlayerType } from "./playerType";


export interface PlayerStatsType {

    match : string;
    player : PlayerType;
    runs : number;
    balls : number;
    isOut ?: boolean;
    wicketsTaken : number;
    legalBallsBowled : number;
    runsConceded : number;
    createdAt : Date;
    updateAt : Date;

}