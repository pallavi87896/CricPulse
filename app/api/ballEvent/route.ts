import BallEvent from "@/models/BallEvent";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import PlayerStats from "@/models/PlayerStats";
import mongoose from "mongoose";
import Player from "@/models/Player";   

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


        const existingMatch=await Match.findById(match);

        if(existingMatch)
        {

            const striker= existingMatch.currStriker;
            const bowler= existingMatch.currBowler;
            const nonStriker= existingMatch.currNonStriker;

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

        //update score
        if(ballType==="Normal")
            {
                existingMatch.score+=batsmanRuns;
                existingMatch.legalBalls+=1;

            }
        else if(ballType==="Wide")
            {
                existingMatch.score+=1+extraRuns;
                existingMatch.extras+=1+extraRuns;
            }
        else if(ballType==="NoBall")
            {
                existingMatch.score+=1+batsmanRuns+extraRuns;
                existingMatch.extras+=1+extraRuns;
            }
        else if(ballType==="Bye")
            {
                existingMatch.score+=extraRuns;
                existingMatch.extras+=extraRuns;
                existingMatch.legalBalls+=1;

            }
        else if(ballType==="LegBye")
            {
                existingMatch.score+=extraRuns;
                existingMatch.extras+=extraRuns;
                existingMatch.legalBalls+=1;
            }
        if(wicket)
            {
                existingMatch.wickets+=1;

            //replace batsman

            if(striker.equals(outPlayer)){
                    existingMatch.currStriker=newBatsman;
            }
            else if(nonStriker.equals(outPlayer)){
                    existingMatch.currNonStriker=newBatsman;
            }
            else{
                    return Response.json({
                        msg:"cannot replace batsman"
                    },
                )
            }
        }

            //rotate strike
            if((ballType==="Normal"|| ballType==="NoBall")&&(batsmanRuns===1 || batsmanRuns===3)){
                swapStrike(existingMatch);
                
            }

            if((ballType==="Bye" || ballType==="LegBye") && (extraRuns%2!==0)){
                swapStrike(existingMatch);
            }

            //over swap
            if(existingMatch.legalBalls>0 &&
                existingMatch.legalBalls%6===0)
            {
                swapStrike(existingMatch);

                    if (!newBowler){
                        return Response.json(
                        {
                        msg: "New bowler is required after the over ends."
                        },
                        {
                            status: 400
                        }
                       )
                    }
            

                //validate newBowler
                const incomingBowler = await Player.findById(newBowler);

                if(!incomingBowler)
                {
                    return Response.json(
                        {
                            msg:"bowler not found"
                        },
                        {
                            status:404
                        }
                    ) 
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
            if (ballType === "Normal") {
            playerStats.runs += batsmanRuns;
            playerStats.balls += 1;
            }
            else if (ballType === "NoBall") {
            playerStats.runs += batsmanRuns;
            }
            else if (ballType === "Bye" || ballType === "LegBye") {
            playerStats.balls += 1;
            }

        // Update dismissal
            if (
            wicket &&
            striker.equals(outPlayer)
            ) {
            playerStats.isOut = true;
            }

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

            if (ballType === "Normal") {
            bowlerStats.runsConceded+=batsmanRuns;
            bowlerStats.legalBallsBowled+= 1;
            }
            else if (ballType === "NoBall") {
            bowlerStats.runsConceded += 1 + batsmanRuns + extraRuns;

            }

            else if (ballType === "Wide") {
                bowlerStats.runsConceded+=1 + extraRuns;
            }
            else if (ballType === "Bye" || ballType === "LegBye") {
            bowlerStats.legalBallsBowled+=1;
            }

        // Update dismissal
            if (
            wicket && wicketType != "Run Out" ) {
            bowlerStats.wicketsTaken+=1;
            }

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
                    
                    existingMatch.target=existingMatch.score+1;

                    const temp=existingMatch.battingTeam;
                    existingMatch.battingTeam=existingMatch.bowlingTeam;
                    existingMatch.bowlingTeam=temp;

                    existingMatch.innings=2;

                    existingMatch.score=0;
                    existingMatch.wickets=0;
                    existingMatch.extras=0;
                    existingMatch.legalBalls=0;

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
                    
                    if(existingMatch.score >= existingMatch.target){

                        existingMatch.winner=existingMatch.battingTeam;

                    }
                    else{
                        existingMatch.winner = existingMatch.bowlingTeam;
                    
                    }
                    existingMatch.status= "Ended";

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
            msg:"match updated"
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

