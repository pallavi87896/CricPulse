import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import mongoose from "mongoose";
import Player from "@/models/Player";
export async function PATCH(req: Request) {
    try {
        await connectDB();

        const {
            id,
            teamA,
            teamB,
            tossWinner,
            tossDecision,
            status,
            dateTime,
            venue,
            action,
            overs,
            newBowler,
            winner,
        } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return Response.json(
                { msg: "Invalid match ID" },
                { status: 400 }
            );
        }

        // ---------------- LIKE ----------------
        if (action === "like") {
            const match = await Match.findById(id);

            if (!match) {
                return Response.json(
                    { msg: "Match not found" },
                    { status: 404 }
                );
            }

            match.likes += 1;
            await match.save();

            return Response.json(match);
        }

        // ---------------- CHANGE BOWLER ----------------
        if (action === "changeBowler") {

            if (!mongoose.Types.ObjectId.isValid(newBowler)) {
                return Response.json(
                    { msg: "Invalid bowler ID" },
                    { status: 400 }
                );
            }

            const match = await Match.findById(id);

            if (!match) {
                return Response.json(
                    { msg: "Match not found" },
                    { status: 404 }
                );
            }

            const bowler = await Player.findById(newBowler);

            if (!bowler) {
                return Response.json(
                    { msg: "Bowler not found" },
                    { status: 404 }
                );
            }

            match.currBowler = newBowler;

            await match.save();

            return Response.json({
                msg: "Bowler changed successfully",
                match,
            });
        }

        // ---------------- END MATCH ----------------
        if (action === "endMatch") {

            if (!mongoose.Types.ObjectId.isValid(winner)) {
                return Response.json(
                    { msg: "Invalid winner ID" },
                    { status: 400 }
                );
            }

            const match = await Match.findById(id);

            if (!match) {
                return Response.json(
                    { msg: "Match not found" },
                    { status: 404 }
                );
            }

            const winningTeam = await Team.findById(winner);

            if (!winningTeam) {
                return Response.json(
                    { msg: "Winning team not found" },
                    { status: 404 }
                );
            }

            match.winner = winner;
            match.status = "Ended";

            await match.save();

            return Response.json({
                msg: "Match ended successfully",
                match,
            });
        }

        // ---------------- NORMAL EDIT ----------------

        const updatedMatch = await Match.findByIdAndUpdate(
            id,
            {
                teamA,
                teamB,
                tossWinner,
                tossDecision,
                status,
                dateTime,
                venue,
                overs,
            },
            {
                new: true,
            }
        );

        if (!updatedMatch) {
            return Response.json(
                { msg: "Match not found" },
                { status: 404 }
            );
        }

        return Response.json(updatedMatch);

    } catch (err) {
        console.error(err);

        return Response.json(
            {
                msg: "Server error",
            },
            {
                status: 500,
            }
        );
    }
}