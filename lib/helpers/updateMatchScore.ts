

export function updateMatchScore( 
    match : any , 
    ballType : string, 
    batsmanRuns : number, 
    extraRuns : number, 
    wicket : boolean
) {


        
        
        if(ballType==="Normal")
            {
                match.score+=batsmanRuns;
                match.legalBalls+=1;

            }
        else if(ballType==="Wide")
            {
                match.score+=1+extraRuns;
                match.extras+=1+extraRuns;
            }
        else if(ballType==="NoBall")
            {
                match.score+=1+batsmanRuns+extraRuns;
                match.extras+=1+extraRuns;
            }
        else if(ballType==="Bye")
            {
                match.score+=extraRuns;
                match.extras+=extraRuns;
                match.legalBalls+=1;

            }
        else if(ballType==="LegBye")
            {
                match.score+=extraRuns;
                match.extras+=extraRuns;
                match.legalBalls+=1;
            }
        if(wicket)
            {
                match.wickets+=1;
            }

}