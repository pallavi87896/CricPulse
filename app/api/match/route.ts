import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
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

await match.validate();      // 👈 ADD THIS

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
        console.log("mongo connecte");
        const matches = await Match.find()
        .populate("teamA")
        .populate("teamB")
        .populate("tossWinner")
        .populate("battingTeam")
        .populate("bowlingTeam")
        .populate("winner")
        console.log(matches);
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
                overs
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