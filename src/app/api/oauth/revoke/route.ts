import { db } from "@/lib/db";
import { sha256 } from "@/lib/oauth";
export const runtime = "nodejs";
export async function POST(request:Request) {
 const form=await request.formData();
 const token=String(form.get("token")||"");
 const clientId=String(form.get("client_id")||"");
 if(token && clientId) {
  const hash=sha256(token);
  await db`UPDATE public.oauth_access_tokens SET revoked_at=now() WHERE token_hash=${hash} AND client_id=${clientId}`;
  await db`UPDATE public.oauth_refresh_tokens SET revoked_at=now() WHERE token_hash=${hash} AND client_id=${clientId}`;
 }
 return new Response(null,{status:200,headers:{"Cache-Control":"no-store"}});
}
