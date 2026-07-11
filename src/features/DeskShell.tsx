"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav, type ViewName } from "./nav";
import { screenTitle } from "./titles";
import { HelpButton } from "./help";
import { ThemePicker } from "./ThemePicker";
import { uid } from "@/lib/data/id";
import type { Inspection } from "@/lib/data/types";
import {
  IconHome, IconInbox, IconGrid, IconUsers, IconBook, IconPlus, IconGlobe, IconLogout, IconBriefcase,
} from "@/components/icons";

/* Desktop operations shell for office/admin — sidebar + topbar, from the
   company Design System app kit. Field techs / phones use the mobile shell. */
export function DeskShell({ children }: { children: React.ReactNode }) {
  const { user, lang, setLang, logout, beginDraft } = useStore();
  const { t } = useI18n();
  const { view, navigate } = useNav();
  if (!user) return null;

  const isAdmin = !!user.permissions.editCatalog;

  const nav: { id: ViewName; label: string; Icon: typeof IconHome; show: boolean }[] = [
    { id: "home", label: t("dashboard"), Icon: IconHome, show: true },
    { id: "office", label: t("navQueue"), Icon: IconInbox, show: true },
    { id: "customers", label: t("navCustomers"), Icon: IconBriefcase, show: true },
    { id: "catalog", label: t("navCatalog"), Icon: IconGrid, show: isAdmin },
    { id: "team", label: t("navTeam"), Icon: IconUsers, show: isAdmin },
    { id: "guide", label: t("userGuide"), Icon: IconBook, show: true },
  ];

  const startNew = () => {
    const insp: Inspection = {
      id: uid(), customer: "", address: "", city: "",
      tech: user.name, techId: user.id,
      date: new Date().toISOString().slice(0, 10), status: "draft",
      snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
      zones: [], lines: [],
    };
    beginDraft(insp);
    navigate({ name: "newJob", inspId: insp.id });
  };

  const active = (id: ViewName) =>
    id === view.name || (id === "office" && ["review", "print"].includes(view.name));

  return (
    <div className="deskshell">
      <aside className="sidebar noprint">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sergio's Landscaping" />
          <div className="eyebrow" style={{ color: "var(--brand-accent)", fontSize: 11, marginTop: 4 }}>
            {t("moduleName")}
          </div>
        </div>
        <button className="btn pri block" style={{ marginBottom: 14 }} onClick={startNew}>
          <IconPlus size={18} /> {t("newInsp")}
        </button>
        <nav>
          {nav.filter((n) => n.show).map((n) => (
            <button
              key={n.id}
              className={active(n.id) ? "on" : ""}
              onClick={() => navigate({ name: n.id, ...(n.id === "catalog" ? { tab: "parts" } : {}) })}
            >
              <span className="ico"><n.Icon size={18} /></span>
              <span style={{ flex: 1 }}>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="whoami">
          <div className="n">{user.name}</div>
          <div className="r">{t("role_" + user.role)}</div>
          <button
            className="btn ghost sm block"
            style={{ marginTop: 8, color: "var(--text-muted)" }}
            onClick={() => void logout()}
          >
            <IconLogout size={16} /> {t("logout")}
          </button>
        </div>
      </aside>

      <div className="deskmain">
        <header className="topbar noprint">
          <h1>{screenTitle(view.name, t, true)}</h1>
          <div className="row" style={{ gap: 6 }}>
            <ThemePicker compact />
            <HelpButton view={view.name} />
            <button
              className="chip"
              aria-label="Language"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              title={t("langPref")}
              style={{ gap: 6 }}
            >
              <IconGlobe size={16} />
              {lang === "es" ? "ES" : "EN"}
            </button>
          </div>
        </header>
        <div className="deskbody">{children}</div>
      </div>
    </div>
  );
}
