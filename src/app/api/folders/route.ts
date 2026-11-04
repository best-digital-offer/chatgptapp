import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { data } = await auth.getSession();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = typeof body?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : "#8b7cff";
  if (!name || name.length > 80) return NextResponse.json({ error: "Folder name must be 1–80 characters." }, { status: 400 });
  try {
    const rows = await db`INSERT INTO public.folders (user_id, name, color) VALUES (${data.user.id}, ${name}, ${color}) RETURNING id, name, color, created_at`;
    return NextResponse.json({ folder: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A folder with that name may already exist." }, { status: 409 });
  }
}
