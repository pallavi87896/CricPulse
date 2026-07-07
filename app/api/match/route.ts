import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";
import mongoose from "mongoose";
import { Console, error } from "console";

export async function POST(req: Request) {
    try {
        await connectDB();

        const {
            teamA,
            teamB,
            tossWinner,
            tossDecision,
            status,
            dateTime,
            venue,
            overs,
            currStriker,
            currNonStriker,
            currBowler,
        } = await req.json();

        const ids = [
            teamA,
            teamB,
            tossWinner,
            currStriker,
            currNonStriker,
            currBowler,
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

        const striker = await Player.findById(currStriker);
        const nonStriker = await Player.findById(currNonStriker);
        const bowler = await Player.findById(currBowler);

        if (!striker || !nonStriker || !bowler) {
            return Response.json(
                { msg: "Invalid player selected" },
                { status: 404 }
            );
        }

        if (String(currStriker) === String(currNonStriker)) {
            return Response.json(
                { msg: "Striker and non-striker cannot be the same player" },
                { status: 400 }
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

        if (
            String(striker.team) !== String(battingTeam) ||
            String(nonStriker.team) !== String(battingTeam)
        ) {
            return Response.json(
                {
                    msg: "Striker and non-striker must belong to the batting team",
                },
                { status: 400 }
            );
        }

        if (String(bowler.team) !== String(bowlingTeam)) {
            return Response.json(
                {
                    msg: "Bowler must belong to the bowling team",
                },
                { status: 400 }
            );
        }

        const match = await Match.create({
            teamA,
            teamB,
            tossWinner,
            tossDecision,
            innings: 1,
            battingTeam,
            bowlingTeam,
            currStriker,
            currNonStriker,
            currBowler,
            status,
            dateTime,
            venue,
            overs,
        });

        return Response.json(match, { status: 201 });
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to start match",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET() {
    try {
        await connectDB();

        const matches = await Match.find()
            .populate("teamA")
            .populate("teamB")
            .populate("currStriker")
            .populate("currNonStriker")
            .populate("currBowler");

        return Response.json(matches);
    } catch (err) {
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
        } = await req.json();

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
        console.log(action);
        if (action === "like") {
            const match = await Match.findById(id);

            if (!match) {
                return Response.json(
                    {
                        msg: "Match not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            match.likes += 1;
            await match.save();

            return Response.json(match);
        }

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
            },
            {
                new: true,
            }
        );

        if (!updatedMatch) {
            return Response.json(
                {
                    msg: "Match not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(updatedMatch);
    } catch (err) {
        
        console.error(err);
        return Response.json(
            {
                error:String(error),
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
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