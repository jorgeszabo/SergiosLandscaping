/* ---------------------------------------------------------------------------
   Idempotent schema + seed. Runs on first server request when a database is
   connected, so no separate migration step is required to go live: connect a
   Postgres/Neon database on Vercel, redeploy, and the first request creates the
   tables and loads the starter catalog. Safe to run repeatedly.

   Design note: users / customers / inspections are real rows (multi-user,
   queryable); the catalog and each inspection's rich body are stored as JSONB
   so the server mirrors the exact client object model without a brittle ORM
   mapping. All of it stays Admin-editable.
   --------------------------------------------------------------------------- */
import type { Sql } from "postgres";
import { getSql } from "./client";
import { hashPassword } from "@/lib/auth/password";
import { SEED_CATALOG, SEED_USERS, SEED_CUSTOMERS } from "@/lib/data/seed";

/** Default password for every seeded account. Change per user after go-live. */
export const DEFAULT_PASSWORD = "sergios2026";

let _initialized: Promise<void> | null = null;

async function createSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      name text NOT NULL,
      role text NOT NULL,
      lang text NOT NULL DEFAULT 'en',
      permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
      password_hash text NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id text PRIMARY KEY,
      name text NOT NULL,
      address text NOT NULL DEFAULT '',
      city text NOT NULL DEFAULT '',
      contact text,
      external_id text,
      external_source text
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS inspections (
      id text PRIMARY KEY,
      status text NOT NULL DEFAULT 'draft',
      tech text NOT NULL DEFAULT '',
      updated_at bigint NOT NULL DEFAULT 0,
      data jsonb NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS catalog (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at bigint NOT NULL DEFAULT 0
    )`;
}

async function seedIfEmpty(sql: Sql): Promise<void> {
  const [{ count: userCount }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM users`;
  if (userCount === 0) {
    const hash = await hashPassword(DEFAULT_PASSWORD);
    for (const u of SEED_USERS) {
      await sql`
        INSERT INTO users (id, name, role, lang, permissions, password_hash)
        VALUES (${u.id}, ${u.name}, ${u.role}, ${u.lang},
                ${sql.json(u.permissions as unknown as Parameters<typeof sql.json>[0])}, ${hash})
        ON CONFLICT (id) DO NOTHING`;
    }
  }

  const [{ count: custCount }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM customers`;
  if (custCount === 0) {
    for (const c of SEED_CUSTOMERS) {
      await sql`
        INSERT INTO customers (id, name, address, city, contact, external_id, external_source)
        VALUES (${c.id}, ${c.name}, ${c.address}, ${c.city},
                ${c.contact ?? null}, ${c.externalId ?? null}, ${c.externalSource ?? null})
        ON CONFLICT (id) DO NOTHING`;
    }
  }

  const [{ count: catCount }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM catalog`;
  if (catCount === 0) {
    await sql`
      INSERT INTO catalog (id, data, updated_at)
      VALUES ('default', ${sql.json(SEED_CATALOG as unknown as Parameters<typeof sql.json>[0])}, 0)
      ON CONFLICT (id) DO NOTHING`;
  }
}

/** Ensure schema + seed exist. Memoized per server instance. */
export function ensureInitialized(): Promise<void> {
  if (!_initialized) {
    _initialized = (async () => {
      const root = getSql();
      // Serialize concurrent cold-start initializers with a transaction-scoped
      // advisory lock so parallel CREATE TABLE / seed can't collide.
      await root.begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(748219347)`;
        await createSchema(tx as unknown as Sql);
        await seedIfEmpty(tx as unknown as Sql);
      });
    })().catch((e) => {
      _initialized = null; // allow retry on the next request
      throw e;
    });
  }
  return _initialized;
}
