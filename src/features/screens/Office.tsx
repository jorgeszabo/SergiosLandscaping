"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { inspectionTotals, money } from "@/lib/money/engine";
import type { InspectionStatus } from "@/lib/data/types";

type Filter = "review" | "workorders" | "completed" | "all";

const badgeTone = (s: InspectionStatus): string => {
  if (s === "completed") return "done";
  if (s === "approved" || s === "in_progress") return "navy";
  if (s === "returned") return "red";
  return "new";
};

export function Office() {
  const { db } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  const [filter, setFilter] = useState<Filter>("review");

  const rows = db.inspections.filter((i) => {
    switch (filter) {
      case "all":
        return true;
      case "workorders":
        return i.status === "approved" || i.status === "in_progress";
      case "completed":
        return i.status === "completed";
      default: // review
        return i.status === "submitted" || i.status === "under_review" || i.status === "returned";
    }
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: "review", label: t("needsReview") },
    { id: "workorders", label: t("workOrders") },
    { id: "completed", label: t("st_completed") },
    { id: "all", label: t("all") },
  ];

  const stat = (fn: (s: InspectionStatus) => boolean) =>
    db.inspections.filter((i) => fn(i.status)).length;

  return (
    <div>
      <div className="statgrid">
        <div className="statcard">
          <div className="l">{t("needsReview")}</div>
          <div className="v">{stat((s) => s === "submitted" || s === "under_review" || s === "returned")}</div>
        </div>
        <div className="statcard">
          <div className="l">{t("workOrders")}</div>
          <div className="v">{stat((s) => s === "approved" || s === "in_progress")}</div>
        </div>
        <div className="statcard">
          <div className="l">{t("st_completed")}</div>
          <div className="v">{stat((s) => s === "completed")}</div>
        </div>
        <div className="statcard">
          <div className="l">{t("inspections")}</div>
          <div className="v">{db.inspections.length}</div>
        </div>
      </div>

      <div className="pillbar">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            className={`chip ${filter === tb.id ? "on" : ""}`}
            onClick={() => setFilter(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflowX: "auto", padding: 0 }}>
        <table className="qtable">
          <thead>
            <tr>
              <th>{t("customer")}</th>
              <th>{t("address")}</th>
              <th>{t("tech")}</th>
              <th style={{ textAlign: "right" }}>{t("issuesWord")}</th>
              <th style={{ textAlign: "right" }}>{t("est")}</th>
              <th>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty">{t("noInsp")}</div>
                </td>
              </tr>
            )}
            {rows.map((insp) => {
              const tot = inspectionTotals(insp, db.catalog);
              const issues = insp.lines.filter((l) => l.kind === "issue").length;
              return (
                <tr
                  key={insp.id}
                  className="clickable"
                  onClick={() => navigate({ name: "review", inspId: insp.id })}
                >
                  <td>
                    <b style={{ color: "var(--text-strong)" }}>{insp.customer || "—"}</b>
                  </td>
                  <td>{insp.address}</td>
                  <td>{insp.tech}</td>
                  <td style={{ textAlign: "right" }}>{issues}</td>
                  <td style={{ textAlign: "right" }} className="money">
                    {money(tot.price)}
                  </td>
                  <td>
                    <span className={`badge ${badgeTone(insp.status)}`}>{t("st_" + insp.status)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
