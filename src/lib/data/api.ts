/* ---------------------------------------------------------------------------
   Thin client for the server data layer. Every call degrades gracefully: if the
   server isn't configured or the device is offline, callers fall back to the
   local (IndexedDB) store. This is the seam that makes the app multi-user when a
   database is connected, and fully offline-capable when it isn't.
   --------------------------------------------------------------------------- */
import type { Catalog, Customer, Inspection, User } from "./types";

export interface ServerState {
  catalog: Catalog;
  users: User[];
  customers: Customer[];
  inspections: Inspection[];
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Is a shared server database wired up? Cached after the first check. */
let _configured: boolean | null = null;
export async function serverConfigured(): Promise<boolean> {
  if (_configured !== null) return _configured;
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const data = await j<{ configured: boolean }>(res);
    _configured = !!data.configured;
  } catch {
    _configured = false;
  }
  return _configured;
}

export async function apiLogin(userId: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });
  const data = await j<{ user: User }>(res);
  return data.user;
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function apiMe(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await j<{ user: User | null }>(res);
    return data.user;
  } catch {
    return null;
  }
}

/** Public user list (safe fields only) for the login picker in server mode. */
export async function apiUsers(): Promise<User[]> {
  const res = await fetch("/api/users", { cache: "no-store" });
  const data = await j<{ users: User[] }>(res);
  return data.users;
}

export async function fetchState(): Promise<ServerState> {
  const res = await fetch("/api/state", { cache: "no-store" });
  return j<ServerState>(res);
}

export async function pushInspection(insp: Inspection): Promise<void> {
  await fetch("/api/inspections", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(insp),
  }).then((r) => {
    if (!r.ok) throw new Error("push inspection failed");
  });
}

export async function pushCatalog(catalog: Catalog): Promise<void> {
  await fetch("/api/catalog", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(catalog),
  }).then((r) => {
    if (!r.ok) throw new Error("push catalog failed");
  });
}

export async function pushCustomer(customer: Customer): Promise<void> {
  await fetch("/api/customers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(customer),
  }).then((r) => {
    if (!r.ok) throw new Error("push customer failed");
  });
}
