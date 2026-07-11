"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { IconSearch, IconChevronRight } from "@/components/icons";
import type { Customer } from "@/lib/data/types";

/** Customer database. Everyone can browse; tap a customer to see their job
    history and start a new inspection there. */
export function Customers() {
  const { db, user } = useStore();
  const { t } = useI18n();
  const { navigate } = useNav();
  const [q, setQ] = useState("");
  if (!user) return null;

  const jobCount = (c: Customer) =>
    db.inspections.filter(
      (i) => i.customerId === c.id || (!!i.customer && i.customer.toLowerCase() === c.name.toLowerCase())
    ).length;

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
          {list.map((c) => {
            const n = jobCount(c);
            return (
              <button key={c.id} className="item" onClick={() => navigate({ name: "customer", custId: c.id })}>
                <div className="g">
                  <div className="n">{c.name}</div>
                  <div className="m">
                    {[c.address, c.city].filter(Boolean).join(" · ") || "—"}
                    {n > 0 ? ` · ${n} ${n === 1 ? t("job") : t("jobs")}` : ""}
                  </div>
                </div>
                <IconChevronRight size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
