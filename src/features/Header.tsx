"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "./nav";
import { Sheet } from "@/components/Sheet";

export function Header() {
  const { user, lang, setLang, logout } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  const [menu, setMenu] = useState(false);

  const isOffice = user?.role === "office" || user?.role === "admin";
  const isAdmin = user?.permissions.editCatalog;

  return (
    <>
      <header className="bar noprint">
        <div className="brand">
          <span>💧</span>
          <span>{t("appName")}</span>
        </div>
        <button
          className="drop"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          aria-label="Language"
        >
          {lang === "es" ? "ES" : "EN"}
        </button>
        <button className="drop" onClick={() => setMenu(true)} aria-label="Menu">
          ☰
        </button>
      </header>

      {menu && (
        <Sheet onClose={() => setMenu(false)}>
          <button
            onClick={() => {
              setMenu(false);
              navigate({ name: "home" });
            }}
          >
            🏠 {t("inspections")}
          </button>
          {isOffice && (
            <button
              onClick={() => {
                setMenu(false);
                navigate({ name: "office" });
              }}
            >
              🗂️ {t("openOffice")}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setMenu(false);
                navigate({ name: "catalog", tab: "parts" });
              }}
            >
              ⚙︎ {t("catalog")}
            </button>
          )}
          <button
            className="dz"
            onClick={() => {
              setMenu(false);
              void logout();
            }}
          >
            {t("logout")}
          </button>
          <button style={{ color: "var(--muted)" }} onClick={() => setMenu(false)}>
            {t("cancel")}
          </button>
        </Sheet>
      )}
    </>
  );
}
