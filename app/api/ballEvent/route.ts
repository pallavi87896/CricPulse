import BallEvent from "@/models/BallEvent";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import PlayerStats from "@/models/PlayerStats";
import mongoose from "mongoose";
import Player from "@/models/Player";   
import { updateMatchScore } from "@/lib/helpers/updateMatchScore";
import { updateBatsmanStats } from "@/lib/helpers/updateBatsmanStats";
import { updateBowlerStats } from "@/lib/helpers/updateBowlerStats";
import { startSecondInnings } from "@/lib/helpers/startSecondInnings";
import { finishMatch } from "@/lib/helpers/finishMatch";
import { handleWicket } from "@/lib/helpers/handleWicket";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";
import { io } from "socket.io-client";
import { getIO } from "@/socket/io";

interface IMatch extends mongoose.Document{
    currStriker:mongoose.Types.ObjectId;
    currNonStriker:mongoose.Types.ObjectId;
}

function swapStrike(match:IMatch){
    const temp=match.currStriker;
    match.currStriker=match.currNonStriker;
    match.currNonStriker=temp;
}

export async function  POST(req:NextRequest){

    try
    {

        await requireAdmin(req);
        await connectDB();

        
        const { match, ballType, batsmanRuns, wicket, wicketType, outPlayer, extraRuns, newBatsman, newBowler, newStriker, newNonStriker } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(match)) {
            return Response.json(
                { msg: "Invalid match ID" },
                { status: 400 }
            );
           }

        const existingMatch=await Match.findById(match);

            

        if(existingMatch)
        {

            const striker= existingMatch.currStriker;
            const bowler= existingMatch.currBowler;
            const nonStriker= existingMatch.currNonStriker;

            if (!striker || !nonStriker || !bowler) {
                return Response.json(
                    {
                        msg: "Match has not been initialized with striker, non-striker and bowler."
                    },
                    {
                        status:400
                    }
                );
            }

            // Check if the current bowler is trying to bowl consecutive overs
            if (existingMatch.legalBalls > 0 && existingMatch.legalBalls % 6 === 0) {
                const lastBall = await BallEvent.findOne({ match: existingMatch._id }).sort({ createdAt: -1 });
                if (lastBall && lastBall.bowler.equals(bowler)) {
                    return Response.json(
                        {
                            msg: "The same bowler cannot bowl consecutive overs. Please select a new bowler."
                        },
                        {
                            status:400
                        }
                    );
                }
            }

        //validate wicket
        if(wicket) {
                if(wicketType!=="Run Out")
                {
                   if(!existingMatch.currStriker.equals(outPlayer)){
                      return Response.json({
                        msg:"invalid wicket event"
                      },
                    {
                        status:400
                      });
                   }
                }

                // If this wicket will result in all out (wickets + 1 >= 10) or overs are ending, we don't strictly require newBatsman.
                // We check if newBatsman is provided. If so, validate it. If not, only allow if the innings/match is ending.
                const nextWickets = existingMatch.wickets + 1;

                const battingPlayersCount = await Player.countDocuments({ team: existingMatch.battingTeam });

                const isAllOut = battingPlayersCount > 0 ? (nextWickets >= battingPlayersCount - 1) : (nextWickets >= 10);

                const isLegalDelivery = (ballType === "Normal" || ballType === "Bye" || ballType === "LegBye");
                
                const willOversEnd = isLegalDelivery && (existingMatch.legalBalls + 1 >= existingMatch.overs * 6);
                const inningsEnding = isAllOut || willOversEnd;

                if (newBatsman) {
                    const incomingPlayer = await Player.findById(newBatsman);
                    if (!incomingPlayer) {
                       return Response.json(
                       {
                        msg: "player not found"
                       },
                       {
                        status: 404
                       });
                    }
                } else {
                    if (!inningsEnding) {
                        return Response.json(
                        {
                            msg: "New batsman is required to continue the match."
                        },
                        {
                            status: 400
                        });
                    }
                }
        }

        //create ballEvent
        const ballEvent=await BallEvent.create(
            {
                striker:striker,
                bowler:bowler,
                nonStriker,
                match:existingMatch._id,
                ballType, 
                batsmanRuns, 
                wicket, 
                wicketType, 
                outPlayer,
                extraRuns,
            }
        )
        
        //The problem is that after the over ends, legalBalls stays at 6 until the next legal delivery. So every wide/no-ball before that makes this condition true again.

        const legalBallsBefore = existingMatch.legalBalls;
        //update score
        updateMatchScore ( 
            existingMatch,
            ballType,
            batsmanRuns,
            extraRuns,
            wicket
        )

            //replace batsman
        handleWicket(  wicket,
            existingMatch,
            newBatsman,
            striker,
            outPlayer,
            nonStriker)

            //rotate strike based on physical runs run
            let physicalRuns = 0;
            if (ballType === "Normal" || ballType === "NoBall") {
                physicalRuns = batsmanRuns + extraRuns;
            } else {
                physicalRuns = extraRuns;
            }

            if (physicalRuns % 2 !== 0) {
                swapStrike(existingMatch);
            }

            //over swap

            const overEnded = legalBallsBefore % 6 !==0 && existingMatch.legalBalls % 6 === 0;
            if(overEnded)
            {
                swapStrike(existingMatch);

                // If a newBowler was passed (e.g. manual transition), update it.
                // Otherwise, the client will change the bowler in the next step via PATCH /api/match
                if (newBowler) {
                    if (bowler.equals(newBowler)) {
                        return Response.json({
                            msg: "same bowler cant bowl everytime",
                        },
                        {
                            status: 400
                        });
                    }
                    existingMatch.currBowler = newBowler;
                }
            }
            
        // PlayerStats
                let playerStats = await PlayerStats.findOne({
                match: existingMatch._id,
                player:striker,
            });

                if (!playerStats) {
                playerStats = await PlayerStats.create({
                match: existingMatch._id,
                player: striker,
                });
                }

        // Update batting stats
        updateBatsmanStats(
            ballType,
            batsmanRuns,
            playerStats,
            wicket,
            striker,
            outPlayer
        );

        //BowlerStats

        let bowlerStats = await PlayerStats.findOne(
            {
                match:existingMatch._id,
                player:bowler,
            }
        );

        if(!bowlerStats){
            bowlerStats = await PlayerStats.create
            (
                {
                    match:existingMatch._id,
                    player:bowler,
                }
            );
        }

            updateBowlerStats( ballType,
                bowlerStats ,
                batsmanRuns ,
                extraRuns,
                wicket ,
                wicketType);
            

            if ( wicket && nonStriker.equals(outPlayer) )
            {
                let nonStrikerStats=await PlayerStats.findOne({
                   match:existingMatch._id,
                   player:nonStriker
                });

                if(!nonStrikerStats){
                    nonStrikerStats=await PlayerStats.create({
                        match:existingMatch._id,
                        player:nonStriker
                    })
                }
                nonStrikerStats.isOut=true;

                await nonStrikerStats.save();
            }

            
            if(existingMatch.innings==1){
                const battingPlayersCount = await Player.countDocuments({ team: existingMatch.battingTeam });
                const isAllOut = battingPlayersCount > 0 ? (existingMatch.wickets >= battingPlayersCount - 1) : (existingMatch.wickets >= 10);

                if(isAllOut || existingMatch.legalBalls >= existingMatch.overs*6 )
                {
                    startSecondInnings(existingMatch);

                    const incomingBowler = newBowler && mongoose.Types.ObjectId.isValid(newBowler) ? await Player.findById(newBowler) : null;
                    const incomingStriker = newStriker && mongoose.Types.ObjectId.isValid(newStriker) ? await Player.findById(newStriker) : null;
                    const incomingNonStriker = newNonStriker && mongoose.Types.ObjectId.isValid(newNonStriker) ? await Player.findById(newNonStriker) : null;

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

                    await playerStats.save();
                    await bowlerStats.save();
                    await existingMatch.save();

                    return Response.json({
                        msg:"innings 2 begin",
                        overEnded
                    });
                }
            }
            if(existingMatch.innings===2){
                const battingPlayersCount = await Player.countDocuments({ team: existingMatch.battingTeam });
                const isAllOut = battingPlayersCount > 0 ? (existingMatch.wickets >= battingPlayersCount - 1) : (existingMatch.wickets >= 10);

                if (isAllOut || 
                    existingMatch.legalBalls >= existingMatch.overs*6 || existingMatch.score >= existingMatch.target){
                    
                    finishMatch(existingMatch);

                    await playerStats.save();
                    await bowlerStats.save();
                    await existingMatch.save();

                        return Response.json({
                            msg:"match over"
                        })
                    
                }
            }

        


        // Save
        await playerStats.save();
        await bowlerStats.save();
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

        //gets the socekt server we created
        //const io = getIO();

        //we use io n not socket because we wanna send this msg to all the sockets

        //so basically server go to mathc._id this room n emit the message
        //io.to(match._id.toString()).emit("match updated");
        
        

        return Response.json({ballEvent,
            msg:"match updated",
            overEnded
        });

        }
        else
        {
            return Response.json(
                {
                    msg:"not found"
                },
                {
                    status:404
                }
            )
        }



        
    }
    catch(err)
    {
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

