import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Match from "@/models/Match";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    await requireAdmin(req);

    await connectDB();

    const totalTeams = await Team.countDocuments();
    const totalPlayers = await Player.countDocuments();
    const totalMatches = await Match.countDocuments();

    const totalLiveMatches = await Match.countDocuments({ status : "Live"});

    //fetch recent match newest first

    const recentMatches = await Match.find()
    .populate("teamA","name logo")
    .populate("teamB","name logo")
    .sort({ createdAt : -1 })
    .limit(5);

    return Response.json({
        totalTeams,
        totalMatches,
        totalPlayers,
        totalLiveMatches,
        recentMatches
    });


}