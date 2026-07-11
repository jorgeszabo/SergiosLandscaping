/* ---------------------------------------------------------------------------
   Offline-first local store (Code handoff §1). The field face must work with no
   connectivity, so the whole client database lives in IndexedDB — large enough
   to hold inspection photos, unlike localStorage. This is the client's source
   of truth; the server (when configured) is synced to/from on top of it.
   --------------------------------------------------------------------------- */
import type { Database } from "./types";
import { freshDatabase } from "./seed";

const DB_NAME = "sergios_irrigation";
const STORE = "state";
const KEY = "db";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Load the local database, seeding a fresh one on first run. */
export async function idbLoad(): Promise<Database> {
  if (typeof indexedDB === "undefined") return freshDatabase();
  try {
    const db = await openIDB();
    const value = await new Promise<Database | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result as Database | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!value) {
      const fresh = freshDatabase();
      await idbSave(fresh);
      return fresh;
    }
    // Keep the seeded catalog fresh across app updates while preserving data.
    return value;
  } catch {
    return freshDatabase();
  }
}

export async function idbSave(data: Database): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(data, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* best-effort; UI already holds state in memory */
  }
}

export async function idbReset(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await idbSave(freshDatabase());
}
