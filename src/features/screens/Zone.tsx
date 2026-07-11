"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { priceLine, money, findIssue, nm as engineNm } from "@/lib/money/engine";

const WATERS = ["turf", "beds"];
const HEADS = ["spray", "rotor", "drip", "bubbler"];

export function Zone() {
  const { insp, save, catalog } = useInspection();
  const { user } = useStore();
  const { t, nm, lang } = useI18n();
  const { view, navigate, back } = useNav();

  const zoneNo = view.zn as number;
  const zone = insp?.zones.find((z) => z.n === zoneNo);
  const [waters, setWaters] = useState<string[]>(zone?.waters || []);
  const [heads, setHeads] = useState<string[]>(zone?.heads || []);
  const [schedule, setSchedule] = useState(zone?.schedule || "");

  const persist = useCallback(
    (over?: { waters?: string[]; heads?: string[]; schedule?: string }) => {
      if (!insp || !zone) return;
      const merged = {
        ...zone,
        waters: over?.waters ?? waters,
        heads: over?.heads ?? heads,
        schedule: over?.schedule ?? schedule,
        visited: true,
      };
      save({ ...insp, zones: insp.zones.map((z) => (z.n === zoneNo ? merged : z)) });
    },
    [insp, zone, waters, heads, schedule, zoneNo, save]
  );

  // Mark visited on first open.
  useEffect(() => {
    if (zone && !zone.visited) persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!insp || !zone) return null;

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const zoneIssues = insp.lines.filter((l) => l.kind === "issue" && l.zone === zoneNo);

  return (
    <div>
      <button
        className="backlink"
        onClick={() => {
          persist();
          back();
        }}
      >
        ‹ {t("zonesHub")}
      </button>
      <h1>
        {t("zone")} {zone.n}
      </h1>

      <div className="card">
        <label className="f">{t("makeup")}</label>
        <div className="pillbar">
          {WATERS.map((w) => (
            <button
              key={w}
              className={`chip ${waters.includes(w) ? "on" : ""}`}
              onClick={() => {
                const next = toggle(waters, w);
                setWaters(next);
                persist({ waters: next });
              }}
            >
              {t(w)}
            </button>
          ))}
        </div>

        <label className="f">{t("headTypes")}</label>
        <div className="pillbar">
          {HEADS.map((h) => (
            <button
              key={h}
              className={`chip ${heads.includes(h) ? "on" : ""}`}
              onClick={() => {
                const next = toggle(heads, h);
                setHeads(next);
                persist({ heads: next });
              }}
            >
              {t(h)}
            </button>
          ))}
        </div>

        <label className="f">{t("sched")}</label>
        <input
          className="t"
          value={schedule}
          placeholder={t("schedPh")}
          onChange={(e) => setSchedule(e.target.value)}
          onBlur={() => persist({ schedule })}
        />
      </div>

      <div className="sechead">
        <h2 style={{ marginBottom: 8 }}>{t("issuesHere")}</h2>
      </div>
      <div className="card">
        <div className="list">
          {zoneIssues.length === 0 && (
            <div className="empty" style={{ padding: 18 }}>
              {t("noIssues")}
            </div>
          )}
          {zoneIssues.map((line) => {
            const r = priceLine(line, catalog, lang);
            const def = findIssue(catalog, line.issueId);
            return (
              <div key={line.id} className="item" style={{ cursor: "default" }}>
                <div className="g">
                  <div className="n">
                    <span className={`sev ${def?.severity}`} />
                    {engineNm(def?.name, lang)} ×{line.count}
                  </div>
                  <div className="m">{r.detail}</div>
                </div>
                {user?.permissions.seePrices && <div className="money">{money(r.price)}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="btn pri block"
        onClick={() => {
          persist();
          navigate({ name: "addIssue", inspId: insp.id, zn: zoneNo });
        }}
      >
        ＋ {t("addIssue")}
      </button>
      <button
        className="btn block ghost"
        style={{ marginTop: 8 }}
        onClick={() => {
          persist();
          back();
        }}
      >
        {t("done")}
      </button>
    </div>
  );
}
