import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req:Request){

    const response = NextResponse.json(
        {
            success: true,
            msg:"logged out successfully"
        },
        {
            status:200
        }
    );

    response.cookies.set("admin_token","",{
        httpOnly: true,
        expires: new Date(0),
        path:"/"
    });

    return response;

}