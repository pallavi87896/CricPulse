

export interface PlayerStatsType {

    match : string;
    player : string;
    runs : number;
    balls : number;
    isOut ?: boolean;
    wicketsTaken : number;
    legalBallsBowled : number;
    runsConceded : number;
    createdAt : Date;
    updateAt : Date;

}