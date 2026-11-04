import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser, issueAuthorizationCode, MCP_RESOURCE, APP_ORIGIN } from "@/lib/oauth";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function POST(request:NextRequest) {
 const user=await authenticatedUser();
 if(!user) return NextResponse.redirect(new URL("/login",request.url));
 const form=await request.formData();
 const get=(key:string)=>String(form.get(key)||"");
 const clientId=get("client_id"), redirectUri=get("redirect_uri"), state=get("state"), decision=get("decision");
 const client=await db`SELECT redirect_uris FROM public.oauth_clients WHERE client_id=${clientId} LIMIT 1`;
 if(!client.length || !(client[0].redirect_uris as string[]).includes(redirectUri)) return NextResponse.json({error:"invalid_client"},{status:400});
 let callback:URL;
 try { callback=new URL(redirectUri); } catch { return NextResponse.json({error:"invalid_redirect_uri"},{status:400}); }
 if(decision!=="approve") { callback.searchParams.set("error","access_denied"); callback.searchParams.set("state",state); callback.searchParams.set("iss",APP_ORIGIN); return NextResponse.redirect(callback); }
 const resource=get("resource")||MCP_RESOURCE;
 if(resource!==MCP_RESOURCE || get("response_type")!=="code" || get("code_challenge_method")!=="S256") return NextResponse.json({error:"invalid_request"},{status:400});
 const scope=get("scope")||"conversations:read";
 const code=await issueAuthorizationCode({clientId,redirectUri,challenge:get("code_challenge"),userId:user.id,resource,scope});
 callback.searchParams.set("code",code); callback.searchParams.set("state",state); callback.searchParams.set("iss",APP_ORIGIN);
 return NextResponse.redirect(callback);
}
