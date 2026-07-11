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

type AddrSug = { id: string; primary: string; secondary: string; pred: any };

// Attributes that tell password managers to leave a field alone.
const NO_PW = { autoComplete: "off", "data-1p-ignore": true, "data-lpignore": "true" } as const;

export function NewJob() {
  const { insp, save } = useInspection();
  const { db, addCustomer } = useStore();
  const { t } = useI18n();
  const { navigate, back } = useNav();

  const [customer, setCustomer] = useState(insp?.customer || "");
  const [address, setAddress] = useState(insp?.address || "");
  const [city, setCity] = useState(insp?.city || "");
  const [geo, setGeo] = useState<LatLng | undefined>(insp?.geo);

  // Customer search (against our own customer database).
  const [custOpen, setCustOpen] = useState(false);

  // Address autocomplete (Places API New).
  const [sugs, setSugs] = useState<AddrSug[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const places = useRef<any>(null);
  const token = useRef<any>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Device location → address.
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState("");

  useEffect(() => {
    if (!mapsConfigured()) return;
    let cancelled = false;
    loadMaps()
      .then(async (maps) => {
        if (cancelled) return;
        const lib = maps.importLibrary ? await maps.importLibrary("places") : maps.places;
        places.current = lib;
        if (lib?.AutocompleteSessionToken) token.current = new lib.AutocompleteSessionToken();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  // ── customer search ─────────────────────────────────────────────────────
  const custMatches = (() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    return db.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.address || "").toLowerCase().includes(q) ||
          (c.city || "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  })();

  const pickCustomer = (c: Customer) => {
    setCustomer(c.name);
    setAddress(c.address);
    setCity(c.city);
    setSugs([]);
    setCustOpen(false);
  };

  // ── address autocomplete ────────────────────────────────────────────────
  const fetchSugs = (input: string) => {
    const lib = places.current;
    if (!lib?.AutocompleteSuggestion || input.trim().length < 3) {
      setSugs([]);
      return;
    }
    const req: any = { input };
    if (token.current) req.sessionToken = token.current;
    lib.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)
      .then((res: any) => {
        const list: AddrSug[] = (res?.suggestions || [])
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .map((p: any) => ({
            id: p.placeId || uid(),
            primary: p.mainText?.text || p.text?.text || "",
            secondary: p.secondaryText?.text || "",
            pred: p,
          }));
        setSugs(list);
        setAddrOpen(list.length > 0);
      })
      .catch(() => setSugs([]));
  };

  const onAddressInput = (v: string) => {
    setAddress(v);
    setGeo(undefined);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSugs(v), 250);
  };

  const applyComponents = (comps: any[], formatted: string, loc: { lat: number; lng: number } | null, fallback = "") => {
    const pick = (type: string) => comps.find((c) => (c.types || []).includes(type));
    // Places (New) uses longText/shortText; the Geocoder uses long_name/short_name.
    const text = (c: any) => c?.longText ?? c?.long_name ?? "";
    const short = (c: any) => c?.shortText ?? c?.short_name ?? "";
    const streetNo = text(pick("street_number"));
    const route = text(pick("route"));
    const cityName = text(pick("locality")) || text(pick("sublocality")) || text(pick("postal_town"));
    const state = short(pick("administrative_area_level_1"));
    const zip = text(pick("postal_code"));
    const streetLine = [streetNo, route].filter(Boolean).join(" ");
    setAddress(streetLine || formatted || fallback);
    setCity([cityName, state, zip].filter(Boolean).join(", "));
    if (loc) setGeo({ lat: loc.lat, lng: loc.lng });
  };

  const chooseAddr = async (s: AddrSug) => {
    setAddrOpen(false);
    try {
      const place = s.pred.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "addressComponents", "location"] });
      const loc = place.location ? { lat: place.location.lat(), lng: place.location.lng() } : null;
      applyComponents(place.addressComponents || [], place.formattedAddress || "", loc, s.primary);
    } catch {
      setAddress(s.primary);
      setCity(s.secondary);
    }
    setSugs([]);
    const lib = places.current;
    if (lib?.AutocompleteSessionToken) token.current = new lib.AutocompleteSessionToken();
  };

  // ── device location → reverse-geocode to an address ─────────────────────
  const useMyLocation = () => {
    setLocMsg("");
    if (!mapsConfigured()) {
      setLocMsg(t("locationNoMaps"));
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocMsg(t("locationOff"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGeo({ lat, lng });
        try {
          const maps = await loadMaps();
          const geoLib = maps.importLibrary ? await maps.importLibrary("geocoding") : maps;
          const Geocoder = geoLib.Geocoder || maps.Geocoder;
          const geocoder = new Geocoder();
          const { results } = await geocoder.geocode({ location: { lat, lng } });
          const best = results?.[0];
          if (best) {
            applyComponents(best.address_components || [], best.formatted_address || "", { lat, lng });
          } else {
            setLocMsg(t("geocodeFailed"));
          }
        } catch {
          setLocMsg(t("geocodeFailed"));
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocMsg(err.code === err.PERMISSION_DENIED ? t("locationDenied") : t("locationOff"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!insp) return null;

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

      <div className="card stack">
        <div style={{ position: "relative" }}>
          <label className="f">{t("customer")}</label>
          <input
            className="t"
            value={customer}
            placeholder={t("searchCust")}
            {...NO_PW}
            onChange={(e) => {
              setCustomer(e.target.value);
              setCustOpen(true);
            }}
            onFocus={() => setCustOpen(true)}
            onBlur={() => setTimeout(() => setCustOpen(false), 150)}
          />
          {custOpen && custMatches.length > 0 && (
            <ul className="ac-drop">
              {custMatches.map((c) => (
                <li key={c.id}>
                  <button type="button" className="ac-item" onMouseDown={(e) => e.preventDefault()} onClick={() => pickCustomer(c)}>
                    <span className="ac-primary">{c.name}</span>
                    {(c.address || c.city) && (
                      <span className="ac-secondary">{[c.address, c.city].filter(Boolean).join(" · ")}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="f">{t("address")}</label>
            {mapsConfigured() && (
              <button type="button" className="btn sm ghost" style={{ padding: "4px 8px" }} onClick={useMyLocation} disabled={locating}>
                <IconPin size={14} /> {locating ? t("locating") : t("useMyLocation")}
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            {mapsConfigured() && (
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex" }}>
                <IconSearch size={16} />
              </span>
            )}
            <input
              className="t"
              style={mapsConfigured() ? { paddingLeft: 36 } : undefined}
              value={address}
              placeholder={mapsConfigured() ? t("searchAddress") : ""}
              {...NO_PW}
              onChange={(e) => onAddressInput(e.target.value)}
              onFocus={() => sugs.length && setAddrOpen(true)}
              onBlur={() => setTimeout(() => setAddrOpen(false), 150)}
            />
          </div>
          {locMsg && (
            <div className="note" style={{ color: "var(--danger)", marginTop: 6 }}>{locMsg}</div>
          )}
          {addrOpen && sugs.length > 0 && (
            <ul className="ac-drop">
              {sugs.map((s) => (
                <li key={s.id}>
                  <button type="button" className="ac-item" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseAddr(s)}>
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
          <input className="t" value={city} {...NO_PW} onChange={(e) => setCity(e.target.value)} />
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
