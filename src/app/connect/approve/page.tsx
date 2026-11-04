import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export default async function ApprovePage({searchParams}:Props) {
 const {data}=await auth.getSession();
 const p=await searchParams;
 const params=new URLSearchParams();
 for(const [k,v] of Object.entries(p)) if(typeof v==="string") params.set(k,v);
 const next="/connect/approve?"+params.toString();
 if(!data?.user) redirect("/login?next="+encodeURIComponent(next));
 const clientId=params.get("client_id")||"", redirectUri=params.get("redirect_uri")||"";
 const client=await db`SELECT client_name,redirect_uris FROM public.oauth_clients WHERE client_id=${clientId} LIMIT 1`;
 if(!client.length || !(client[0].redirect_uris as string[]).includes(redirectUri)) return <main className="auth-shell"><section className="auth-panel"><h1 className="auth-title">Invalid connection request</h1><p className="auth-copy">This client or callback address is not registered. Close this page and try connecting again.</p></section></main>;
 const scopes=(params.get("scope")||"conversations:read").split(/\\s+/).filter(Boolean);
 return <main className="auth-shell"><a className="brand" href="/"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></a><section className="auth-panel"><span className="eyebrow">SECURE CONNECTION</span><h1 className="auth-title">Connect<br/><em>{client[0].client_name}</em></h1><p className="auth-copy">This app is requesting permission to access your SameWindow archive.</p><div className="permission-list">{scopes.includes("conversations:read")&&<p><b>Read saved conversations</b><br/>Search your saved library and retrieve conversations you choose to share.</p>}{scopes.includes("conversations:write")&&<p><b>Save conversations</b><br/>Add conversation content to your private SameWindow archive when you ask it to.</p>}</div><p className="auth-foot">Your other ChatGPT conversations are not automatically imported. You can revoke this connection at any time.</p><form action="/api/oauth/approve" method="post">{Array.from(params.entries()).map(([k,v])=><input key={k} type="hidden" name={k} value={v}/>)}<button className="primary-button auth-submit" type="submit" name="decision" value="approve">Authorize connection <span>→</span></button><button className="secondary-button auth-submit" type="submit" name="decision" value="deny">Cancel</button></form></section></main>;
}
