"use client";
/* ---------------------------------------------------------------------------
   AppStore — the single source of truth the whole UI reads from.

   • Loads the local (IndexedDB) database so the field face works fully offline.
   • If a shared server database is configured, hydrates catalog / customers /
     inspections from it (multi-user) and syncs local changes back on top.
   • Every inspection mutation goes through upsertInspection(), which persists
     locally instantly and pushes to the server when online — the offline-first
     capture + sync mechanism, planned from the start rather than bolted on.
   --------------------------------------------------------------------------- */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type {
  Catalog,
  Customer,
  Database,
  Inspection,
  Lang,
  User,
} from "./types";
import { freshDatabase } from "./seed";
import { idbLoad, idbSave, idbReset } from "./local-db";
import {
  serverConfigured,
  apiMe,
  apiLogin,
  apiLogout,
  apiUsers,
  fetchState,
  pushInspection,
  pushCatalog,
  pushCustomer,
} from "./api";

export type SyncState = "local" | "synced" | "pending" | "offline";

interface StoreValue {
  ready: boolean;
  mode: "local" | "server";
  online: boolean;
  syncState: SyncState;
  db: Database;
  user: User | null;
  lang: Lang;
  /** Users offered on the login screen (server users in server mode). */
  loginUsers: User[];
  setLang: (l: Lang) => void;
  toggleRunningTotal: () => void;
  login: (userId: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  upsertInspection: (insp: Inspection) => void;
  removeInspection: (id: string) => void;
  saveCatalog: (catalog: Catalog) => Promise<void>;
  addCustomer: (c: Customer) => void;
  resetLocal: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

function mergeInspections(local: Inspection[], server: Inspection[]): Inspection[] {
  const byId = new Map<string, Inspection>();
  for (const s of server) byId.set(s.id, { ...s, synced: true });
  for (const l of local) {
    const s = byId.get(l.id);
    // Keep the local copy when it's unsynced or newer than the server's.
    if (!s || l.synced === false || (l.updatedAt || 0) > (s.updatedAt || 0)) {
      byId.set(l.id, l);
    }
  }
  return Array.from(byId.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"local" | "server">("local");
  const [online, setOnline] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("local");
  const [db, setDb] = useState<Database>(() => freshDatabase());
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLangState] = useState<Lang>("es");
  const [loginUsers, setLoginUsers] = useState<User[]>([]);
  const dbRef = useRef(db);
  dbRef.current = db;

  const commit = useCallback((next: Database) => {
    dbRef.current = next;
    setDb(next);
    void idbSave(next);
  }, []);

  // ── boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await idbLoad();
      if (cancelled) return;
      let working = local;
      setLangState(local.settings.lang || "es");

      const configured = await serverConfigured();
      if (configured) {
        setMode("server");
        try {
          const me = await apiMe();
          const users = await apiUsers();
          if (!cancelled) setLoginUsers(users);
          if (me) {
            setUser(me);
            setLangState(me.lang || local.settings.lang || "es");
            const state = await fetchState();
            working = {
              ...local,
              users: state.users,
              catalog: state.catalog,
              customers: state.customers,
              inspections: mergeInspections(local.inspections, state.inspections),
              session: me.id,
            };
            setSyncState("synced");
          }
        } catch {
          setSyncState("offline");
        }
      } else {
        setMode("local");
        setLoginUsers(local.users);
        // Restore a previous local session if present.
        if (local.session) {
          const u = local.users.find((x) => x.id === local.session) || null;
          setUser(u);
          if (u) setLangState(u.lang);
        }
        setSyncState("local");
      }

      if (!cancelled) {
        commit(working);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commit]);

  // ── online / offline ────────────────────────────────────────────────────
  useEffect(() => {
    const set = () => setOnline(navigator.onLine);
    set();
    window.addEventListener("online", set);
    window.addEventListener("offline", set);
    return () => {
      window.removeEventListener("online", set);
      window.removeEventListener("offline", set);
    };
  }, []);

  // Flush unsynced inspections when we regain connectivity (server mode).
  useEffect(() => {
    if (mode !== "server" || !online || !user) return;
    const pending = dbRef.current.inspections.filter((i) => i.synced === false);
    if (!pending.length) return;
    (async () => {
      let ok = true;
      for (const insp of pending) {
        try {
          await pushInspection(insp);
        } catch {
          ok = false;
        }
      }
      if (ok) {
        const next = {
          ...dbRef.current,
          inspections: dbRef.current.inspections.map((i) =>
            i.synced === false ? { ...i, synced: true } : i
          ),
        };
        commit(next);
        setSyncState("synced");
      }
    })();
  }, [online, mode, user, commit]);

  // ── actions ────────────────────────────────────────────────────────────────
  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      commit({ ...dbRef.current, settings: { ...dbRef.current.settings, lang: l } });
    },
    [commit]
  );

  const toggleRunningTotal = useCallback(() => {
    commit({
      ...dbRef.current,
      settings: {
        ...dbRef.current.settings,
        showRunningTotal: !dbRef.current.settings.showRunningTotal,
      },
    });
  }, [commit]);

  const login = useCallback(
    async (userId: string, password?: string) => {
      if (mode === "server") {
        const u = await apiLogin(userId, password || "");
        setUser(u);
        setLangState(u.lang);
        const state = await fetchState();
        commit({
          ...dbRef.current,
          users: state.users,
          catalog: state.catalog,
          customers: state.customers,
          inspections: mergeInspections(dbRef.current.inspections, state.inspections),
          session: u.id,
          settings: { ...dbRef.current.settings, lang: u.lang },
        });
        setSyncState("synced");
      } else {
        const u = dbRef.current.users.find((x) => x.id === userId);
        if (!u) throw new Error("unknown user");
        setUser(u);
        setLangState(u.lang);
        commit({
          ...dbRef.current,
          session: u.id,
          settings: { ...dbRef.current.settings, lang: u.lang },
        });
      }
    },
    [mode, commit]
  );

  const logout = useCallback(async () => {
    if (mode === "server") {
      try {
        await apiLogout();
      } catch {
        /* ignore */
      }
    }
    setUser(null);
    commit({ ...dbRef.current, session: null });
  }, [mode, commit]);

  const upsertInspection = useCallback(
    (insp: Inspection) => {
      const stamped: Inspection = { ...insp, updatedAt: Date.now(), synced: false };
      const exists = dbRef.current.inspections.some((i) => i.id === stamped.id);
      const inspections = exists
        ? dbRef.current.inspections.map((i) => (i.id === stamped.id ? stamped : i))
        : [stamped, ...dbRef.current.inspections];
      commit({ ...dbRef.current, inspections });

      if (mode === "server" && navigator.onLine) {
        setSyncState("pending");
        pushInspection(stamped)
          .then(() => {
            const next = {
              ...dbRef.current,
              inspections: dbRef.current.inspections.map((i) =>
                i.id === stamped.id ? { ...i, synced: true } : i
              ),
            };
            commit(next);
            setSyncState("synced");
          })
          .catch(() => setSyncState("offline"));
      }
    },
    [mode, commit]
  );

  const removeInspection = useCallback(
    (id: string) => {
      commit({
        ...dbRef.current,
        inspections: dbRef.current.inspections.filter((i) => i.id !== id),
      });
    },
    [commit]
  );

  const saveCatalog = useCallback(
    async (catalog: Catalog) => {
      commit({ ...dbRef.current, catalog });
      if (mode === "server") await pushCatalog(catalog);
    },
    [mode, commit]
  );

  const addCustomer = useCallback(
    (c: Customer) => {
      commit({ ...dbRef.current, customers: [c, ...dbRef.current.customers] });
      if (mode === "server" && navigator.onLine) void pushCustomer(c).catch(() => {});
    },
    [mode, commit]
  );

  const resetLocal = useCallback(async () => {
    await idbReset();
    const fresh = freshDatabase();
    commit(fresh);
    setUser(null);
    setLoginUsers(fresh.users);
  }, [commit]);

  const value: StoreValue = {
    ready,
    mode,
    online,
    syncState,
    db,
    user,
    lang,
    loginUsers,
    setLang,
    toggleRunningTotal,
    login,
    logout,
    upsertInspection,
    removeInspection,
    saveCatalog,
    addCustomer,
    resetLocal,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
