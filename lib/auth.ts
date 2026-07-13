import { SignJWT,jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(adminId: string,email:string){
    const payload = new SignJWT({
        adminId,
        email
    });

    const token = await payload.setProtectedHeader({
        alg: "HS256",
    }).setIssuedAt().
    setExpirationTime("15d").sign(secret)

    return token;



}

export async function verifyToken(token:string)
{
    const { payload } = await jwtVerify(token,secret);

    return payload;
}

export async function requireAdmin(req: NextRequest){

     const token = req.cookies.get("admin_token")?.value;

     if(!token){
        throw new Error("unauthorized")
     };
     const payload = await verifyToken(token)

     return payload;
}