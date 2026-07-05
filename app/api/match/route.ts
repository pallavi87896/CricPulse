import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req:Request){
    try{
        await connectDB();

        const { teamA, teamB, tossWinner, tossDecision, status, dateTime, venue, overs, currStriker, currNonStriker, currBowler } = await req.json();
        
        const existingTeamA=await Team.findById(teamA);

        const existingTeamB=await Team.findById(teamB);

        const striker = await Player.findById(currStriker);
        const nonStriker = await Player.findById(currNonStriker);
        const bowler = await Player.findById(currBowler);

        if (!striker || !nonStriker || !bowler) {
            return Response.json(
                {
                    msg: "Invalid player selected"
                },
                {
                    status: 404
                }
            );
        }

        if ((existingTeamA && existingTeamB) && (teamA!==teamB)){

            let battingTeam;
            let bowlingTeam;

            if( tossDecision === "Bat" ){
                battingTeam = tossWinner;

                if(String(tossWinner) ===  String(teamA)){
                    bowlingTeam = teamB;
                }
                else
                {
                    bowlingTeam = teamA;
                }
            }
            else{
                bowlingTeam = tossWinner;

                if( String(tossWinner) === String(teamA)){
                    battingTeam = teamB;
                }
                else
                {
                    battingTeam = teamA;
                }
            }
            
            const match = await Match.create(
                {
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

                    overs
                }
            )

            return Response.json(match);
        }
        else
            {
            return Response.json
              (
                {
                    msg:"Team not found"
                },
                {
                    status:404
                }
              )
            }
        
    } 
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to start a match"
            },
            {
                status:500
            }
        )
    }
}

export async function GET(){
    
    try
    {
        await connectDB();

        const match=await Match.find().populate("teamA").populate("teamB");

        return Response.json(match);

    }
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to start a match"
            },
            {
                status:500
            }
        )
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
            action
        } = await req.json();

        if(action==="like"){
            const match= await Match.findById(id);

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
        return Response.json(
            {
                msg: "Failed to update match",
            },
            {
                status: 500,
            }
        );
    }
}
export async function DELETE(req:Request){
    
    try
    {
        await connectDB();

        const { id } = await req.json();

        await Match.findByIdAndDelete(id);

        return Response.json(
            {
                msg:"match deleted successfully"
            }
        )
    }
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to delete match"
            },
            {
                status:500
            }
        )
    }
}

