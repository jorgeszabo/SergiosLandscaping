"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { uid } from "@/lib/data/id";
import { IconSearch, IconTrash, IconPlus } from "@/components/icons";
import type { Customer, Inspection } from "@/lib/data/types";

/** Customer database. Everyone can browse and start an inspection from a
    customer; admins can also remove entries. */
export function Customers() {
  const { db, user, beginDraft, deleteCustomer } = useStore();
  const { t } = useI18n();
  const toast = useToast();
  const { navigate } = useNav();
  const [q, setQ] = useState("");
  if (!user) return null;

  const isAdmin = !!user.permissions.editCatalog;
  const query = q.trim().toLowerCase();
  const list = db.customers
    .filter(
      (c) =>
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.address || "").toLowerCase().includes(query) ||
        (c.city || "").toLowerCase().includes(query)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const startForCustomer = (c: Customer) => {
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

  const remove = async (c: Customer) => {
    if (!window.confirm(t("confirmRemoveCustomer"))) return;
    await deleteCustomer(c.id);
    toast(t("customerRemoved"));
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <p className="sub" style={{ marginTop: 0 }}>{t("custScreenHint")}</p>

      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
          <IconSearch size={16} />
        </span>
        <input
          className="t"
          style={{ paddingLeft: 36 }}
          placeholder={t("searchCustomers")}
          value={q}
          autoComplete="off"
          data-1p-ignore
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="list">
          {db.customers.length === 0 && <div className="empty">{t("noCustomers")}</div>}
          {db.customers.length > 0 && list.length === 0 && <div className="empty">{t("noCustomerMatch")}</div>}
          {list.map((c) => (
            <div key={c.id} className="item" style={{ cursor: "default" }}>
              <div className="g">
                <div className="n">{c.name}</div>
                <div className="m">{[c.address, c.city].filter(Boolean).join(" · ") || "—"}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn sm" onClick={() => startForCustomer(c)}>
                  <IconPlus size={15} /> {t("startInspection")}
                </button>
                {isAdmin && (
                  <button className="iconbtn" title={t("removeCustomer")} aria-label={t("removeCustomer")} onClick={() => remove(c)}>
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
