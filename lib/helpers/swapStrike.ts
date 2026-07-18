import BallEvent from "@/models/BallEvent";
import PlayerStats from "@/models/PlayerStats";
import mongoose from "mongoose";

export function swapStrike(match:any){


    let physicalRuns = 0;
            if (match.ballType === "Normal" || match.ballType === "NoBall") {
                physicalRuns = match.batsmanRuns + match.extraRuns;
            } else {
                physicalRuns = match.extraRuns;
            }

            if (physicalRuns % 2 !== 0) {
                const temp=match.currStriker;
                match.currStriker=match.currNonStriker;
                match.currNonStriker=temp;
            }

            //over swap

            const overEnded = match.legalBallsBefore % 6 !==0 && match.legalBalls % 6 === 0;
            if(overEnded)
            {
                const temp=match.currStriker;
                match.currStriker=match.currNonStriker;
                match.currNonStriker=temp;
            }
}
