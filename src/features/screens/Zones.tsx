"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { inspectionTotals, money } from "@/lib/money/engine";
import { IconPin } from "@/components/icons";
import type { Inspection, Zone } from "@/lib/data/types";

function zoneStatus(insp: Inspection, z: Zone): { k: "new" | "issues" | "clean"; n?: number } {
  const issues = insp.lines.filter((l) => l.kind === "issue" && l.zone === z.n);
  if (z.visited || issues.length) return issues.length ? { k: "issues", n: issues.length } : { k: "clean" };
  return { k: "new" };
}

export function Zones() {
  const { insp, catalog } = useInspection();
  const { user, db, toggleRunningTotal } = useStore();
  const { t } = useI18n();
  const { navigate, back } = useNav();
  if (!insp) return null;

  const canSeePrice = !!user?.permissions.seePrices;
  const showTotal = !!db.settings.showRunningTotal;
  const tot = inspectionTotals(insp, catalog);

  return (
    <div>
      <button className="backlink" onClick={back}>
        ‹ {t("back")}
      </button>
      <h1>
        {t("zonesHub")}{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({insp.zones.length})</span>
      </h1>
      <p className="sub">{insp.customer || "—"}</p>

      <div className="card">
        <div className="list">
          {insp.zones.length === 0 && <div className="empty">{t("createsZones")}</div>}
          {insp.zones.map((z) => {
            const st = zoneStatus(insp, z);
            let badge = <span className="badge gray">{t("notStarted")}</span>;
            if (st.k === "issues")
              badge = (
                <span className="badge new">
                  {st.n} {st.n === 1 ? t("hasIssues") : t("hasIssuesP")}
                </span>
              );
            else if (st.k === "clean") badge = <span className="badge done">✓ {t("clean")}</span>;
            return (
              <button
                key={z.n}
                className="item"
                onClick={() => navigate({ name: "zone", inspId: insp.id, zn: z.n })}
              >
                <div className="g">
                  <div className="n">
                    {t("zone")} {z.n}
                  </div>
                  <div className="m">{z.waters.map((w) => t(w)).join(", ") || "—"}</div>
                </div>
                {badge}
              </button>
            );
          })}
        </div>
      </div>

      {canSeePrice && (
        <div className="row" style={{ justifyContent: "space-between", margin: "6px 2px 12px" }}>
          <button className={`chip ${showTotal ? "on" : ""}`} onClick={toggleRunningTotal}>
            {t("runningOn")}
          </button>
          {showTotal && (
            <span className="money" style={{ fontSize: 18 }}>
              {money(tot.price)}
            </span>
          )}
        </div>
      )}

      <button
        className="btn block"
        onClick={() => navigate({ name: "map", inspId: insp.id })}
      >
        <IconPin size={16} /> {t("openSiteMap")}
      </button>
      <button
        className="btn block"
        style={{ marginTop: 8 }}
        onClick={() => navigate({ name: "addIssue", inspId: insp.id, zn: "system" })}
      >
        ＋ {t("addSysIssue")}
      </button>
      <button
        className="btn amber block"
        style={{ marginTop: 10 }}
        onClick={() => navigate({ name: "review", inspId: insp.id })}
      >
        {t("reviewPrice")} ›
      </button>
    </div>
  );
}
