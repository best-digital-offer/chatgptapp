import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ConnectionsClient } from "./connections-client";
export const dynamic="force-dynamic";
export default async function ConnectionsPage() {
 const {data}=await auth.getSession();
 if(!data?.user) redirect("/login");
 return <main className="library-shell"><header className="library-nav"><Link className="brand" href="/library"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><Link className="secondary-button" href="/library">Back to library</Link></header><section className="library-main"><span className="eyebrow">ACCOUNT SECURITY</span><h1 className="library-title">Connected apps.</h1><p className="auth-copy">Review apps authorized to access your SameWindow archive. Revoking an app immediately invalidates its active access and refresh tokens.</p><ConnectionsClient/></section></main>;
}
