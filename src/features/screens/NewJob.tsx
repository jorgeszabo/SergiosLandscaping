"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { uid } from "@/lib/data/id";
import { mapsConfigured, loadMaps } from "@/lib/maps";
import { IconChevronLeft, IconPin } from "@/components/icons";
import type { Customer, LatLng } from "@/lib/data/types";

export function NewJob() {
  const { insp, save } = useInspection();
  const { db, addCustomer } = useStore();
  const { t } = useI18n();
  const { navigate, back } = useNav();

  const [customer, setCustomer] = useState(insp?.customer || "");
  const [address, setAddress] = useState(insp?.address || "");
  const [city, setCity] = useState(insp?.city || "");
  const [geo, setGeo] = useState<LatLng | undefined>(insp?.geo);
  const addrRef = useRef<HTMLInputElement>(null);

  // Google Places address autocomplete on the address field.
  useEffect(() => {
    if (!mapsConfigured() || !addrRef.current) return;
    let ac: { addListener: (e: string, cb: () => void) => void } | null = null;
    loadMaps()
      .then((maps) => {
        if (!addrRef.current) return;
        ac = new maps.places.Autocomplete(addrRef.current, {
          types: ["address"],
          fields: ["formatted_address", "address_components", "geometry"],
        });
        (ac as unknown as { addListener: (e: string, cb: () => void) => void }).addListener("place_changed", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const place = (ac as any).getPlace();
          if (!place) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const comp = (c: string) => (place.address_components || []).find((x: any) => x.types.includes(c));
          const streetNo = comp("street_number")?.long_name || "";
          const route = comp("route")?.long_name || "";
          const cityName = comp("locality")?.long_name || comp("sublocality")?.long_name || "";
          const state = comp("administrative_area_level_1")?.short_name || "";
          const zip = comp("postal_code")?.long_name || "";
          setAddress([streetNo, route].filter(Boolean).join(" ") || place.formatted_address || "");
          setCity([cityName, state, zip].filter(Boolean).join(", "));
          const loc = place.geometry?.location;
          if (loc) setGeo({ lat: loc.lat(), lng: loc.lng() });
        });
      })
      .catch(() => {});
  }, []);

  if (!insp) return null;

  const prefill = (c: Customer) => {
    setCustomer(c.name);
    setAddress(c.address);
    setCity(c.city);
  };

  const next = () => {
    const existing = db.customers.find(
      (c) => c.name.toLowerCase() === customer.trim().toLowerCase()
    );
    let customerId = existing?.id;
    if (!existing && customer.trim()) {
      const c: Customer = { id: uid(), name: customer.trim(), address, city };
      addCustomer(c);
      customerId = c.id;
    }
    save({ ...insp, customer: customer.trim(), address, city, customerId, geo });
    navigate({ name: "snapshot", inspId: insp.id });
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <button className="backlink" onClick={back}>
        <IconChevronLeft size={16} /> {t("back")}
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
          <input className="t" value={customer} placeholder={t("searchCust")} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        <div>
          <label className="f">{t("address")}</label>
          <input
            ref={addrRef}
            className="t"
            value={address}
            placeholder={mapsConfigured() ? t("searchAddress") : ""}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="f">{t("city")}</label>
          <input className="t" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        {geo && (
          <div className="note" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconPin size={14} /> {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
          </div>
        )}
      </div>

      <button className="btn pri block" onClick={next}>
        {t("next")} ›
      </button>
    </div>
  );
}
