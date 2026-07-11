/* ---------------------------------------------------------------------------
   Sessions as signed JWTs (jose — the library Auth.js itself uses), stored in
   an httpOnly cookie. Standard sessions, not improvised (Code handoff §6).

   The signing key comes from AUTH_SECRET. To keep the app live the moment a
   database is connected — even before AUTH_SECRET is set — it falls back to a
   key derived from the database URL (a stable server-only secret). Setting
   AUTH_SECRET explicitly is recommended and documented in the README.
   --------------------------------------------------------------------------- */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { databaseUrl } from "@/lib/db/client";

export const SESSION_COOKIE = "sergios_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

let warnedFallback = false;

function secret(): Uint8Array {
  const explicit = process.env.AUTH_SECRET;
  if (explicit && explicit.length >= 16) {
    return new Uint8Array(createHash("sha256").update(explicit).digest());
  }
  const dbUrl = databaseUrl();
  if (process.env.NODE_ENV === "production") {
    // Keep the app working if AUTH_SECRET wasn't set, but never use a hardcoded
    // key in production, and warn loudly to set a dedicated secret.
    if (!dbUrl) {
      throw new Error(
        "AUTH_SECRET is required in production (generate one with: openssl rand -base64 32)."
      );
    }
    if (!warnedFallback) {
      warnedFallback = true;
      console.warn(
        "[auth] AUTH_SECRET is unset or too short — deriving the session key from the database URL. " +
          "Set AUTH_SECRET (openssl rand -base64 32) for a dedicated signing key."
      );
    }
    return new Uint8Array(createHash("sha256").update(dbUrl).digest());
  }
  // Local/dev fallback only.
  return new Uint8Array(createHash("sha256").update(dbUrl || "dev-insecure-secret").digest());
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.uid as string) || null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

/** Read the signed-in user id from the request cookies (server components /
    route handlers). */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
