import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";    
import Match from "@/models/Match";
import BallEvent from "@/models/BallEvent";
import PlayerStats from "@/models/PlayerStats";
import CommentModel from "@/models/CommentModel";

export async function GET(req:Request, { params } : { params : Promise < { id : string } >} ) {
    
    try
    {
        await connectDB();

        const { id } = await params;


            if (!mongoose.Types.ObjectId.isValid(id)) {
                            return Response.json(
                                { msg: "Invalid ID provided" },
                                { status: 400 }
                            );
            }

            const match = await Match.findById(id)
                .populate("teamA", "name")
                .populate("teamB", "name")
                .populate("currStriker", "name")
                .populate("currNonStriker", "name")
                .populate("currBowler", "name")
                .populate("battingTeam", "name")
                .populate("bowlingTeam", "name")
                .populate("winner", "name");

        if(!match)
        {
            return Response.json({
                msg:"match not found"
            },
            {
                status:404
            }
            )
        }

        const scorecard = await PlayerStats.find({
                match: id
            }).populate("player", "name");

        const recentBalls = await BallEvent.find({
            match : id
        }).populate("striker", "name")
            .populate("bowler", "name")
            .populate("outPlayer", "name")
            .sort({ createdAt: -1 })
            .limit(10);

            const comments = await CommentModel.find({
                match: id
            }).sort({ createdAt: -1 });

                return Response.json({
                    match,
                    scorecard,
                    recentBalls,
                    comments
                });
    }

    catch(err)
    {
        return Response.json({
            msg:"could not get the live match"
        },
    {
        status:500
    })
    }
}