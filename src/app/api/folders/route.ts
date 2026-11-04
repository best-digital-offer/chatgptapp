import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

async function currentUser() {
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = typeof body?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : "#72e0bc";
  if (!name || name.length > 80) return NextResponse.json({ error: "Folder name must be 1–80 characters." }, { status: 400 });
  try {
    const rows = await db`INSERT INTO public.folders (user_id, name, color) VALUES (${user.id}, ${name}, ${color}) RETURNING id, name, color, created_at`;
    return NextResponse.json({ folder: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A folder with that name may already exist." }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!id || !name || name.length > 80) return NextResponse.json({ error: "A folder and a name of 1–80 characters are required." }, { status: 400 });
  try {
    const rows = await db`UPDATE public.folders SET name = ${name}, updated_at = now() WHERE id = ${id} AND user_id = ${user.id} RETURNING id, name, color`;
    if (!rows.length) return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    return NextResponse.json({ folder: rows[0] });
  } catch {
    return NextResponse.json({ error: "A folder with that name may already exist." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "A folder ID is required." }, { status: 400 });
  const owned = await db`SELECT id FROM public.folders WHERE id = ${id} AND user_id = ${user.id} LIMIT 1`;
  if (!owned.length) return NextResponse.json({ error: "Folder not found." }, { status: 404 });
  await db`UPDATE public.saved_conversations SET folder_id = NULL, updated_at = now() WHERE folder_id = ${id} AND user_id = ${user.id}`;
  const rows = await db`DELETE FROM public.folders WHERE id = ${id} AND user_id = ${user.id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: "Folder not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
