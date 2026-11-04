import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { DeleteConversationButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login");
  const { id } = await params;
  const rows = await db`SELECT id, title, content, summary, tags, saved_at FROM public.saved_conversations WHERE id = ${id} AND user_id = ${data.user.id} LIMIT 1`;
  if (!rows.length) notFound();
  const item = rows[0];
  return <main className="library-shell"><header className="library-nav"><Link className="brand" href="/library"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><Link className="secondary-button" href="/library">← Back to library</Link></header><article className="legal-panel conversation-detail"><span className="eyebrow">SAVED CONVERSATION · {new Date(item.saved_at).toLocaleDateString()}</span><h1 className="library-title">{item.title}</h1>{item.summary && <p className="auth-copy">{item.summary}</p>}{item.tags?.length > 0 && <p className="detail-tags">{item.tags.join(" · ")}</p>}<div className="conversation-body">{item.content}</div><div className="detail-actions"><Link className="secondary-button" href="/library">Back to library</Link><DeleteConversationButton id={item.id}/></div></article></main>;
}
