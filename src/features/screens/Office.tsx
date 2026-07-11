"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { inspectionTotals, money } from "@/lib/money/engine";
import type { InspectionStatus } from "@/lib/data/types";

type Filter = "review" | "all" | "approved";

const STATUS_LABEL: Record<InspectionStatus, string> = {
  draft: "draft",
  submitted: "submitted",
  under_review: "underReview",
  approved: "approved",
  returned: "returned",
};

export function Office() {
  const { db } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  const [filter, setFilter] = useState<Filter>("review");

  const rows = db.inspections.filter((i) => {
    if (filter === "all") return true;
    if (filter === "approved") return i.status === "approved";
    return i.status === "submitted" || i.status === "under_review" || i.status === "returned";
  });

  return (
    <div>
      <h1>{t("queue")}</h1>
      <p className="sub">{t("office")}</p>

      <div className="pillbar">
        <button className={`chip ${filter === "review" ? "on" : ""}`} onClick={() => setFilter("review")}>
          {t("needsReview")}
        </button>
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
          {t("all")}
        </button>
        <button className={`chip ${filter === "approved" ? "on" : ""}`} onClick={() => setFilter("approved")}>
          {t("approved")}
        </button>
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
              const approved = insp.status === "approved";
              return (
                <tr
                  key={insp.id}
                  className="clickable"
                  onClick={() => navigate({ name: "review", inspId: insp.id })}
                >
                  <td>
                    <b>{insp.customer || "—"}</b>
                  </td>
                  <td>{insp.address}</td>
                  <td>{insp.tech}</td>
                  <td style={{ textAlign: "right" }}>{issues}</td>
                  <td style={{ textAlign: "right" }} className="money">
                    {money(tot.price)}
                  </td>
                  <td>
                    <span className={`badge ${approved ? "done" : "new"}`}>{t(STATUS_LABEL[insp.status])}</span>
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
