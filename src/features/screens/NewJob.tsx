"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { uid } from "@/lib/data/id";
import type { Customer } from "@/lib/data/types";

export function NewJob() {
  const { insp, save } = useInspection();
  const { db, addCustomer } = useStore();
  const { t } = useI18n();
  const { navigate, back } = useNav();

  const [customer, setCustomer] = useState(insp?.customer || "");
  const [address, setAddress] = useState(insp?.address || "");
  const [city, setCity] = useState(insp?.city || "");
  if (!insp) return null;

  const prefill = (c: Customer) => {
    setCustomer(c.name);
    setAddress(c.address);
    setCity(c.city);
  };

  const next = () => {
    // Register a new customer so the office sees it (integration-seam friendly).
    const existing = db.customers.find(
      (c) => c.name.toLowerCase() === customer.trim().toLowerCase()
    );
    let customerId = existing?.id;
    if (!existing && customer.trim()) {
      const c: Customer = { id: uid(), name: customer.trim(), address, city };
      addCustomer(c);
      customerId = c.id;
    }
    save({ ...insp, customer: customer.trim(), address, city, customerId });
    navigate({ name: "snapshot", inspId: insp.id });
  };

  return (
    <div>
      <button className="backlink" onClick={back}>
        ‹ {t("back")}
      </button>
      <h1>{t("newInsp")}</h1>

      {db.customers.length > 0 && (
        <div className="pillbar">
          {db.customers.map((c) => (
            <button key={c.id} className="chip" onClick={() => prefill(c)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="card stack">
        <div>
          <label className="f">{t("customer")}</label>
          <input
            className="t"
            value={customer}
            placeholder={t("searchCust")}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
        <div>
          <label className="f">{t("address")}</label>
          <input className="t" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="f">{t("city")}</label>
          <input className="t" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>

      <button className="btn pri block" onClick={next}>
        {t("next")} ›
      </button>
    </div>
  );
}
