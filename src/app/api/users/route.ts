import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { listUsersSafe } from "@/lib/db/repo";

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
