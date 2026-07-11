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
  await upsertInspection(insp);
  return NextResponse.json({ ok: true });
}
