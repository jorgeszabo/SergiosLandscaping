/* ---------------------------------------------------------------------------
   Server-side data access. The clean interface the API routes call; the only
   place that knows SQL. Mirrors the client store so a work order / inspection
   round-trips without transformation (integration seam friendly, §7).
   --------------------------------------------------------------------------- */
import { getSql } from "./client";
import { ensureInitialized, DEFAULT_PASSWORD } from "./init";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import type { Catalog, Customer, Inspection, User } from "@/lib/data/types";

function rowToUser(r: Record<string, unknown>, withHash = false): User {
  const u: User = {
    id: r.id as string,
    name: r.name as string,
    role: r.role as User["role"],
    lang: r.lang as User["lang"],
    permissions: r.permissions as User["permissions"],
  };
  if (withHash) u.passwordHash = r.password_hash as string;
  return u;
}

export async function listUsersSafe(): Promise<User[]> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT id, name, role, lang, permissions FROM users ORDER BY name`;
  return rows.map((r) => rowToUser(r));
}

export async function verifyLogin(userId: string, password: string): Promise<User | null> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  if (!rows.length) return null;
  const withHash = rowToUser(rows[0], true);
  const ok = await verifyPassword(password, withHash.passwordHash || "");
  if (!ok) return null;
  return rowToUser(rows[0]); // safe (no hash)
}

export async function getUserById(userId: string): Promise<User | null> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT id, name, role, lang, permissions FROM users WHERE id = ${userId} LIMIT 1`;
  return rows.length ? rowToUser(rows[0]) : null;
}

export async function upsertUser(user: User, password?: string): Promise<void> {
  await ensureInitialized();
  const sql = getSql();
  const perms = sql.json(user.permissions as unknown as Parameters<typeof sql.json>[0]);
  const existing = await sql`SELECT password_hash FROM users WHERE id = ${user.id} LIMIT 1`;
  let hash: string;
  if (password && password.length > 0) {
    hash = await hashPassword(password);
  } else if (existing.length) {
    hash = existing[0].password_hash as string; // keep current password
  } else {
    hash = await hashPassword(DEFAULT_PASSWORD); // new user, no password → default
  }
  await sql`
    INSERT INTO users (id, name, role, lang, permissions, password_hash)
    VALUES (${user.id}, ${user.name}, ${user.role}, ${user.lang}, ${perms}, ${hash})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, role = EXCLUDED.role, lang = EXCLUDED.lang,
      permissions = EXCLUDED.permissions, password_hash = EXCLUDED.password_hash`;
}

export async function deleteUser(id: string): Promise<void> {
  await ensureInitialized();
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function getCatalog(): Promise<Catalog> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT data FROM catalog WHERE id = 'default' LIMIT 1`;
  return rows[0].data as Catalog;
}

export async function saveCatalog(catalog: Catalog): Promise<void> {
  await ensureInitialized();
  const sql = getSql();
  await sql`
    INSERT INTO catalog (id, data, updated_at)
    VALUES ('default', ${sql.json(catalog as unknown as Parameters<typeof sql.json>[0])}, ${Date.now()})
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`;
}

export async function listCustomers(): Promise<Customer[]> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT * FROM customers ORDER BY name`;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    address: r.address as string,
    city: r.city as string,
    contact: (r.contact as string) ?? undefined,
    externalId: (r.external_id as string) ?? undefined,
    externalSource: (r.external_source as string) ?? undefined,
  }));
}

export async function addCustomer(c: Customer): Promise<void> {
  await ensureInitialized();
  const sql = getSql();
  await sql`
    INSERT INTO customers (id, name, address, city, contact, external_id, external_source)
    VALUES (${c.id}, ${c.name}, ${c.address}, ${c.city}, ${c.contact ?? null},
            ${c.externalId ?? null}, ${c.externalSource ?? null})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city,
      contact = EXCLUDED.contact`;
}

export async function listInspections(): Promise<Inspection[]> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT data FROM inspections ORDER BY updated_at DESC`;
  return rows.map((r) => ({ ...(r.data as Inspection), synced: true }));
}

export async function getInspection(id: string): Promise<Inspection | null> {
  await ensureInitialized();
  const sql = getSql();
  const rows = await sql`SELECT data FROM inspections WHERE id = ${id} LIMIT 1`;
  return rows.length ? { ...(rows[0].data as Inspection), synced: true } : null;
}

/** Upsert an inspection, but never let an OLDER write overwrite a newer one
    (optimistic concurrency). Returns false when the incoming copy is stale —
    the caller should treat that as a conflict and pull the server's version. */
export async function upsertInspection(insp: Inspection): Promise<boolean> {
  await ensureInitialized();
  const sql = getSql();
  const clean: Inspection = { ...insp, synced: true };
  const updatedAt = insp.updatedAt || Date.now();
  const result = await sql`
    INSERT INTO inspections (id, status, tech, updated_at, data)
    VALUES (${insp.id}, ${insp.status}, ${insp.tech}, ${updatedAt},
            ${sql.json(clean as unknown as Parameters<typeof sql.json>[0])})
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status, tech = EXCLUDED.tech,
      updated_at = EXCLUDED.updated_at, data = EXCLUDED.data
    WHERE inspections.updated_at <= EXCLUDED.updated_at`;
  return result.count > 0;
}
