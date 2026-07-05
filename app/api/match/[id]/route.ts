import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";

export async function GET(req:Request, { params }: { params: Promise<{ id: string }>}) 
{
    try{
    const { id } = await params;

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
                msg:"invalid match"
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