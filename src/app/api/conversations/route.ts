import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

async function currentUser() {
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const rows = q
    ? await db`SELECT id, title, summary, tags, folder_id, saved_at FROM public.saved_conversations WHERE user_id = ${user.id} AND (title ILIKE ${"%" + q + "%"} OR coalesce(summary,'') ILIKE ${"%" + q + "%"} OR coalesce(content,'') ILIKE ${"%" + q + "%"}) ORDER BY saved_at DESC LIMIT 100`
    : await db`SELECT id, title, summary, tags, folder_id, saved_at FROM public.saved_conversations WHERE user_id = ${user.id} ORDER BY saved_at DESC LIMIT 100`;
  return NextResponse.json({ conversations: rows });
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const summary = typeof body?.summary === "string" ? body.summary.trim() : null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === "string").slice(0,20) : [];
  if (!title || title.length > 240 || !content || content.length > 500000) {
    return NextResponse.json({ error: "A title and conversation content are required (maximum 500 KB)." }, { status: 400 });
  }
  const folderId = typeof body?.folderId === "string" ? body.folderId : null;
  if (folderId) {
    const folder = await db`SELECT id FROM public.folders WHERE id = ${folderId} AND user_id = ${user.id} LIMIT 1`;
    if (!folder.length) return NextResponse.json({ error: "Folder not found." }, { status: 404 });
  }
  const rows = await db`INSERT INTO public.saved_conversations (user_id, folder_id, title, content, summary, tags) VALUES (${user.id}, ${folderId}, ${title}, ${content}, ${summary}, ${tags}) RETURNING id, title, summary, tags, folder_id, saved_at`;
  return NextResponse.json({ conversation: rows[0] }, { status: 201 });
}
