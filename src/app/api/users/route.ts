import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { listUsersSafe, upsertUser } from "@/lib/db/repo";
import type { Permissions, User } from "@/lib/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERM_KEYS: (keyof Permissions)[] = ["seePrices", "setPrice", "editCatalog", "approve"];
const NO_PERMS: Permissions = { seePrices: false, setPrice: false, editCatalog: false, approve: false };

// This list feeds the pre-login account picker, so it must stay unauthenticated
// — but it should not leak each account's permission map to the world.
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ users: [] });
  try {
    const users = await listUsersSafe();
    const publicUsers = users.map((u) => ({ id: u.id, name: u.name, role: u.role, lang: u.lang, permissions: NO_PERMS }));
    return NextResponse.json({ users: publicUsers });
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
  // Prevent privilege escalation: a caller can't grant a permission it doesn't
  // itself hold (so e.g. a catalog editor can't mint an approver/admin).
  const perms = body.user.permissions || NO_PERMS;
  if (PERM_KEYS.some((k) => perms[k] && !me.permissions[k])) {
    return NextResponse.json({ error: "cannot grant permissions you don't have" }, { status: 403 });
  }
  await upsertUser({ ...body.user, permissions: { ...NO_PERMS, ...perms } }, body.password);
  return NextResponse.json({ ok: true });
}
