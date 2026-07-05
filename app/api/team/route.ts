import Team from "@/models/Team";
import { connectDB } from "@/lib/mongodb";

export async function POST(req:Request)
{
    try
    {
        await connectDB();

        const { name, logo } = await req.json();

        const team = await Team.create 
        ({
            name,
            logo

        });
        
        return Response.json(team);

    }
    catch(err)
    {
        return Response.json 
        (
            {
                msg:"failed to create team"
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

        const teams=await Team.find();

        return Response.json(teams);
    }
    catch(err)
    {
        return Response.json
        (
            {
                msg:"failed to fetch teams",
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

        const { id, name, logo }=await req.json();

        const updatedTeam=await Team.findByIdAndUpdate(
            id,
            { name,logo },
            { new:true }
        )

        return Response.json(updatedTeam);
    }
    catch(err)
    {
        return Response.json(
            {
                msg:"failed to update team",
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

        const delTeam= await Team.findByIdAndDelete(id);

        return Response.json
        ({
            msg:"Team deleted successfully",
        });

    }
    catch(err)
    {
        return Response.json 
        (
            {
                msg:"failed to delete team"
            },
            {
                status:500
            }
            
        )
    };
}
//mongoose + next js doesnt support middlewares so we cannot write it in a single function n use it everywhere