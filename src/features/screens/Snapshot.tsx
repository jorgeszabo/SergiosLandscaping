"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import type { Zone } from "@/lib/data/types";

const BRANDS = ["", "Hunter", "Rain Bird", "Weathermatic", "Toro", "Other"];
const BACKFLOW = ["", "PVB", "DCV", "None"];

export function Snapshot() {
  const { insp, save } = useInspection();
  const { t } = useI18n();
  const { navigate, back } = useNav();
  const [s, setS] = useState(() => ({ ...insp!.snapshot }));
  if (!insp) return null;

  const stations = parseInt(s.stations || "0");
  const set = (patch: Partial<typeof s>) => setS((prev) => ({ ...prev, ...patch }));

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
            <select className="t" value={s.brand} onChange={(e) => set({ brand: e.target.value })}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="f">{t("model")}</label>
            <input className="t" value={s.model} placeholder="X-Core" onChange={(e) => set({ model: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="f">{t("stations")}</label>
          <input
            className="t"
            type="number"
            min={0}
            max={48}
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
