import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcrypt";

export async function POST(req:Request){
    try
    {
        await connectDB();

        const { name,email,password} = await req.json();

         if (!name || !email || !password) {
            return Response.json(
                {
                success: false,
                message: "All fields are required.",
                },
                { status: 400 }
            );
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
        return Response.json(
            {
            success: false,
            message: "Admin already exists.",
            },
            { status: 409 }
        );
        }
        const hashedPassword = await bcrypt.hash(password,10);

        await Admin.create({
            name,
            email,
            password: hashedPassword
        });

            return Response.json(
        {
            success: true,
            message: "Admin registered successfully.",
        },
        { status: 201 }
        );

    } catch (err) 
    {
        console.error(err);

        return Response.json(
        {
            success: false,
            message: "Internal Server Error",
        },
        { status: 500 }
        );
    }
}