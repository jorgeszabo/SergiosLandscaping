"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const acHostRef = useRef<HTMLDivElement>(null);

  // Google Places address autocomplete. Uses the modern PlaceAutocompleteElement
  // (the legacy `places.Autocomplete` widget is disabled for Google Cloud
  // projects created after March 2025). Renders Google's own input into the
  // host div; on selection we parse the components into address/city/geo.
  useEffect(() => {
    if (!mapsConfigured() || !acHostRef.current) return;
    let el: any = null;
    let cancelled = false;
    const host = acHostRef.current;

    loadMaps()
      .then(async (maps) => {
        if (cancelled || !host) return;
        // The new element ships in the "places" library.
        const places = maps.importLibrary ? await maps.importLibrary("places") : maps.places;
        const PlaceAutocompleteElement = places.PlaceAutocompleteElement || maps.places.PlaceAutocompleteElement;
        if (!PlaceAutocompleteElement) return;

        el = new PlaceAutocompleteElement();
        el.style.width = "100%";
        host.appendChild(el);

        const onSelect = async (ev: any) => {
          try {
            const pred = ev?.placePrediction;
            const place = pred?.toPlace ? pred.toPlace() : ev?.place;
            if (!place) return;
            await place.fetchFields({ fields: ["formattedAddress", "addressComponents", "location"] });
            const comps: any[] = place.addressComponents || [];
            const pick = (type: string) => comps.find((c) => (c.types || []).includes(type));
            const streetNo = pick("street_number")?.longText || "";
            const route = pick("route")?.longText || "";
            const cityName =
              pick("locality")?.longText || pick("sublocality")?.longText || pick("postal_town")?.longText || "";
            const state = pick("administrative_area_level_1")?.shortText || "";
            const zip = pick("postal_code")?.longText || "";
            const streetLine = [streetNo, route].filter(Boolean).join(" ");
            setAddress(streetLine || place.formattedAddress || "");
            setCity([cityName, state, zip].filter(Boolean).join(", "));
            const loc = place.location;
            if (loc) setGeo({ lat: loc.lat(), lng: loc.lng() });
          } catch {
            /* ignore selection parse errors */
          }
        };

        // Current API fires "gmp-select"; older betas used "gmp-placeselect".
        el.addEventListener("gmp-select", onSelect);
        el.addEventListener("gmp-placeselect", onSelect);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
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
          {mapsConfigured() ? (
            <>
              {/* Google renders its own search input into this host. */}
              <div ref={acHostRef} className="ac-host" />
              <input
                className="t"
                style={{ marginTop: 8 }}
                value={address}
                placeholder={t("address")}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          ) : (
            <input
              className="t"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
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
