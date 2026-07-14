import { NextRequest,NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req:NextRequest){

    const { pathname } = req.nextUrl;
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    try{
    const token = req.cookies.get("admin_token")?.value;

    if(!token){
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    await verifyToken(token);

    return NextResponse.next();
    
}
catch(err){

    console.error(err);
    
    return NextResponse.redirect(new URL("/admin/login", req.url));
}
}

export const config = {
    matcher: ["/admin/:path*"],
};