import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser, MCP_RESOURCE, jsonError } from "@/lib/oauth";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
 const p=request.nextUrl.searchParams;
 const clientId=p.get("client_id")||"", redirectUri=p.get("redirect_uri")||"", responseType=p.get("response_type")||"";
 const challenge=p.get("code_challenge")||"", method=p.get("code_challenge_method")||"", state=p.get("state")||"";
 const resource=p.get("resource")||MCP_RESOURCE, scope=(p.get("scope")||"conversations:read").trim();
 if(responseType!=="code" || !clientId || !redirectUri || !challenge || method!=="S256" || !state) return jsonError("invalid_request",400,"Authorization code with PKCE S256 and state is required.");
 if(resource!==MCP_RESOURCE) return jsonError("invalid_target",400,"The resource parameter must identify this MCP server.");
 const clients=await db`SELECT client_name, redirect_uris FROM public.oauth_clients WHERE client_id=${clientId} LIMIT 1`;
 if(!clients.length || !(clients[0].redirect_uris as string[]).includes(redirectUri)) return jsonError("invalid_client",400,"Unknown client or redirect URI.");
 const allowed=new Set(["conversations:read","conversations:write"]);
 const requested=scope.split(/\s+/).filter(Boolean);
 if(!requested.length || requested.some(s=>!allowed.has(s))) return jsonError("invalid_scope",400);
 const user=await authenticatedUser();
 const approval=new URL("/connect/approve",request.url);
 for(const [key,value] of p.entries()) approval.searchParams.set(key,value);
 if(!user) {
  const login=new URL("/login",request.url); login.searchParams.set("next",approval.pathname+approval.search); return NextResponse.redirect(login);
 }
 return NextResponse.redirect(approval);
}
