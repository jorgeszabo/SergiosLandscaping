/* ---------------------------------------------------------------------------
   Server Postgres connection (postgres.js). Activates only when a connection
   string is present in the environment — so the app deploys and runs with no
   database (local-first demo) and becomes multi-user the moment a Postgres/Neon
   database is connected on Vercel. Kept behind this module so the store is
   swappable (Code handoff §1, §7).
   --------------------------------------------------------------------------- */
import postgres, { type Sql } from "postgres";

/** Vercel's Postgres/Neon integration sets several of these; try in order. */
const URL_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

export function databaseUrl(): string | undefined {
  for (const v of URL_VARS) {
    const val = process.env[v];
    if (val && val.length > 0) return val;
  }
  return undefined;
}

export function isDbConfigured(): boolean {
  return !!databaseUrl();
}

let _sql: Sql | null = null;

/** Lazily-created connection. `prepare: false` keeps it compatible with the
    pooled (pgbouncer) Neon endpoint. */
export function getSql(): Sql {
  if (_sql) return _sql;
  const url = databaseUrl();
  if (!url) throw new Error("No database configured");
  _sql = postgres(url, { prepare: false, idle_timeout: 20, max: 5 });
  return _sql;
}
