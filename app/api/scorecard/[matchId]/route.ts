import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import PlayerStats from "@/models/PlayerStats";

export async function GET(req:Request, { params }: { params: Promise<{ id: string }>} )
{
    try
    {
        const { id } = await params;

        await connectDB();

        const playerStats = await PlayerStats.find
        ({
            match: id
        }) .populate("player","name");

       
        return Response.json(playerStats);

        
    }
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to load the scorecard"
            },
            {
                status: 500
            }
        )
    }
}