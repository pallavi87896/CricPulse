import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcrypt"
import { createToken } from "@/lib/auth";
import { NextResponse } from "next/server"; 

export async function POST(req:Request){

    try{

        await connectDB();

        const { email,password } = await req.json();

         if (!email || !password) {
            return Response.json(
                {
                success: false,
                message: "Email and password are required",
                },
                {
                status: 400,
                }
            );
        } 

        const admin = await Admin.findOne({
            email
        });

        if(!admin){
            return Response.json({
                msg:"email not found"
            },
             {
                status: 404
             });
        }

        const isMatch = await bcrypt.compare(password,admin.password);
        if(!isMatch){
            return Response.json(
                {
                    success:false,
                    message:"Invalid email or password"
                },
                {
                    status:401
                }
            );
        }

        //jwt
        const token = await createToken(
            admin._id.toString(),
            admin.email
        );
            
        
        const response=  NextResponse.json
        ({
            success:true,
            msg:"login successful"
        },
        {
            status:200
        });

        //store jwt inside cookie
        response.cookies.set("admin_token",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60*60*24*15,
            path:"/",
        });

        return response;
    }
    catch(err)
    {
        console.error(err);
        return Response.json({
                success:false,
                msg: "servor error"
            },
             {
                status: 500
             });
    }
}