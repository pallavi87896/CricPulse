
export function startSecondInnings( match:any,


){

                    if(match.wickets === 10 || match.legalBalls >= match.overs*6 )
                {
                    
                    match.target=match.score+1;

                    const temp=match.battingTeam;
                    match.battingTeam=match.bowlingTeam;
                    match.bowlingTeam=temp;

                    match.innings=2;

                    match.score=0;
                    match.wickets=0;
                    match.extras=0;
                    match.legalBalls=0;
                }
}