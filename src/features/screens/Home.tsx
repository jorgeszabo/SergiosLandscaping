"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { SyncStatus } from "@/components/SyncStatus";
import { inspectionTotals, money } from "@/lib/money/engine";
import { newInspectionDraft } from "@/lib/data/factory";
import { badgeTone } from "@/lib/data/status";
import { ListAvatar } from "@/components/ListAvatar";
import { IconPlus, IconInbox } from "@/components/icons";
import type { Inspection, InspectionStatus } from "@/lib/data/types";

export function Home() {
  const { db, user, beginDraft } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  if (!user) return null;

  const isOffice = user.role === "office" || user.role === "admin";
  const canSee = user.permissions.seePrices;

  // Office/admin handle everyone's work; field/lead see their own jobs.
  const scope = isOffice ? db.inspections : db.inspections.filter((i) => i.techId === user.id);
  const scount = (fn: (s: InspectionStatus) => boolean) => scope.filter((i) => fn(i.status)).length;

  const startNew = () => {
    const insp = newInspectionDraft(user);
    beginDraft(insp);
    navigate({ name: "newJob", inspId: insp.id });
  };

  const openInsp = (insp: Inspection) => {
    if (isOffice) navigate({ name: "review", inspId: insp.id });
    else navigate({ name: insp.zones.length ? "zones" : "newJob", inspId: insp.id });
  };

  const stats = isOffice
    ? [
        { l: t("needsReview"), v: scount((s) => s === "submitted" || s === "under_review" || s === "returned") },
        { l: t("workOrders"), v: scount((s) => s === "approved" || s === "in_progress") },
        { l: t("st_completed"), v: scount((s) => s === "completed") },
        { l: t("inspections"), v: scope.length },
      ]
    : [
        { l: t("st_draft"), v: scount((s) => s === "draft") },
        { l: t("st_returned"), v: scount((s) => s === "returned") },
        { l: t("workOrders"), v: scount((s) => s === "approved" || s === "in_progress") },
        { l: t("st_completed"), v: scount((s) => s === "completed") },
      ];

  // Only the items needing THIS user's action, most urgent first. Office:
  // things to review then schedule. Field: rework, then finish drafts, then
  // the work orders to go do.
  const attnStatuses: InspectionStatus[] = isOffice
    ? ["submitted", "under_review", "approved"]
    : ["returned", "draft", "approved", "in_progress"];
  const attention = scope
    .filter((i) => attnStatuses.includes(i.status))
    .sort(
      (a, b) =>
        attnStatuses.indexOf(a.status) - attnStatuses.indexOf(b.status) ||
        (b.updatedAt || 0) - (a.updatedAt || 0)
    )
    .slice(0, 8);

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

      <h2>{t("needsAttention")}</h2>
      <div className="card">
        <div className="list">
          {attention.length === 0 && (
            <div className="empty">
              <div className="big">{t("allCaughtUp")}</div>
              <div>{t("tapNew")}</div>
            </div>
          )}
          {attention.map((insp) => {
            const tot = inspectionTotals(insp, db.catalog);
            const issues = insp.lines.filter((l) => l.kind === "issue").length;
            const meta = [insp.address, isOffice ? insp.tech : ""].filter(Boolean).join(" · ");
            return (
              <button key={insp.id} className="item" onClick={() => openInsp(insp)}>
                <ListAvatar />
                <div className="g">
                  <div className="n">{insp.customer || "—"}</div>
                  <div className="m">{[meta, `${issues} ${t("issuesWord")}`].filter(Boolean).join(" · ")}</div>
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
