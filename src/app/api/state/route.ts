import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { getCatalog, listUsersSafe, listCustomers, listInspections } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full app state for the signed-in user: catalog, users, customers, inspections. */
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [catalog, users, customers, inspections] = await Promise.all([
    getCatalog(),
    listUsersSafe(),
    listCustomers(),
    listInspections(),
  ]);
  return NextResponse.json({ catalog, users, customers, inspections });
}
