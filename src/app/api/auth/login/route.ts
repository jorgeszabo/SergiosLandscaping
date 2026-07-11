import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { verifyLogin } from "@/lib/db/repo";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "server auth not configured" }, { status: 503 });
  }
  let body: { userId?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const { userId, password } = body;
  if (!userId) return NextResponse.json({ error: "missing user" }, { status: 400 });

  const user = await verifyLogin(userId, password || "");
  if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });

  const token = await signSession(user.id);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
