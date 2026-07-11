import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { getInspection, getCatalog } from "@/lib/db/repo";
import { exportWorkOrder } from "@/lib/integration/work-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Outbound work-order contract for a scheduling/dispatch system to consume. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const [insp, catalog] = await Promise.all([getInspection(id), getCatalog()]);
  if (!insp) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(exportWorkOrder(insp, catalog));
}
