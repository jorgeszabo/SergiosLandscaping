"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";

export function Login() {
  const { loginUsers, mode, lang, setLang, login } = useStore();
  const { t } = useI18n();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!userId) return;
    setBusy(true);
    setError("");
    try {
      await login(userId, password);
    } catch {
      setError(t("wrongPassword"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "radial-gradient(1200px 500px at 50% -10%, var(--navy-50), var(--surface-page))",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sergio's Landscaping"
            style={{ height: 92, width: "auto", display: "inline-block" }}
          />
          <div
            className="eyebrow"
            style={{
              marginTop: 10,
              color: "var(--brand-accent)",
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            {t("moduleName")}
          </div>
        </div>

        <div className="card" style={{ padding: 22, boxShadow: "var(--shadow-md)" }}>
          <h1 style={{ fontSize: 21, margin: "0 0 2px", textAlign: "center" }}>{t("signIn")}</h1>
          <p className="sub" style={{ textAlign: "center", marginBottom: 16 }}>
            {t("tagline")}
          </p>

          <label className="f" style={{ marginTop: 0 }}>
            {t("selectUser")}
          </label>
          <select className="t" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">—</option>
            {loginUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} · {t("role_" + u.role)}
              </option>
            ))}
          </select>

          <label className="f">{t("password")}</label>
          <input
            className="t"
            type="password"
            value={password}
            placeholder={mode === "server" ? "••••••••" : t("demoNote")}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {error && (
            <p className="sub" style={{ color: "var(--danger)", marginTop: 10, marginBottom: 0 }}>
              {error}
            </p>
          )}

          <button
            className="btn pri block"
            style={{ marginTop: 16 }}
            disabled={busy || !userId}
            onClick={submit}
          >
            {t("signIn")}
          </button>

          {mode === "local" && (
            <p className="sub" style={{ textAlign: "center", marginTop: 12, marginBottom: 0, fontSize: 12.5 }}>
              {t("demoNote")}
            </p>
          )}

          <div className="row" style={{ justifyContent: "center", marginTop: 16, gap: 12 }}>
            <button className={`chip ${lang === "es" ? "on" : ""}`} onClick={() => setLang("es")}>
              Español
            </button>
            <button className={`chip ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
