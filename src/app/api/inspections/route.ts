import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { listInspections, upsertInspection } from "@/lib/db/repo";
import type { Inspection } from "@/lib/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ inspections: [] });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ inspections: await listInspections() });
}

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let insp: Inspection;
  try {
    insp = (await req.json()) as Inspection;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!insp?.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  // The approval gate is enforced server-side, not just in the UI: only a user
  // with the `approve` permission may push an inspection into a work-order
  // state. Field capture (draft/submitted/under_review/returned) is unrestricted.
  const isWorkOrderState =
    insp.status === "approved" || insp.status === "in_progress" || insp.status === "completed";
  if (isWorkOrderState && !user.permissions.approve) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const applied = await upsertInspection(insp);
  if (!applied) {
    // A newer version exists on the server — signal a conflict so the client
    // pulls the current copy instead of clobbering it.
    return NextResponse.json({ error: "conflict", conflict: true }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
