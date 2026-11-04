import { db } from "@/lib/db";
import { jsonError, MCP_RESOURCE, pkceChallenge, randomToken, safeEqual, sha256 } from "@/lib/oauth";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const form=await request.formData();
 const grant=String(form.get("grant_type")||"");
 const clientId=String(form.get("client_id")||"");
 const resource=String(form.get("resource")||MCP_RESOURCE);
 if(!clientId || resource!==MCP_RESOURCE) return jsonError("invalid_request",400,"client_id and the correct resource are required.");
 const clients=await db`SELECT client_id FROM public.oauth_clients WHERE client_id=${clientId} LIMIT 1`;
 if(!clients.length) return jsonError("invalid_client",401);
 if(grant==="authorization_code") {
  const code=String(form.get("code")||""), redirectUri=String(form.get("redirect_uri")||""), verifier=String(form.get("code_verifier")||"");
  if(!code || !redirectUri || verifier.length<43 || verifier.length>128) return jsonError("invalid_request",400);
  const rows=await db`UPDATE public.oauth_authorization_codes SET used_at=now() WHERE code_hash=${sha256(code)} AND client_id=${clientId} AND redirect_uri=${redirectUri} AND resource=${resource} AND code_challenge=${pkceChallenge(verifier)} AND code_challenge_method='S256' AND used_at IS NULL AND expires_at>now() RETURNING user_id, scope`;
  if(!rows.length) return jsonError("invalid_grant",400,"The code is expired, already used, or PKCE validation failed.");
  const access=randomToken(32), refresh=randomToken(48);
  await db`INSERT INTO public.oauth_access_tokens(token_hash,user_id,client_id,audience,scope,expires_at) VALUES(${sha256(access)},${rows[0].user_id},${clientId},${resource},${rows[0].scope},now()+interval '1 hour')`;
  await db`INSERT INTO public.oauth_refresh_tokens(token_hash,user_id,client_id,audience,scope,expires_at) VALUES(${sha256(refresh)},${rows[0].user_id},${clientId},${resource},${rows[0].scope},now()+interval '30 days')`;
  return Response.json({access_token:access,token_type:"Bearer",expires_in:3600,refresh_token:refresh,scope:rows[0].scope,resource},{headers:{"Cache-Control":"no-store","Pragma":"no-cache"}});
 }
 if(grant==="refresh_token") {
  const refresh=String(form.get("refresh_token")||"");
  const rows=await db`UPDATE public.oauth_refresh_tokens SET revoked_at=now() WHERE token_hash=${sha256(refresh)} AND client_id=${clientId} AND audience=${resource} AND revoked_at IS NULL AND expires_at>now() RETURNING user_id,scope`;
  if(!rows.length) return jsonError("invalid_grant",400);
  const access=randomToken(32), nextRefresh=randomToken(48);
  await db`INSERT INTO public.oauth_access_tokens(token_hash,user_id,client_id,audience,scope,expires_at) VALUES(${sha256(access)},${rows[0].user_id},${clientId},${resource},${rows[0].scope},now()+interval '1 hour')`;
  await db`INSERT INTO public.oauth_refresh_tokens(token_hash,user_id,client_id,audience,scope,expires_at) VALUES(${sha256(nextRefresh)},${rows[0].user_id},${clientId},${resource},${rows[0].scope},now()+interval '30 days')`;
  return Response.json({access_token:access,token_type:"Bearer",expires_in:3600,refresh_token:nextRefresh,scope:rows[0].scope,resource},{headers:{"Cache-Control":"no-store","Pragma":"no-cache"}});
 }
 return jsonError("unsupported_grant_type",400);
}
