import Player from "@/models/Player";
import { connectDB } from "@/lib/mongodb";

export async function POST(req:Request)
{
    try
    {
        await connectDB();

        const { name, role, team } = await req.json();

        const player = await Player.create 
        ({
            name,
            role,
            team

        });
        await player.populate("team","name logo");
        
        return Response.json(player);

    }
    catch(err)
    {
        return Response.json 
        (
            {
                msg:"failed to create player"
            },
            {
                status:500
            }
            
        )
    };
}

export async function GET()
{
    try 
    {
        await connectDB();

        const players=await Player.find().populate("team","name logo");

        return Response.json(players);
    }
    catch(err)
    {
        return Response.json
        (
            {
                msg:"failed to fetch players",
            },
            {
                status:500
            }
            
        )
    }
}

export async function PATCH(req:Request)
{
    try
    {
        await connectDB();

        const { id, name, role, team }=await req.json();

        const updatedPlayer=await Player.findByIdAndUpdate(
            id,
            { name,role,team },
            { new:true }
        ).populate("team","name logo")

        return Response.json(updatedPlayer);
    }
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to update player",
            },
            {
                status:500
            }
        );
    }
}


export async function DELETE(req:Request)
{
    try
    {
        await connectDB();

        const { id }=await req.json();

        const delPlayer= await Player.findByIdAndDelete(id);

        return Response.json
        ({
            msg:"player deleted successfully",
        });

    }
    catch(err)
    {
        return Response.json 
        (
            {
                msg:"failed to delete player"
            },
            {
                status:500
            }
            
        )
    };
}
// connectDB() is called in each route because
// Next.js Edge Middleware cannot use Mongoose.