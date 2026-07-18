import { swapStrike } from "./swapStrike";
export function overEnded(match:any){ 
    const overended = match.legalBallsBefore % 6 !==0 && match.legalBalls % 6 === 0;
            if(overended)
            {
                swapStrike(match);

                // If a newBowler was passed (e.g. manual transition), update it.
                // Otherwise, the client will change the bowler in the next step via PATCH /api/match
                if (match.newBowler) {
                    if (match.bowler.equals(match.newBowler)) {
                        return Response.json({
                            msg: "same bowler cant bowl everytime",
                        },
                        {
                            status: 400
                        });
                    }
                    match.currBowler = match.newBowler;
                }
            
            }
}