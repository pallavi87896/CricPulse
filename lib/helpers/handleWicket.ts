import mongoose from "mongoose";

export function handleWicket( wicket : boolean,
    match : any,
    newBatsman : string,
    striker : mongoose.Types.ObjectId,
    outPlayer : mongoose.Types.ObjectId,
    nonStriker : mongoose.Types.ObjectId
){
            if(wicket){
            if(striker.equals(outPlayer)){
                    match.currStriker=newBatsman;
            }
            else if(nonStriker.equals(outPlayer)){
                    match.currNonStriker=newBatsman;
            }
            else{
                    return Response.json({
                        msg:"cannot replace batsman"
                    },
                )
            }
        }
}