import BallEvent from "@/models/BallEvent";
import { connectDB } from "@/lib/mongodb";

export async function GET(req:Request, { params } : { params : Promise <{ matchId : string }> }) {

    try
    {
        const { matchId } = await params;
        const id = matchId;

        await connectDB();

        const ballEvents = await BallEvent.find ({
            match: id
        }).populate("striker","name").populate("bowler","name").populate("outPlayer","name").sort( {createdAt:-1 });

        return Response.json(ballEvents);


    }
    catch(err)
    {
        return Response.json({
            msg:"failed to load ballEvent"
        },{
            status:500
        })
    }
    
}