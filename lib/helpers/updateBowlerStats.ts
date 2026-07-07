


export function updateBowlerStats(
    ballType : string,
    bowlerStats : any,
    batsmanRuns : number,
    extraRuns : number,
    wicket : boolean,
    wicketType : string,



){
 
            if (ballType === "Normal") {
            bowlerStats.runsConceded+=batsmanRuns;
            bowlerStats.legalBallsBowled+= 1;
            }
            else if (ballType === "NoBall") {
            bowlerStats.runsConceded += 1 + batsmanRuns + extraRuns;

            }

            else if (ballType === "Wide") {
                bowlerStats.runsConceded+=1 + extraRuns;
            }
            else if (ballType === "Bye" || ballType === "LegBye") {
            bowlerStats.legalBallsBowled+=1;
            }

        // Update dismissal
            if (
            wicket && wicketType != "Run Out" ) {
            bowlerStats.wicketsTaken+=1;
            }
        }