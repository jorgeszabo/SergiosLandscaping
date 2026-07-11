"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "./nav";
import { screenTitle } from "./titles";
import { HelpButton } from "./help";
import { ThemePicker } from "./ThemePicker";
import { Sheet } from "@/components/Sheet";
import { uid } from "@/lib/data/id";
import type { Inspection } from "@/lib/data/types";
import {
  IconHome, IconInbox, IconGrid, IconUsers, IconPlus, IconMenu, IconGlobe,
  IconLogout, IconBook,
} from "@/components/icons";

export function MobileShell({ children }: { children: React.ReactNode }) {
  const { user, lang, setLang, logout, upsertInspection } = useStore();
  const { view, navigate } = useNav();
  const { t } = useI18n();
  const [more, setMore] = useState(false);
  if (!user) return null;

  const isOffice = user.role === "office" || user.role === "admin";
  const isAdmin = !!user.permissions.editCatalog;

  const startNew = () => {
    const insp: Inspection = {
      id: uid(), customer: "", address: "", city: "",
      tech: user.name, techId: user.id,
      date: new Date().toISOString().slice(0, 10), status: "draft",
      snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
      zones: [], lines: [],
    };
    upsertInspection(insp);
    navigate({ name: "newJob", inspId: insp.id });
  };

  const homeActive = ["home", "newJob", "snapshot", "zones", "zone", "addIssue"].includes(view.name);
  const queueActive = ["office", "review", "print"].includes(view.name);

  return (
    <div className="mshell">
      <header className="mtopbar noprint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mlogo" src="/logo.png" alt="Sergio's Landscaping" />
        <div className="mtitle">{screenTitle(view.name, t, isOffice)}</div>
        <HelpButton view={view.name} />
        <button className="iconbtn" aria-label="Language" onClick={() => setLang(lang === "es" ? "en" : "es")}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{lang === "es" ? "ES" : "EN"}</span>
        </button>
      </header>

      <main className="mmain">{children}</main>

      <nav className="tabbar noprint">
        <button className={`tab ${homeActive ? "on" : ""}`} onClick={() => navigate({ name: "home" })}>
          <IconHome size={22} />
          <span>{t("dashboard")}</span>
        </button>
        {isOffice && (
          <button className={`tab ${queueActive ? "on" : ""}`} onClick={() => navigate({ name: "office" })}>
            <IconInbox size={22} />
            <span>{t("navQueue")}</span>
          </button>
        )}
        <button className="tab fab" onClick={startNew} aria-label={t("newInsp")}>
          <span className="fabc"><IconPlus size={24} /></span>
          <span>{t("newInsp")}</span>
        </button>
        <button className="tab" onClick={() => setMore(true)}>
          <IconMenu size={22} />
          <span>{t("more") || "More"}</span>
        </button>
      </nav>

      {more && (
        <Sheet onClose={() => setMore(false)}>
          {isAdmin && (
            <button onClick={() => { setMore(false); navigate({ name: "catalog", tab: "parts" }); }}>
              <span style={{ display: "inline-flex", verticalAlign: "-4px", marginRight: 10 }}><IconGrid size={18} /></span>
              {t("catalog")}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => { setMore(false); navigate({ name: "team" }); }}>
              <span style={{ display: "inline-flex", verticalAlign: "-4px", marginRight: 10 }}><IconUsers size={18} /></span>
              {t("manageTeam")}
            </button>
          )}
          <button onClick={() => { setMore(false); navigate({ name: "guide" }); }}>
            <span style={{ display: "inline-flex", verticalAlign: "-4px", marginRight: 10 }}><IconBook size={18} /></span>
            {t("userGuide")}
          </button>
          <button onClick={() => { setLang(lang === "es" ? "en" : "es"); }}>
            <span style={{ display: "inline-flex", verticalAlign: "-4px", marginRight: 10 }}><IconGlobe size={18} /></span>
            {lang === "es" ? "English" : "Español"}
          </button>
          <div style={{ padding: "8px 14px 6px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              {t("theme")}
            </div>
            <ThemePicker />
          </div>
          <button className="dz" onClick={() => { setMore(false); void logout(); }}>
            <span style={{ display: "inline-flex", verticalAlign: "-4px", marginRight: 10 }}><IconLogout size={18} /></span>
            {t("logout")}
          </button>
          <button style={{ color: "var(--text-muted)" }} onClick={() => setMore(false)}>{t("cancel")}</button>
        </Sheet>
      )}
    </div>
  );
}
