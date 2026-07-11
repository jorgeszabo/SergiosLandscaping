import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { deleteInspection } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Permanently remove an inspection / quote (admin only) — for clearing
    mistaken or test entries so no trash is left behind. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!me.permissions.editCatalog) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteInspection(id);
  return NextResponse.json({ ok: true });
}
