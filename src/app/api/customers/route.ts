import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/guard";
import { listCustomers, addCustomer } from "@/lib/db/repo";
import type { Customer } from "@/lib/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ customers: [] });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ customers: await listCustomers() });
}

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let c: Customer;
  try {
    c = (await req.json()) as Customer;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!c?.id || !c?.name) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  await addCustomer(c);
  return NextResponse.json({ ok: true });
}
