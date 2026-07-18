import { requireAdmin } from "@/lib/auth";
import ImageKit from "imagekit";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest) {
    try{

    await requireAdmin(req);

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
    });

    const authParameters = imagekit.getAuthenticationParameters();

    
    return Response.json({
        ...authParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
    }
    catch(err)
    {
        console.error(err);
        return Response.json({msg:"unauthorized access "},{
            status:500
        });
  }
}