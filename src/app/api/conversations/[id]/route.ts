import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { data } = await auth.getSession();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const rows = await db`SELECT id, title, content, summary, tags, folder_id, source, source_url, saved_at, updated_at FROM public.saved_conversations WHERE id = ${id} AND user_id = ${data.user.id} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ conversation: rows[0] });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { data } = await auth.getSession();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const rows = await db`DELETE FROM public.saved_conversations WHERE id = ${id} AND user_id = ${data.user.id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
