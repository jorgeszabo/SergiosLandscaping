"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { uid } from "@/lib/data/id";
import { mapsConfigured, loadMaps } from "@/lib/maps";
import { IconChevronLeft, IconPin, IconSearch } from "@/components/icons";
import type { Customer, LatLng } from "@/lib/data/types";

type Suggestion = { id: string; primary: string; secondary: string; pred: any };

export function NewJob() {
  const { insp, save } = useInspection();
  const { db, addCustomer } = useStore();
  const { t } = useI18n();
  const { navigate, back } = useNav();

  const [customer, setCustomer] = useState(insp?.customer || "");
  const [address, setAddress] = useState(insp?.address || "");
  const [city, setCity] = useState(insp?.city || "");
  const [geo, setGeo] = useState<LatLng | undefined>(insp?.geo);

  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [acError, setAcError] = useState("");
  const places = useRef<any>(null);
  const token = useRef<any>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the Places (New) library once; keep a session token for billing.
  useEffect(() => {
    if (!mapsConfigured()) return;
    let cancelled = false;
    loadMaps()
      .then(async (maps) => {
        if (cancelled) return;
        const lib = maps.importLibrary ? await maps.importLibrary("places") : maps.places;
        places.current = lib;
        if (lib?.AutocompleteSessionToken) token.current = new lib.AutocompleteSessionToken();
        if (!lib?.AutocompleteSuggestion) setAcError("AutocompleteSuggestion not available in loaded library");
      })
      .catch((e: any) => setAcError("load: " + (e?.message || String(e))));
    return () => {
      cancelled = true;
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const fetchSugs = (input: string) => {
    const lib = places.current;
    if (input.trim().length < 3) {
      setSugs([]);
      return;
    }
    if (!lib?.AutocompleteSuggestion) {
      setAcError(lib ? "AutocompleteSuggestion missing" : "Places library not loaded");
      return;
    }
    const req: any = { input };
    if (token.current) req.sessionToken = token.current;
    lib.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)
      .then((res: any) => {
        setAcError("");
        const list: Suggestion[] = (res?.suggestions || [])
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .map((p: any) => ({
            id: p.placeId || uid(),
            primary: p.mainText?.text || p.text?.text || "",
            secondary: p.secondaryText?.text || "",
            pred: p,
          }));
        setSugs(list);
        setOpen(list.length > 0);
      })
      .catch((e: any) => {
        setSugs([]);
        setAcError(e?.message || String(e));
      });
  };

  const onAddressInput = (v: string) => {
    setAddress(v);
    setGeo(undefined);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSugs(v), 250);
  };

  const choose = async (s: Suggestion) => {
    setOpen(false);
    try {
      const place = s.pred.toPlace();
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
      setAddress(streetLine || place.formattedAddress || s.primary);
      setCity([cityName, state, zip].filter(Boolean).join(", "));
      const loc = place.location;
      if (loc) setGeo({ lat: loc.lat(), lng: loc.lng() });
    } catch {
      // Fall back to the suggestion text if detail fetch fails.
      setAddress(s.primary);
      setCity(s.secondary);
    }
    setSugs([]);
    // Fresh session token for the next lookup (Places billing best practice).
    const lib = places.current;
    if (lib?.AutocompleteSessionToken) token.current = new lib.AutocompleteSessionToken();
  };

  if (!insp) return null;

  const prefill = (c: Customer) => {
    setCustomer(c.name);
    setAddress(c.address);
    setCity(c.city);
    setSugs([]);
    setOpen(false);
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
        <div style={{ position: "relative" }}>
          <label className="f">{t("address")}</label>
          <div style={{ position: "relative" }}>
            {mapsConfigured() && (
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <IconSearch size={16} />
              </span>
            )}
            <input
              className="t"
              style={mapsConfigured() ? { paddingLeft: 36 } : undefined}
              value={address}
              placeholder={mapsConfigured() ? t("searchAddress") : ""}
              autoComplete="off"
              onChange={(e) => onAddressInput(e.target.value)}
              onFocus={() => sugs.length && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
          </div>
          {acError && (
            <div className="note" style={{ color: "var(--danger)", marginTop: 6 }}>
              Maps: {acError}
            </div>
          )}
          {open && sugs.length > 0 && (
            <ul className="ac-drop">
              {sugs.map((s) => (
                <li key={s.id}>
                  <button type="button" className="ac-item" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(s)}>
                    <span className="ac-primary">{s.primary}</span>
                    {s.secondary && <span className="ac-secondary">{s.secondary}</span>}
                  </button>
                </li>
              ))}
            </ul>
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
