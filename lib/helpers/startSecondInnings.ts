
export function startSecondInnings( match:any ){
    match.target=match.score+1;

    const temp=match.battingTeam;
    match.battingTeam=match.bowlingTeam;
    match.bowlingTeam=temp;

    match.innings=2;

    match.score=0;
    match.wickets=0;
    match.extras=0;
    match.legalBalls=0;

    // Reset active batsmen and bowler
    match.currStriker = null;
    match.currNonStriker = null;
    match.currBowler = null;
}