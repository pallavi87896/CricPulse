import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import mongoose from "mongoose";
import Player from "@/models/Player";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {

        await requireAdmin(req);
        await connectDB();

        const {
            teamA,
            teamB,
            tossWinner,
            tossDecision,
            status,
            dateTime,
            venue,
            overs
        } = await req.json();

        const ids = [
            teamA,
            teamB,
            tossWinner,
        ];

        for (const id of ids) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return Response.json(
                    { msg: "Invalid ID provided" },
                    { status: 400 }
                );
            }
        }

        if (String(teamA) === String(teamB)) {
            return Response.json(
                { msg: "A team cannot play against itself" },
                { status: 400 }
            );
        }

        if (
            String(tossWinner) !== String(teamA) &&
            String(tossWinner) !== String(teamB)
        ) {
            return Response.json(
                { msg: "Invalid toss winner" },
                { status: 400 }
            );
        }

        const existingTeamA = await Team.findById(teamA);
        const existingTeamB = await Team.findById(teamB);

        if (!existingTeamA || !existingTeamB) {
            return Response.json(
                { msg: "Team not found" },
                { status: 404 }
            );
        }

        let battingTeam;
        let bowlingTeam;

        if (tossDecision === "Bat") {
            battingTeam = tossWinner;
            bowlingTeam =
                String(tossWinner) === String(teamA) ? teamB : teamA;
        } else {
            bowlingTeam = tossWinner;
            battingTeam =
                String(tossWinner) === String(teamA) ? teamB : teamA;
        }

        const match = new Match({
            teamA,
            teamB,
            tossWinner,
            tossDecision,
            innings: 1,
            battingTeam,
            bowlingTeam,
            status,
            dateTime,
            venue,
            overs,
        });

        console.log(match);
        await match.validate();
        await match.save();

        return Response.json(match, { status: 201 });
    } catch (err) {
        console.error(err);
        if (err instanceof mongoose.Error.ValidationError) {
            return Response.json(
                {
                    validation: err.errors,
                },
                {
                    status: 500,
                }
            );
        }
        return Response.json(
            {
                error: String(err),
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET() {
    console.log("GET /api/match called");
    try {
        await connectDB();
        const matches = await Match.find()
            .populate("teamA")
            .populate("teamB")
            .populate("tossWinner")
            .populate("battingTeam")
            .populate("bowlingTeam")
            .populate("winner");
        return Response.json(matches);
    } catch (err) {
        console.error("GET /api/match failed:", err);
        return Response.json(
            {
                msg: "Failed to fetch matches",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {

        await requireAdmin(req);
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
            newBatsmen,
            winner,
            currStriker,
            currNonStriker,
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

        // CHANGE BOWLER
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

            if (match.currBowler && String(match.currBowler) === String(newBowler)) {
                return Response.json(
                    { msg: "The same bowler cannot bowl consecutive overs. Please select a different bowler." },
                    { status: 400 }
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

        if (action === "changeBatter") {
            const match = await Match.findById(id);

            if (!match) {
                return Response.json(
                    { msg: "Match not found" },
                    { status: 404 }
                );
            }

            if (currStriker) {
                if (!mongoose.Types.ObjectId.isValid(currStriker)) {
                    return Response.json(
                        { msg: "Invalid striker ID" },
                        { status: 400 }
                    );
                }
                const batter = await Player.findById(currStriker);
                if (!batter) {
                    return Response.json(
                        { msg: "Striker not found" },
                        { status: 404 }
                    );
                }
                match.currStriker = currStriker;
            }

            if (currNonStriker) {
                if (!mongoose.Types.ObjectId.isValid(currNonStriker)) {
                    return Response.json(
                        { msg: "Invalid non-striker ID" },
                        { status: 400 }
                    );
                }
                const batter = await Player.findById(currNonStriker);
                if (!batter) {
                    return Response.json(
                        { msg: "Non-striker not found" },
                        { status: 404 }
                    );
                }
                match.currNonStriker = currNonStriker;
            }

            await match.save();

            return Response.json({
                msg: "Batter changed successfully",
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

        // ---------------- INITIALIZE PLAYERS / START INNINGS ----------------
        if (action === "initializePlayers" || action === "startInnings") {
            if (!mongoose.Types.ObjectId.isValid(currStriker) ||
                !mongoose.Types.ObjectId.isValid(currNonStriker) ||
                !mongoose.Types.ObjectId.isValid(newBowler)) {
                return Response.json(
                    { msg: "Invalid striker, non-striker, or bowler ID" },
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

            match.currStriker = currStriker;
            match.currNonStriker = currNonStriker;
            match.currBowler = newBowler;
            if (status) {
                match.status = status;
            }

            await match.save();

            return Response.json({
                msg: "Innings started / players initialized successfully",
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

export async function DELETE(req: NextRequest) {
    try {

        await requireAdmin(req);
        await connectDB();

        const { id } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return Response.json(
                {
                    msg: "Invalid match ID",
                },
                {
                    status: 400,
                }
            );
        }

        const deletedMatch = await Match.findByIdAndDelete(id);

        if (!deletedMatch) {
            return Response.json(
                {
                    msg: "Match not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json({
            msg: "Match deleted successfully",
        });
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to delete match",
            },
            {
                status: 500,
            }
        );
    }
}