import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import PlayerStats from "@/models/PlayerStats";
import mongoose from "mongoose";

export async function GET(req:Request, { params }: { params: Promise<{ id: string }>} )
{
    try
    {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
                        return Response.json(
                            { msg: "Invalid ID provided" },
                            { status: 400 }
                        );
                    }

        await connectDB();

        const playerStats = await PlayerStats.find
        ({
            match: id
        }) .populate("player","name");

       if(!playerStats){
        return Response.json({
            msg:"player not found"
        },{
            status:404
        })
       }
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