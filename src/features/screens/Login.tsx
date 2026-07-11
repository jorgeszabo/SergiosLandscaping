"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/lib/data/types";

export function Login() {
  const { loginUsers, mode, lang, setLang, login } = useStore();
  const { t } = useI18n();
  const [selected, setSelected] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (u: User) => {
    setError("");
    if (mode === "server") {
      setSelected(u);
      return;
    }
    await login(u.id);
  };

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await login(selected.id, password);
    } catch {
      setError(t("login") + " — " + (lang === "es" ? "contraseña incorrecta" : "wrong password"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app">
      <main style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: 6, fontSize: 40 }}>💧</div>
        <h1 style={{ textAlign: "center" }}>{t("appName")}</h1>
        <p className="sub" style={{ textAlign: "center" }}>
          {t("tagline")}
        </p>

        <div className="card" style={{ marginTop: 10 }}>
          {!selected ? (
            <>
              <label className="f">{t("who")}</label>
              <div className="stack">
                {loginUsers.map((u) => (
                  <button
                    key={u.id}
                    className="btn block"
                    style={{ justifyContent: "space-between" }}
                    onClick={() => pick(u)}
                  >
                    <span>{u.name}</span>
                    <span className={`badge ${u.role === "admin" ? "done" : "gray"}`}>
                      {t("role_" + u.role)}
                    </span>
                  </button>
                ))}
                {loginUsers.length === 0 && (
                  <div className="empty">
                    <div className="big">{t("appName")}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <label className="f">
                {selected.name} · {t("role_" + selected.role)}
              </label>
              <input
                className="t"
                type="password"
                autoFocus
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              {error && (
                <p className="sub" style={{ color: "var(--danger)", marginTop: 8 }}>
                  {error}
                </p>
              )}
              <button className="btn pri block" style={{ marginTop: 12 }} disabled={busy} onClick={submit}>
                {t("cont")}
              </button>
              <button
                className="btn block ghost"
                style={{ marginTop: 8, color: "var(--muted)" }}
                onClick={() => {
                  setSelected(null);
                  setPassword("");
                  setError("");
                }}
              >
                {t("back")}
              </button>
            </>
          )}

          <div className="row" style={{ justifyContent: "center", marginTop: 14, gap: 14 }}>
            <button className={`chip ${lang === "es" ? "on" : ""}`} onClick={() => setLang("es")}>
              Español
            </button>
            <button className={`chip ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>
              English
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
