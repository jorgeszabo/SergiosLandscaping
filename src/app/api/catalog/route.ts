import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { getCatalog, saveCatalog } from "@/lib/db/repo";
import type { Catalog } from "@/lib/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  return NextResponse.json({ catalog: await getCatalog() });
}

export async function PUT(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Editing the catalog / price book is an Admin permission (§4, key 3).
  if (!user.permissions.editCatalog) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let catalog: Catalog;
  try {
    catalog = (await req.json()) as Catalog;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await saveCatalog(catalog);
  return NextResponse.json({ ok: true });
}
