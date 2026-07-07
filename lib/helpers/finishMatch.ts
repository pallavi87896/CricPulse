export function finishMatch(match:any){
    if(match.score >= match.target){

                        match.winner=match.battingTeam;

                    }
                    else{
                        match.winner = match.bowlingTeam;
                    
                    }
                    match.status= "Ended";
}