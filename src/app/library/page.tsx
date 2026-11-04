import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { LibraryClient } from "./library-client";
import { SignOutButton } from "./sign-out";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login");
  const [conversations,folders] = await Promise.all([
    db`SELECT id, title, summary, tags, folder_id, saved_at FROM public.saved_conversations WHERE user_id = ${data.user.id} ORDER BY saved_at DESC LIMIT 100`,
    db`SELECT id, name, color FROM public.folders WHERE user_id = ${data.user.id} ORDER BY created_at ASC`
  ]);
  return <main className="library-shell"><header className="library-nav"><Link className="brand" href="/"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><div className="library-user"><span>{data.user.name || data.user.email}</span><Link href="/settings/connections">Connected apps</Link><SignOutButton /></div></header><section className="library-main"><div className="library-heading"><div><span className="eyebrow">YOUR PRIVATE ARCHIVE</span><h1 className="library-title">Your conversations.</h1><p className="auth-copy">A searchable home for the ideas you chose to keep.</p></div><Link className="primary-button" href="/save">Save a conversation <span>+</span></Link></div><LibraryClient initialConversations={conversations as any[]} folders={folders as any[]}/></section></main>;
}
