"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav, type ViewName } from "./nav";
import { uid } from "@/lib/data/id";
import type { Inspection } from "@/lib/data/types";

/* Desktop operations shell for office/admin — sidebar + topbar, from the
   company Design System app kit. Field techs use the mobile shell instead. */
export function DeskShell({ children }: { children: React.ReactNode }) {
  const { user, lang, setLang, logout, upsertInspection } = useStore();
  const { t } = useI18n();
  const { view, navigate } = useNav();
  if (!user) return null;

  const isAdmin = user.permissions.editCatalog;

  const nav: { id: ViewName; label: string; ico: string; show: boolean }[] = [
    { id: "office", label: t("navQueue"), ico: "🗂", show: true },
    { id: "catalog", label: t("navCatalog"), ico: "⚙︎", show: !!isAdmin },
    { id: "team", label: t("navTeam"), ico: "👥", show: !!isAdmin },
  ];

  const titleFor = (v: ViewName): string => {
    switch (v) {
      case "office": return t("queue");
      case "catalog": return t("catTitle");
      case "team": return t("manageTeam");
      case "review": return t("reviewApprove");
      case "print": return t("proposal");
      default: return t("inspections");
    }
  };

  const startNew = () => {
    const insp: Inspection = {
      id: uid(),
      customer: "", address: "", city: "",
      tech: user.name, techId: user.id,
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
      zones: [], lines: [],
    };
    upsertInspection(insp);
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
          ＋ {t("newInsp")}
        </button>
        <nav>
          {nav.filter((n) => n.show).map((n) => (
            <button
              key={n.id}
              className={active(n.id) ? "on" : ""}
              onClick={() => navigate({ name: n.id, ...(n.id === "catalog" ? { tab: "parts" } : {}) })}
            >
              <span className="ico">{n.ico}</span>
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
            {t("logout")}
          </button>
        </div>
      </aside>

      <div className="deskmain">
        <header className="topbar noprint">
          <h1>{titleFor(view.name)}</h1>
          <div className="row" style={{ gap: 8 }}>
            <button className="chip" onClick={() => setLang(lang === "es" ? "en" : "es")}>
              {lang === "es" ? "ES" : "EN"}
            </button>
          </div>
        </header>
        <div className="deskbody">{children}</div>
      </div>
    </div>
  );
}
