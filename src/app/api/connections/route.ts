import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
export const runtime="nodejs";
export async function GET() {
 const {data}=await auth.getSession();
 if(!data?.user) return NextResponse.json({error:"Unauthorized"},{status:401});
 const rows=await db`SELECT c.client_id,c.client_name, max(t.created_at) AS connected_at, max(t.expires_at) AS latest_token_expiry
 FROM public.oauth_clients c JOIN public.oauth_access_tokens t ON t.client_id=c.client_id
 WHERE t.user_id=${data.user.id} AND t.revoked_at IS NULL AND t.expires_at>now()
 GROUP BY c.client_id,c.client_name ORDER BY max(t.created_at) DESC`;
 return NextResponse.json({connections:rows});
}
export async function POST(request:NextRequest) {
 const {data}=await auth.getSession();
 if(!data?.user) return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>null);
 const clientId=typeof body?.client_id==="string"?body.client_id:"";
 if(!clientId) return NextResponse.json({error:"Client is required."},{status:400});
 await db`UPDATE public.oauth_access_tokens SET revoked_at=now() WHERE user_id=${data.user.id} AND client_id=${clientId} AND revoked_at IS NULL`;
 await db`UPDATE public.oauth_refresh_tokens SET revoked_at=now() WHERE user_id=${data.user.id} AND client_id=${clientId} AND revoked_at IS NULL`;
 return NextResponse.json({success:true});
}
