

export function updateBatsmanStats( 
    ballType : string, 
    batsmanRuns : number,
    stats : any,
    wicket : boolean,
    striker : string,
    outPlayer : string
)
{

            if (ballType === "Normal") {
            stats.runs += batsmanRuns;
            stats.balls += 1;
            }
            else if (ballType === "NoBall") {
            stats.runs += batsmanRuns;
            }
            else if (ballType === "Bye" || ballType === "LegBye") {
            stats.balls += 1;
            }

            if (
            wicket &&
            striker === outPlayer
            ) {
            stats.isOut = true;
            }
}