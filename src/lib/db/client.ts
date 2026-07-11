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

const isPgUrl = (v: unknown): v is string =>
  typeof v === "string" && /^postgres(ql)?:\/\//.test(v);

export function databaseUrl(): string | undefined {
  // 1. Standard names (empty / default prefix).
  for (const v of URL_VARS) {
    if (isPgUrl(process.env[v])) return process.env[v];
  }
  // 2. Any env var holding a Postgres connection string. Handles a custom
  //    integration prefix (e.g. STORAGE_URL, STORAGE_DATABASE_URL). Prefer a
  //    pooled connection for serverless (skip *UNPOOLED / *NON_POOLING).
  const found: { key: string; val: string }[] = [];
  for (const [key, val] of Object.entries(process.env)) {
    if (isPgUrl(val)) found.push({ key, val });
  }
  if (found.length === 0) return undefined;
  const pooled = found.find(
    (f) => !/UNPOOLED|NON_POOLING/i.test(f.key) && /(_|^)(DATABASE|POSTGRES)_URL$|(_|^)URL$/i.test(f.key)
  );
  return (pooled || found[0]).val;
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
