"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import type { Zone } from "@/lib/data/types";

const KNOWN_BRANDS = ["Hunter", "Rain Bird", "Weathermatic", "Toro"];
const BACKFLOW = ["", "PVB", "DCV", "None"];
// Common controller models per brand — power the Model suggestions.
const MODELS: Record<string, string[]> = {
  Hunter: ["X-Core", "X2", "Pro-C", "Pro-HC", "ICC2", "HPC"],
  "Rain Bird": ["ESP-TM2", "ESP-Me3", "ESP-RZXe", "ESP-4ME", "ESP-SMTe"],
  Weathermatic: ["SL1600", "SL4800", "SmartLine"],
  Toro: ["TMC-212", "Evolution", "TDC"],
};

export function Snapshot() {
  const { insp, save } = useInspection();
  const { t } = useI18n();
  const { navigate, back } = useNav();
  const [s, setS] = useState(() => ({ ...insp!.snapshot }));
  // "Other" brand mode: on when the saved brand isn't one of the known ones.
  const [otherBrand, setOtherBrand] = useState(() => {
    const b = insp!.snapshot.brand;
    return !!b && b !== "" && !KNOWN_BRANDS.includes(b);
  });
  if (!insp) return null;

  const stations = parseInt(s.stations || "0");
  const set = (patch: Partial<typeof s>) => setS((prev) => ({ ...prev, ...patch }));
  const brandModels = MODELS[s.brand] || [];

  const onBrand = (v: string) => {
    if (v === "__other") {
      setOtherBrand(true);
      if (KNOWN_BRANDS.includes(s.brand)) set({ brand: "", model: "" });
    } else {
      setOtherBrand(false);
      // Changing to a different brand clears a model that belonged to the old one.
      set({ brand: v, model: v && !(MODELS[v] || []).includes(s.model) ? "" : s.model });
    }
  };

  const saveNext = () => {
    const n = parseInt(s.stations || "0");
    let zones: Zone[] = insp.zones;
    const existing = zones.length;
    if (n > existing) {
      zones = [...zones];
      for (let i = existing; i < n; i++) zones.push({ n: i + 1, waters: [], heads: [], schedule: "" });
    } else if (n >= 0 && n < existing) {
      zones = zones.slice(0, n);
    }
    save({ ...insp, snapshot: s, zones });
    navigate({ name: "zones", inspId: insp.id });
  };

  return (
    <div>
      <button className="backlink" onClick={back}>
        ‹ {t("back")}
      </button>
      <h1>{t("sysOverview")}</h1>

      <div className="card stack">
        <div className="grid2">
          <div>
            <label className="f">{t("brand")}</label>
            <select
              className="t"
              value={otherBrand ? "__other" : KNOWN_BRANDS.includes(s.brand) ? s.brand : ""}
              onChange={(e) => onBrand(e.target.value)}
            >
              <option value="" />
              {KNOWN_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="__other">{t("brandOther")}</option>
            </select>
          </div>
          <div>
            <label className="f">{t("model")}</label>
            <input
              className="t"
              list="model-list"
              value={s.model}
              placeholder={brandModels[0] || ""}
              onChange={(e) => set({ model: e.target.value })}
            />
            {brandModels.length > 0 && (
              <datalist id="model-list">
                {brandModels.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            )}
          </div>
        </div>
        {otherBrand && (
          <div>
            <label className="f">{t("otherBrandLabel")}</label>
            <input
              className="t"
              value={s.brand}
              placeholder={t("otherBrandPh")}
              onChange={(e) => set({ brand: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="f">{t("stations")}</label>
          <input
            className="t"
            type="number"
            min={0}
            max={100}
            value={s.stations}
            placeholder="8"
            onChange={(e) => set({ stations: e.target.value })}
          />
          <div className="note">
            {stations > 0 ? `${stations} ` : ""}
            {t("createsZones")}
          </div>
        </div>

        <div className="grid2">
          <div>
            <label className="f">{t("backflow")}</label>
            <select className="t" value={s.backflow} onChange={(e) => set({ backflow: e.target.value })}>
              {BACKFLOW.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="f">{t("pressure")}</label>
            <input
              className="t"
              type="number"
              value={s.pressure}
              placeholder="65"
              onChange={(e) => set({ pressure: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="f">{t("rainSensor")}</label>
          <div className="pillbar">
            <button className={`chip ${s.rainSensor === "yes" ? "on" : ""}`} onClick={() => set({ rainSensor: "yes" })}>
              {t("yes")}
            </button>
            <button className={`chip ${s.rainSensor === "no" ? "on" : ""}`} onClick={() => set({ rainSensor: "no" })}>
              {t("no")}
            </button>
          </div>
        </div>
      </div>

      <button className="btn pri block" onClick={saveNext}>
        {t("saveNext")} ›
      </button>
    </div>
  );
}
