import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: isDbConfigured(),
    maps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
}
