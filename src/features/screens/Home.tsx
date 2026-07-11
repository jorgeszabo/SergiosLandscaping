"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { SyncStatus } from "@/components/SyncStatus";
import { inspectionTotals, money } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
import type { Inspection } from "@/lib/data/types";

export function Home() {
  const { db, user, upsertInspection } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  if (!user) return null;

  const isOffice = user.role === "office" || user.role === "admin";

  const startNew = () => {
    const insp: Inspection = {
      id: uid(),
      customer: "",
      address: "",
      city: "",
      tech: user.name,
      techId: user.id,
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
      zones: [],
      lines: [],
    };
    upsertInspection(insp);
    navigate({ name: "newJob", inspId: insp.id });
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>{t("inspections")}</h1>
        <SyncStatus />
      </div>
      <p className="sub">
        {user.name} · {t("role_" + user.role)}
      </p>

      <button className="btn pri block" onClick={startNew}>
        ＋ {t("newInsp")}
      </button>

      {isOffice && (
        <button className="btn block" style={{ marginTop: 8 }} onClick={() => navigate({ name: "office" })}>
          🗂️ {t("openOffice")}
        </button>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="list">
          {db.inspections.length === 0 && (
            <div className="empty">
              <div className="big">{t("noInsp")}</div>
              <div>{t("tapNew")}</div>
            </div>
          )}
          {db.inspections.map((insp) => {
            const tot = inspectionTotals(insp, db.catalog);
            const issues = insp.lines.filter((l) => l.kind === "issue").length;
            const approved = insp.status === "approved";
            return (
              <button
                key={insp.id}
                className="item"
                onClick={() =>
                  navigate({ name: insp.zones.length ? "zones" : "newJob", inspId: insp.id })
                }
              >
                <div className="g">
                  <div className="n">{insp.customer || "—"}</div>
                  <div className="m">
                    {[insp.address, insp.tech, insp.date].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {user.permissions.seePrices && <div className="money">{money(tot.price)}</div>}
                  <div className="m" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {issues} {t("issuesWord")}
                  </div>
                </div>
                <span className={`badge ${approved ? "done" : "new"}`}>{approved ? "✓" : "•"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {user.permissions.editCatalog && (
        <button
          className="btn block ghost"
          style={{ marginTop: 2 }}
          onClick={() => navigate({ name: "catalog", tab: "parts" })}
        >
          ⚙︎ {t("catalog")}
        </button>
      )}
    </div>
  );
}
