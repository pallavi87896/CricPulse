import { requireAdmin } from "@/lib/auth";
import { handleWicket } from "@/lib/helpers/handleWicket";
import { startSecondInnings } from "@/lib/helpers/startSecondInnings";
import { updateBatsmanStats } from "@/lib/helpers/updateBatsmanStats";
import { updateBowlerStats } from "@/lib/helpers/updateBowlerStats";
import { updateMatchScore } from "@/lib/helpers/updateMatchScore";
import { connectDB } from "@/lib/mongodb";
import BallEvent from "@/models/BallEvent";
import Match from "@/models/Match";
import PlayerStats from "@/models/PlayerStats";
import { NextRequest } from "next/server";
import Player from "@/models/Player";
import mongoose from "mongoose";
import { finishMatch } from "@/lib/helpers/finishMatch";

export function swapStrike(match:any){
    const temp = match.currStriker;
    match.currStriker = match.currNonStriker;
    match.currNonStriker = temp;
}

export async function POST( req:NextRequest,{ params }: { params: Promise<{ id: string }>})
{

    try{

    await requireAdmin(req);
    await connectDB();


    const { id } = await params ;

    if (!id) {
        return Response.json(
            {
                success: false,
                msg: "Match id is required."
            },
            { status: 400 }
        );
    }

    const lastBall = await BallEvent.findOne({
        match: id
    }).sort({ createdAt: -1 });

    if (!lastBall) {
    return Response.json(
        {
            success: false,
            msg: "Nothing to undo."
        },
        { status: 404 }
    );
    }

    //delete the lastball event
    await lastBall.deleteOne();
    

    const existingMatch = await Match.findById(
        id
    );

    if(!existingMatch)
    {
        return Response.json({
            msg:"match not found"
        },{
            status:404
        })
    }

    existingMatch.score = 0;
    existingMatch.wickets = 0;
    existingMatch.extras = 0;
    existingMatch.legalBalls = 0;

    existingMatch.currStriker = null;
    existingMatch.currNonStriker = null;
    existingMatch.currBowler = null;

    existingMatch.winner = null;
    existingMatch.status = "Live";

    //save innings
    const originalInnings = existingMatch.innings;

    if (originalInnings === 2) {
    const temp = existingMatch.battingTeam;
    existingMatch.battingTeam = existingMatch.bowlingTeam;
    existingMatch.bowlingTeam = temp;
    }

    existingMatch.innings = 1;
    existingMatch.target = 0;

    const playerStat = await PlayerStats.find({
        match: id,
        
    });

    for (const stat of playerStat) {

    stat.runs = 0;
    stat.balls = 0;

    stat.isOut = false;

    stat.wicketsTaken = 0;
    stat.legalBallsBowled = 0;
    stat.runsConceded = 0;
    }

    await Promise.all(playerStat.map(stat=>stat.save()));

    const balls = await BallEvent.find({
        match : id,
    }).sort({ createdAt:1 });

    //avoid player count every ball
    const teamAPlayerCount = await Player.countDocuments({
    team: existingMatch.teamA,
    });

    const teamBPlayerCount = await Player.countDocuments({
        team: existingMatch.teamB,
    });


    //get players involved in tht ball event

    for (let i = 0; i < balls.length; i++) {

    const ball = balls[i];

    if (i === 0) {
        existingMatch.currStriker = ball.striker;
        existingMatch.currBowler = ball.bowler;
        existingMatch.currNonStriker = ball.nonStriker;
        }

        let strikerStats  = await PlayerStats.findOne({ match:id,
            player:ball.striker
        });

        let bowlerStats = await PlayerStats.findOne({
                match: id,
                player: ball.bowler
            });

            if (!strikerStats) {
                strikerStats = await PlayerStats.create({
                match: existingMatch._id,
                player: ball.striker,
                });
            }

            if(!bowlerStats){
                bowlerStats = await PlayerStats.create({
                match: existingMatch._id,
                player: ball.bowler,
                });
            }


    const legalBallsBefore = existingMatch.legalBalls;
    updateMatchScore(existingMatch,ball.ballType,ball.batsmanRuns,ball.extraRuns,ball.wicket);


    if(ball.wicket){

    handleWicket(ball.wicket,existingMatch,ball.newBatsman,ball.striker,ball.nonStriker,ball.outPlayer);
    }

    //swap strike
    let physicalRuns = 0;

    if (ball.ballType === "Normal" || ball.ballType === "NoBall") {
        physicalRuns = ball.batsmanRuns + ball.extraRuns;
    } else {
        physicalRuns = ball.extraRuns;
    }

    if (physicalRuns % 2 !== 0) {
        swapStrike(existingMatch);
    }

        const overEnded =
            legalBallsBefore % 6 !== 0 &&
            existingMatch.legalBalls % 6 === 0;

        if (overEnded) {
            swapStrike(existingMatch);
            if (ball.newBowler) {
                existingMatch.currBowler = ball.newBowler;
            }
        }


        updateBatsmanStats(ball.ballType,ball.batsmanRuns,strikerStats, ball.wicket,ball.striker,ball.outPlayer);

        updateBowlerStats(ball.ballType,bowlerStats,ball.batsmanRuns,ball.extraRuns,ball.wicket,ball.wicketType);

    if(existingMatch.innings==1){
                const battingPlayersCount =
                    String(existingMatch.battingTeam) === String(existingMatch.teamA)
                        ? teamAPlayerCount
                        : teamBPlayerCount;

                const isAllOut = battingPlayersCount > 0 ? (existingMatch.wickets >= battingPlayersCount - 1) : (existingMatch.wickets >= 10);

                if(isAllOut || existingMatch.legalBalls >= existingMatch.overs*6 )
                {
                    startSecondInnings(existingMatch);

                    const incomingBowler = ball.newBowler && mongoose.Types.ObjectId.isValid(ball.newBowler) ? await Player.findById(ball.newBowler) : null;

                    const incomingStriker = ball.newStriker && mongoose.Types.ObjectId.isValid(ball.newStriker) ? await Player.findById(ball.newStriker) : null;

                    const incomingNonStriker = ball.newNonStriker && mongoose.Types.ObjectId.isValid(ball.newNonStriker) ? await Player.findById(ball.newNonStriker) : null;

                    if(incomingStriker && incomingNonStriker && String(incomingStriker._id) === String(incomingNonStriker._id)){
                        return Response.json(
                            {
                                msg:"Opening batsmen cannot be the same player."
                            },
                            {
                                status:400
                            }
                        );
                    }

                    existingMatch.currStriker = incomingStriker ? incomingStriker._id : null;
                    existingMatch.currNonStriker = incomingNonStriker ? incomingNonStriker._id : null;
                    existingMatch.currBowler = incomingBowler ? incomingBowler._id : null;

                    
                }
            }
            if(existingMatch.innings===2){
                const battingPlayersCount =
                String(existingMatch.battingTeam) === String(existingMatch.teamA)
                    ? teamAPlayerCount
                    : teamBPlayerCount;

                const isAllOut = battingPlayersCount > 0 ? (existingMatch.wickets >= battingPlayersCount - 1) : (existingMatch.wickets >= 10);

                if (isAllOut || 
                    existingMatch.legalBalls >= existingMatch.overs*6 || existingMatch.score >= existingMatch.target){
                    
                    finishMatch(existingMatch);

                }
            }
        await strikerStats.save();
        await bowlerStats.save();

           }
           await existingMatch.save();

            try{
        await fetch("http://localhost:4000/emit",{
            method:"POST",
            headers:{
                "Content-type":"application/json"
           },
           body:JSON.stringify({
            room:existingMatch._id.toString(),
           event:"match_updated"
           })

        });
        }
        catch(err){
            console.error("failed to notify socket server",err);
        }


    
    


    return Response.json({
        success:true,
        msg:"last ball undone successfully"
    })

}
catch(err){
    console.error(err);
        return Response.json(
            {
                msg:"cannot post the ballevent"
            },
            {
                status:500
            }
        )
}


}