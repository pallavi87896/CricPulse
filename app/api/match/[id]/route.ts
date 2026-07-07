import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(req:Request, { params }: { params: Promise<{ id: string }>}) 
{
    try{
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
                    return Response.json(
                        { msg: "Invalid ID provided" },
                        { status: 400 }
                    );
    }

    await connectDB();

    const match = await Match.findById(id)
    .populate("teamA","name")
    .populate( "teamB", "name")
    .populate( "currStriker", "name")
    .populate( "currBowler","name")
    .populate("currNonStriker","name")
    .populate("winner", "name")
    .populate("tossWinner","name")
    .populate("battingTeam", "name")
    .populate("bowlingTeam", "name");

    if(!match){
        return Response.json(
            {
                msg:"match not found"
            },
            {
                status:404
            }
        )
    }

    return Response.json(match);
    }
    catch(err)
    {
        return Response.json(
        {
            msg:"failed to load the match"
        },
        {
            status:500
        }
    )
    }
}