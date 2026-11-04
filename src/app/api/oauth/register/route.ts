import { randomToken } from "@/lib/oauth";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const body = await request.json().catch(()=>null);
 const redirects = body?.redirect_uris;
 const name = typeof body?.client_name === "string" ? body.client_name.trim().slice(0,120) : "MCP client";
 if (!Array.isArray(redirects) || redirects.length < 1 || redirects.length > 10 || !redirects.every((uri:unknown)=>typeof uri==="string" && uri.length<=2048)) {
  return Response.json({error:"invalid_client_metadata",error_description:"Provide one or more redirect_uris."},{status:400});
 }
 for (const uri of redirects as string[]) {
  try {
   const parsed = new URL(uri);
   const loopback = ["localhost","127.0.0.1","[::1]"].includes(parsed.hostname);
   if (parsed.protocol !== "https:" && !(loopback && parsed.protocol === "http:")) throw new Error();
  } catch { return Response.json({error:"invalid_redirect_uri"},{status:400}); }
 }
 const clientId = randomToken(24);
 await db`INSERT INTO public.oauth_clients (client_id, client_name, redirect_uris) VALUES (${clientId}, ${name}, ${JSON.stringify(redirects)}::jsonb)`;
 return Response.json({client_id:clientId,client_name:name,redirect_uris:redirects,grant_types:["authorization_code","refresh_token"],response_types:["code"],token_endpoint_auth_method:"none",client_id_issued_at:Math.floor(Date.now()/1000)},{status:201,headers:{"Cache-Control":"no-store"}});
}
