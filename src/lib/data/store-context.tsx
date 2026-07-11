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
  Theme,
  User,
} from "./types";
import { freshDatabase } from "./seed";
import { demoCustomers, demoInspections } from "./demo";
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
  saveUserApi,
  deleteUserApi,
  deleteCustomerApi,
  deleteInspectionApi,
  ConflictError,
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
  theme: Theme;
  setTheme: (th: Theme) => void;
  toggleRunningTotal: () => void;
  login: (userId: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  /** A new inspection held in memory only — not persisted until it gains
      real data (via upsertInspection). Prevents empty "trash" drafts. */
  pendingDraft: Inspection | null;
  beginDraft: (insp: Inspection) => void;
  discardDraft: () => void;
  upsertInspection: (insp: Inspection) => void;
  removeInspection: (id: string) => Promise<void>;
  saveCatalog: (catalog: Catalog) => Promise<void>;
  addCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => Promise<void>;
  saveUser: (user: User, password?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  /** Training mode: an isolated sandbox seeded with sample data. While on,
      nothing is written to the real database (server or device) and the real
      data is hidden; turning it off restores the real data untouched. */
  training: boolean;
  setTraining: (on: boolean) => void;
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
  const [theme, setThemeState] = useState<Theme>("light");
  const [loginUsers, setLoginUsers] = useState<User[]>([]);
  const [pendingDraft, setPendingDraft] = useState<Inspection | null>(null);
  const [training, setTrainingState] = useState(false);
  const dbRef = useRef(db);
  dbRef.current = db;
  const pendingRef = useRef(pendingDraft);
  pendingRef.current = pendingDraft;
  // While training, mutations stay in memory only. A ref so callbacks always
  // read the current value without being re-created.
  const trainingRef = useRef(training);
  trainingRef.current = training;
  // The real database, stashed while training so it can be restored intact.
  const realSnapshot = useRef<Database | null>(null);
  // Guards against overlapping reconnect-flush loops.
  const flushingRef = useRef(false);

  const commit = useCallback((next: Database) => {
    dbRef.current = next;
    setDb(next);
    // Training-mode changes never touch the on-device store.
    if (!trainingRef.current) void idbSave(next);
  }, []);

  // ── boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await idbLoad();
      if (cancelled) return;
      let working = local;
      setLangState(local.settings.lang || "es");
      setThemeState(local.settings.theme || "light");

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
        // In local/demo mode always start at the login screen (don't
        // auto-restore a prior session) so the branded entry point is shown.
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

  // Pull the server's copies, dropping the given local ids (server wins on
  // conflict), and re-merge.
  const reconcileFromServer = useCallback(
    async (dropIds: string[]) => {
      try {
        const state = await fetchState();
        const drop = new Set(dropIds);
        const local = dbRef.current.inspections.filter((i) => !drop.has(i.id));
        commit({
          ...dbRef.current,
          inspections: mergeInspections(local, state.inspections),
        });
        setSyncState("synced");
      } catch {
        setSyncState("offline");
      }
    },
    [commit]
  );

  // Flush unsynced inspections when we regain connectivity (server mode).
  useEffect(() => {
    // Never flush while training (sandbox writes must not reach the server),
    // and never run two flush loops at once.
    if (mode !== "server" || !online || !user || trainingRef.current) return;
    if (flushingRef.current) return;
    const pending = dbRef.current.inspections.filter((i) => i.synced === false);
    if (!pending.length) return;
    flushingRef.current = true;
    (async () => {
      try {
        const startedAt = new Map(pending.map((i) => [i.id, i.updatedAt]));
        const pushedOk: string[] = [];
        const conflicts: string[] = [];
        for (const insp of pending) {
          try {
            await pushInspection(insp);
            pushedOk.push(insp.id);
          } catch (e) {
            if (e instanceof ConflictError) conflicts.push(insp.id);
          }
        }
        // Mark synced ONLY the records that pushed this round and haven't been
        // edited again since (updatedAt unchanged) — so a concurrent edit isn't
        // silently treated as synced, and partial success is persisted.
        if (pushedOk.length) {
          const ok = new Set(pushedOk);
          commit({
            ...dbRef.current,
            inspections: dbRef.current.inspections.map((i) =>
              ok.has(i.id) && i.updatedAt === startedAt.get(i.id) ? { ...i, synced: true } : i
            ),
          });
        }
        if (conflicts.length) await reconcileFromServer(conflicts);
        setSyncState(conflicts.length ? "pending" : "synced");
      } finally {
        flushingRef.current = false;
      }
    })();
  }, [online, mode, user, commit, reconcileFromServer]);

  // ── actions ────────────────────────────────────────────────────────────────
  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      commit({ ...dbRef.current, settings: { ...dbRef.current.settings, lang: l } });
    },
    [commit]
  );

  const setTheme = useCallback(
    (th: Theme) => {
      setThemeState(th);
      commit({ ...dbRef.current, settings: { ...dbRef.current.settings, theme: th } });
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
        // Keep the language chosen on the login screen — don't override it with
        // the account's stored preference.
        const state = await fetchState();
        commit({
          ...dbRef.current,
          users: state.users,
          catalog: state.catalog,
          customers: state.customers,
          inspections: mergeInspections(dbRef.current.inspections, state.inspections),
          session: u.id,
        });
        setSyncState("synced");
      } else {
        const u = dbRef.current.users.find((x) => x.id === userId);
        if (!u) throw new Error("unknown user");
        setUser(u);
        commit({ ...dbRef.current, session: u.id });
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

  // Start a new inspection without persisting it. It only becomes a real
  // (saved) record once upsertInspection runs with actual data — so backing
  // out of a blank New-inspection flow leaves no empty draft behind.
  const beginDraft = useCallback((insp: Inspection) => {
    setPendingDraft(insp);
  }, []);

  const discardDraft = useCallback(() => {
    setPendingDraft(null);
  }, []);

  const upsertInspection = useCallback(
    (insp: Inspection) => {
      // First real save promotes the in-memory draft to a stored inspection.
      if (pendingRef.current?.id === insp.id) setPendingDraft(null);
      const stamped: Inspection = { ...insp, updatedAt: Date.now(), synced: false };
      const exists = dbRef.current.inspections.some((i) => i.id === stamped.id);
      const inspections = exists
        ? dbRef.current.inspections.map((i) => (i.id === stamped.id ? stamped : i))
        : [stamped, ...dbRef.current.inspections];
      commit({ ...dbRef.current, inspections });

      if (mode === "server" && navigator.onLine && !trainingRef.current) {
        setSyncState("pending");
        pushInspection(stamped)
          .then(() => {
            // Only clear the unsynced flag if this exact version is still the
            // current one — a newer in-flight edit must stay unsynced.
            const next = {
              ...dbRef.current,
              inspections: dbRef.current.inspections.map((i) =>
                i.id === stamped.id && i.updatedAt === stamped.updatedAt ? { ...i, synced: true } : i
              ),
            };
            commit(next);
            setSyncState("synced");
          })
          .catch((err) => {
            if (err instanceof ConflictError) void reconcileFromServer([stamped.id]);
            else setSyncState("offline");
          });
      }
    },
    [mode, commit, reconcileFromServer]
  );

  const removeInspection = useCallback(
    async (id: string) => {
      if (pendingRef.current?.id === id) setPendingDraft(null);
      commit({
        ...dbRef.current,
        inspections: dbRef.current.inspections.filter((i) => i.id !== id),
      });
      if (mode === "server" && navigator.onLine && !trainingRef.current) await deleteInspectionApi(id);
    },
    [mode, commit]
  );

  const saveCatalog = useCallback(
    async (catalog: Catalog) => {
      commit({ ...dbRef.current, catalog });
      if (mode === "server" && !trainingRef.current) await pushCatalog(catalog);
    },
    [mode, commit]
  );

  const addCustomer = useCallback(
    (c: Customer) => {
      commit({ ...dbRef.current, customers: [c, ...dbRef.current.customers] });
      if (mode === "server" && navigator.onLine && !trainingRef.current) void pushCustomer(c).catch(() => {});
    },
    [mode, commit]
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      commit({
        ...dbRef.current,
        customers: dbRef.current.customers.filter((c) => c.id !== id),
      });
      if (mode === "server" && navigator.onLine && !trainingRef.current) await deleteCustomerApi(id);
    },
    [mode, commit]
  );

  const saveUser = useCallback(
    async (user: User, password?: string) => {
      const exists = dbRef.current.users.some((u) => u.id === user.id);
      const users = exists
        ? dbRef.current.users.map((u) => (u.id === user.id ? { ...u, ...user } : u))
        : [...dbRef.current.users, user];
      commit({ ...dbRef.current, users });
      setLoginUsers(users);
      if (mode === "server" && !trainingRef.current) await saveUserApi(user, password);
    },
    [mode, commit]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      const users = dbRef.current.users.filter((u) => u.id !== id);
      commit({ ...dbRef.current, users });
      setLoginUsers(users);
      if (mode === "server" && !trainingRef.current) await deleteUserApi(id);
    },
    [mode, commit]
  );

  // Enter/leave the isolated training sandbox. On enter, stash the real db and
  // swap in a sample dataset (real users + catalog so login/pricing still work,
  // demo customers + inspections to play with). On leave, restore the real db.
  const setTraining = useCallback((on: boolean) => {
    if (on === trainingRef.current) return;
    if (on) {
      realSnapshot.current = dbRef.current;
      trainingRef.current = true;
      setTrainingState(true);
      const demo: Database = {
        ...dbRef.current,
        customers: demoCustomers(),
        inspections: demoInspections(Date.now()),
        session: dbRef.current.session,
      };
      dbRef.current = demo;
      setDb(demo);
      setPendingDraft(null);
    } else {
      const real = realSnapshot.current || freshDatabase();
      trainingRef.current = false;
      setTrainingState(false);
      realSnapshot.current = null;
      dbRef.current = real;
      setDb(real);
      setPendingDraft(null);
    }
  }, []);

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
    theme,
    setTheme,
    toggleRunningTotal,
    login,
    logout,
    pendingDraft,
    beginDraft,
    discardDraft,
    upsertInspection,
    removeInspection,
    saveCatalog,
    addCustomer,
    deleteCustomer,
    saveUser,
    deleteUser,
    training,
    setTraining,
    resetLocal,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
