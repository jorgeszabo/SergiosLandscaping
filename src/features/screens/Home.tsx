"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { SyncStatus } from "@/components/SyncStatus";
import { inspectionTotals, money } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
import { IconPlus, IconInbox, IconClipboard } from "@/components/icons";
import type { Inspection, InspectionStatus } from "@/lib/data/types";

const badgeTone = (s: InspectionStatus): string => {
  if (s === "completed") return "done";
  if (s === "approved" || s === "in_progress") return "navy";
  if (s === "returned") return "red";
  return "new";
};

export function Home() {
  const { db, user, upsertInspection } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  if (!user) return null;

  const isOffice = user.role === "office" || user.role === "admin";
  const canSee = user.permissions.seePrices;
  const count = (fn: (s: InspectionStatus) => boolean) =>
    db.inspections.filter((i) => fn(i.status)).length;

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

  const openInsp = (insp: Inspection) => {
    if (isOffice) navigate({ name: "review", inspId: insp.id });
    else navigate({ name: insp.zones.length ? "zones" : "newJob", inspId: insp.id });
  };

  const stats = isOffice
    ? [
        { l: t("needsReview"), v: count((s) => s === "submitted" || s === "under_review" || s === "returned") },
        { l: t("workOrders"), v: count((s) => s === "approved" || s === "in_progress") },
        { l: t("st_completed"), v: count((s) => s === "completed") },
        { l: t("inspections"), v: db.inspections.length },
      ]
    : [
        { l: t("st_draft"), v: count((s) => s === "draft") },
        { l: t("st_submitted"), v: count((s) => s === "submitted" || s === "under_review") },
        { l: t("st_approved"), v: count((s) => s === "approved" || s === "in_progress") },
        { l: t("inspections"), v: db.inspections.length },
      ];

  const recent = [...db.inspections]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, isOffice ? 8 : 6);

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <h1 style={{ margin: 0 }}>{t("goodDay")}, {user.name}</h1>
          <p className="sub" style={{ margin: 0 }}>{t("role_" + user.role)}</p>
        </div>
        <SyncStatus />
      </div>

      <div className="statgrid" style={{ marginTop: 16 }}>
        {stats.map((s, i) => (
          <div className="statcard" key={i}>
            <div className="l">{s.l}</div>
            <div className="v">{s.v}</div>
          </div>
        ))}
      </div>

      <h2>{t("quickActions")}</h2>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <button className="btn pri" onClick={startNew} style={{ flex: "1 1 160px" }}>
          <IconPlus size={18} /> {t("newInsp")}
        </button>
        {isOffice && (
          <button className="btn" onClick={() => navigate({ name: "office" })} style={{ flex: "1 1 160px" }}>
            <IconInbox size={18} /> {t("openOffice")}
          </button>
        )}
      </div>

      <h2>{isOffice ? t("needsAttention") : t("recent")}</h2>
      <div className="card">
        <div className="list">
          {recent.length === 0 && (
            <div className="empty">
              <div className="big">{t("nothingHere")}</div>
              <div>{t("tapNew")}</div>
            </div>
          )}
          {recent.map((insp) => {
            const tot = inspectionTotals(insp, db.catalog);
            const issues = insp.lines.filter((l) => l.kind === "issue").length;
            return (
              <button key={insp.id} className="item" onClick={() => openInsp(insp)}>
                <span
                  style={{
                    width: 34, height: 34, borderRadius: 8, flex: "none",
                    background: "var(--brand-primary-soft)", color: "var(--brand-primary)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <IconClipboard size={18} />
                </span>
                <div className="g">
                  <div className="n">{insp.customer || "—"}</div>
                  <div className="m">{[insp.address, insp.tech].filter(Boolean).join(" · ")} · {issues} {t("issuesWord")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {canSee && <div className="money">{money(tot.price)}</div>}
                  <span className={`badge ${badgeTone(insp.status)}`} style={{ marginTop: 3 }}>
                    {t("st_" + insp.status)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
