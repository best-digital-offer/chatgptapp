import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const APP_ORIGIN = process.env.APP_ORIGIN || "https://app.samewindow.com";
export const MCP_RESOURCE = `${APP_ORIGIN}/api/mcp`;
export const AUTHORIZATION_SERVER = APP_ORIGIN;

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}
export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}
export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function jsonError(error: string, status: number, description?: string) {
  return Response.json({ error, ...(description ? { error_description: description } : {}) }, {
    status,
    headers: { "Cache-Control": "no-store", "Pragma": "no-cache" }
  });
}
export async function authenticatedUser() {
  const { auth } = await import("@/lib/auth/server");
  const { data } = await auth.getSession();
  return data?.user ?? null;
}
export async function issueAuthorizationCode(input: {
  clientId: string; redirectUri: string; challenge: string; userId: string; resource: string; scope: string;
}) {
  const { db } = await import("@/lib/db");
  const code = randomToken(32);
  await db`INSERT INTO public.oauth_authorization_codes
    (code_hash, client_id, redirect_uri, code_challenge, code_challenge_method, user_id, resource, scope, expires_at)
    VALUES (${sha256(code)}, ${input.clientId}, ${input.redirectUri}, ${input.challenge}, 'S256', ${input.userId}, ${input.resource}, ${input.scope}, now() + interval '5 minutes')`;
  return code;
}
export async function validateBearer(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(header);
  if (!match) return null;
  const { db } = await import("@/lib/db");
  const rows = await db`SELECT user_id, client_id, audience, scope FROM public.oauth_access_tokens
    WHERE token_hash = ${sha256(match[1])} AND revoked_at IS NULL AND expires_at > now() LIMIT 1`;
  if (!rows.length || rows[0].audience !== MCP_RESOURCE) return null;
  return { userId: rows[0].user_id as string, clientId: rows[0].client_id as string, scope: rows[0].scope as string };
}
