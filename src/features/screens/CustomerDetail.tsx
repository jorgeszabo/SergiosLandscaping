"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { inspectionTotals, money } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
import { IconChevronLeft, IconPlus, IconTrash, IconClipboard } from "@/components/icons";
import type { Customer, Inspection, InspectionStatus } from "@/lib/data/types";

const badgeTone = (s: InspectionStatus): string => {
  if (s === "completed") return "done";
  if (s === "approved" || s === "in_progress") return "navy";
  if (s === "returned") return "red";
  return "new";
};

/** A single customer: their site info, a button to start a new inspection
    there, and their full job history (past inspections / work orders) — so a
    tech or the office can see what was done at a property and when. */
export function CustomerDetail() {
  const { db, user, beginDraft, deleteCustomer } = useStore();
  const { t } = useI18n();
  const toast = useToast();
  const { view, navigate, back } = useNav();
  if (!user) return null;

  const c = db.customers.find((x) => x.id === view.custId);
  if (!c) {
    return (
      <div>
        <button className="backlink" onClick={back}><IconChevronLeft size={16} /> {t("back")}</button>
        <div className="empty">{t("noCustomerMatch")}</div>
      </div>
    );
  }

  const isAdmin = !!user.permissions.editCatalog;
  const canSee = user.permissions.seePrices;

  const history = db.inspections
    .filter((i) => i.customerId === c.id || (!!i.customer && i.customer.toLowerCase() === c.name.toLowerCase()))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.updatedAt || 0) - (a.updatedAt || 0));

  const startHere = () => {
    const insp: Inspection = {
      id: uid(),
      customer: c.name,
      address: c.address,
      city: c.city,
      customerId: c.id,
      tech: user.name,
      techId: user.id,
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
      zones: [],
      lines: [],
    };
    beginDraft(insp);
    navigate({ name: "newJob", inspId: insp.id });
  };

  const remove = async (cust: Customer) => {
    if (!window.confirm(t("confirmRemoveCustomer"))) return;
    await deleteCustomer(cust.id);
    toast(t("customerRemoved"));
    back();
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <button className="backlink" onClick={back}><IconChevronLeft size={16} /> {t("back")}</button>

      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>{c.name}</h1>
          <p className="sub" style={{ margin: "2px 0 0" }}>{[c.address, c.city].filter(Boolean).join(" · ") || "—"}</p>
        </div>
        <button className="btn pri" onClick={startHere}>
          <IconPlus size={16} /> {t("newInspectionHere")}
        </button>
      </div>

      <h2>{t("projectHistory")}</h2>
      <div className="card" style={{ padding: 0 }}>
        <div className="list">
          {history.length === 0 && <div className="empty">{t("noHistory")}</div>}
          {history.map((insp) => {
            const tot = inspectionTotals(insp, db.catalog);
            const issues = insp.lines.filter((l) => l.kind === "issue").length;
            const items = insp.lines.filter((l) => l.state === "on").length;
            return (
              <button key={insp.id} className="item" onClick={() => navigate({ name: "review", inspId: insp.id })}>
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
                  <div className="n">{insp.date || "—"}</div>
                  <div className="m">
                    {issues} {t("issuesWord")} · {items} {t("itemsWord")}
                    {insp.tech ? ` · ${insp.tech}` : ""}
                  </div>
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

      {isAdmin && (
        <button className="btn danger block ghost" style={{ marginTop: 14 }} onClick={() => remove(c)}>
          <IconTrash size={16} /> {t("removeCustomer")}
        </button>
      )}
    </div>
  );
}
