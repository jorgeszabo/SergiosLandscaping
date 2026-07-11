"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import type { Lang, Permissions, Role, User } from "@/lib/data/types";

const ROLES: Role[] = ["field", "lead", "office", "admin"];
const PERM_KEYS: (keyof Permissions)[] = ["seePrices", "setPrice", "editCatalog", "approve"];
const PERM_LABEL: Record<keyof Permissions, string> = {
  seePrices: "permSeePrices",
  setPrice: "permSetPrice",
  editCatalog: "permEditCatalog",
  approve: "permApprove",
};

const DEFAULT_PERMS: Record<Role, Permissions> = {
  field: { seePrices: false, setPrice: false, editCatalog: false, approve: false },
  lead: { seePrices: true, setPrice: false, editCatalog: false, approve: false },
  office: { seePrices: true, setPrice: true, editCatalog: false, approve: false },
  admin: { seePrices: true, setPrice: true, editCatalog: true, approve: true },
};

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "user";

const WORDS = ["riego", "jardin", "agua", "verde", "campo", "zona", "valle", "pino"];
const genPassword = () =>
  `${WORDS[Math.floor(Math.random() * WORDS.length)]}-${Math.floor(1000 + Math.random() * 9000)}`;

export function Team() {
  const { db, user, saveUser, deleteUser } = useStore();
  const { t } = useI18n();
  const toast = useToast();

  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("field");
  const [lang, setLang] = useState<Lang>("es");
  const [perms, setPerms] = useState<Permissions>(DEFAULT_PERMS.field);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const startNew = () => {
    setEditing("new");
    setName("");
    setUsername("");
    setRole("field");
    setLang("es");
    setPerms(DEFAULT_PERMS.field);
    setPassword("");
  };
  const startEdit = (u: User) => {
    setEditing(u);
    setName(u.name);
    setUsername(u.id);
    setRole(u.role);
    setLang(u.lang);
    setPerms(u.permissions);
    setPassword("");
  };
  const onRole = (r: Role) => {
    setRole(r);
    if (editing === "new") setPerms(DEFAULT_PERMS[r]); // presets for new users
  };

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const id = editing === "new" ? slug(username || name) : (editing as User).id;
      const u: User = { id, name: name.trim(), role, lang, permissions: perms };
      await saveUser(u, password || undefined);
      toast(editing === "new" ? t("userAdded") : t("userSaved"));
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: User) => {
    if (u.id === user.id) return;
    if (!window.confirm(t("confirmDeleteUser"))) return;
    await deleteUser(u.id);
    toast(t("userSaved"));
  };

  if (editing) {
    const isNew = editing === "new";
    return (
      <div style={{ maxWidth: 560 }}>
        <button className="backlink" onClick={() => setEditing(null)}>
          ‹ {t("back")}
        </button>
        <h1>{isNew ? t("addUser") : t("editUser")}</h1>

        <div className="card stack">
          <div>
            <label className="f" style={{ marginTop: 0 }}>{t("fullName")}</label>
            <input className="t" value={name} onChange={(e) => setName(e.target.value)} placeholder="Antonio" />
          </div>
          <div className="grid2">
            <div>
              <label className="f" style={{ marginTop: 0 }}>{t("username")}</label>
              <input
                className="t"
                value={isNew ? username : (editing as User).id}
                disabled={!isNew}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="antonio"
              />
            </div>
            <div>
              <label className="f" style={{ marginTop: 0 }}>{t("langPref")}</label>
              <select className="t" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div>
            <label className="f">{t("roleL")}</label>
            <div className="pillbar">
              {ROLES.map((r) => (
                <button key={r} className={`chip ${role === r ? "on" : ""}`} onClick={() => onRole(r)}>
                  {t("role_" + r)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="f">{t("permissions")}</label>
            <div className="stack">
              {PERM_KEYS.map((k) => (
                <label
                  key={k}
                  className="row"
                  style={{ gap: 10, cursor: "pointer", padding: "4px 0" }}
                >
                  <input
                    type="checkbox"
                    checked={perms[k]}
                    onChange={(e) => setPerms((p) => ({ ...p, [k]: e.target.checked }))}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, color: "var(--text-body)" }}>{t(PERM_LABEL[k])}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="f">{t("newPassword")}</label>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="t"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isNew ? "" : "••••••••"}
              />
              <button type="button" className="btn sm" style={{ whiteSpace: "nowrap" }} onClick={() => setPassword(genPassword())}>
                {t("generate")}
              </button>
              {password && (
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => navigator.clipboard?.writeText(password).then(() => toast(t("copied")))}
                >
                  {t("copyPw")}
                </button>
              )}
            </div>
            <div className="note">
              {isNew ? t("pwSetHint") : t("pwKeepHint")} {t("pwNote")}
            </div>
          </div>
        </div>

        <button className="btn pri block" disabled={busy || !name.trim()} onClick={save}>
          {t("saveUser")}
        </button>
        {!isNew && (editing as User).id !== user.id && (
          <button
            className="btn danger block ghost"
            style={{ marginTop: 8 }}
            onClick={() => remove(editing as User)}
          >
            {t("deleteUser")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <p className="sub" style={{ margin: 0 }}>{t("adminOnly")}</p>
        <button className="btn pri" onClick={startNew}>＋ {t("addUser")}</button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="list">
          {db.users.map((u) => {
            const keys = PERM_KEYS.filter((k) => u.permissions[k]).map((k) => t(PERM_LABEL[k]).split(" ")[0]);
            return (
              <button key={u.id} className="item" onClick={() => startEdit(u)}>
                <div className="g">
                  <div className="n">
                    {u.name}{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}>@{u.id}</span>
                  </div>
                  <div className="m">{keys.join(" · ") || "—"}</div>
                </div>
                <span className={`badge ${u.role === "admin" ? "navy" : "gray"}`}>{t("role_" + u.role)}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
