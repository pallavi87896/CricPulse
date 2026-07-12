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

interface IMatch extends mongoose.Document{
    currStriker:mongoose.Types.ObjectId;
    currNonStriker:mongoose.Types.ObjectId;
}

function swapStrike(match:IMatch){
    const temp=match.currStriker;
    match.currStriker=match.currNonStriker;
    match.currNonStriker=temp;
}

export async function  POST(req:Request){

    try
    {
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

            //validate newbatsman
            const incomingPlayer= await Player.findById(newBatsman);
            
                if(!incomingPlayer){
                   return Response.json(
                   {
                    msg:"player not found"
                   },
                   {
                    status:404
                   })
                }
        }

        //create ballEvent
        const ballEvent=await BallEvent.create(
            {
                striker:striker,
                bowler:bowler,
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

            //rotate strike
            if((ballType==="Normal"|| ballType==="NoBall")&&(batsmanRuns===1 || batsmanRuns===3)){
                swapStrike(existingMatch);
                
            }

            if((ballType==="Bye" || ballType==="LegBye") && (extraRuns%2!==0)){
                swapStrike(existingMatch);
            }

            //over swap

            const overEnded = legalBallsBefore % 6 !==0 && existingMatch.legalBalls % 6 === 0;
            if(overEnded)
            {
                swapStrike(existingMatch);

                if(!newBowler){
                    return Response.json(
                        {
                            msg:"Please select the next bowler."
                        },
                        {
                            status:400
                        }
                    );
                }

                
                if(bowler.equals(newBowler)){
                    return Response.json({
                        msg:"same bowler cant bowl everytime",

                    },
                {
                    status:400
                })
                }

                existingMatch.currBowler=newBowler;

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

                if(existingMatch.wickets === 10 || existingMatch.legalBalls >= existingMatch.overs*6 )
                {
                    
                    startSecondInnings(existingMatch);

                    const incomingBowler = await Player.findById(newBowler);

                    if(!incomingBowler)
                    {
                        return Response.json(
                            {
                                msg:"Bowler not found"
                            },
                            {
                                status:404
                            }
                        ) 
                    }

                    const incomingStriker = await Player.findById(newStriker);

                    if(!incomingStriker)
                    {
                        return Response.json(
                            {
                                msg:"Striker not found"
                            },
                            {
                                status:404
                            }
                        ) 
                    }

                    const incomingNonStriker = await Player.findById(newNonStriker);

                    if(!incomingNonStriker)
                    {
                        return Response.json(
                            {
                                msg:"NonStriker not found"
                            },
                            {
                                status:404
                            }
                        ) 
                    }

                    if(newStriker === newNonStriker){
                        return Response.json(
                            {
                                msg:"Opening batsmen cannot be the same player."
                            },
                            {
                                status:400
                            }
                        );
                    }

                    
                    existingMatch.currStriker = newStriker;
                    existingMatch.currNonStriker = newNonStriker;
                    existingMatch.currBowler = newBowler;

                    await playerStats.save();
                    await bowlerStats.save();
                    await existingMatch.save();

                    return Response.json({
                    msg:"innings 2 begin"
                    })
                }
            }
            if(existingMatch.innings===2){
                if (existingMatch.wickets === 10 || 
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

