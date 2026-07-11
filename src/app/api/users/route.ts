import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { listUsersSafe, upsertUser } from "@/lib/db/repo";
import type { User } from "@/lib/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ users: [] });
  try {
    const users = await listUsersSafe();
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ users: [], error: String(e) }, { status: 500 });
  }
}

/** Create or update a user (admin only). Body: { user, password? }. */
export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!me.permissions.editCatalog) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { user: User; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!body?.user?.id || !body.user.name) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  await upsertUser(body.user, body.password);
  return NextResponse.json({ ok: true });
}
