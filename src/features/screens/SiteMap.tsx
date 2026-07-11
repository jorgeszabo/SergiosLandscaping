"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { mapsConfigured, loadMaps } from "@/lib/maps";
import { uid } from "@/lib/data/id";
import { IconChevronLeft, IconPin, IconTrash } from "@/components/icons";
import type { SiteMap as SiteMapT } from "@/lib/data/types";

type Mode = "pan" | "zone" | "pin";
type Shape = { id: string; type: "poly" | "pin"; obj: any; zone: number | "system" };

const DEFAULT_CENTER = { lat: 30.3119, lng: -95.4561 }; // Conroe, TX
const ZONE_STROKE = "#4C8656";
const SEL_STROKE = "#C1272D";

export function SiteMap() {
  const { insp, save } = useInspection();
  const { t } = useI18n();
  const toast = useToast();
  const { back } = useNav();

  const divRef = useRef<HTMLDivElement>(null);
  const g = useRef<{ maps?: any; map?: any; dm?: any; shapes: Shape[] }>({ shapes: [] });
  const selected = useRef<Shape | null>(null);
  const dirty = useRef(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<"" | "nokey" | "load">("");
  const [mode, setMode] = useState<Mode>("pan");
  const [hasSel, setHasSel] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [zoneTag, setZoneTag] = useState<number | "system">("system");
  const zoneTagRef = useRef(zoneTag);
  zoneTagRef.current = zoneTag;

  const markDirty = () => {
    dirty.current = true;
    setIsDirty(true);
  };

  const select = (entry: Shape | null) => {
    // Restore the previously-selected shape's look.
    const prev = selected.current;
    if (prev && prev.type === "poly") prev.obj.setOptions({ strokeColor: ZONE_STROKE, strokeWeight: 2 });
    if (prev && prev.type === "pin" && g.current.maps) prev.obj.setAnimation(null);
    selected.current = entry;
    setHasSel(!!entry);
    if (entry && entry.type === "poly") entry.obj.setOptions({ strokeColor: SEL_STROKE, strokeWeight: 4 });
    if (entry && entry.type === "pin" && g.current.maps) entry.obj.setAnimation(g.current.maps.Animation.BOUNCE);
  };

  // init map once
  useEffect(() => {
    if (!insp) return;
    if (!mapsConfigured()) { setErr("nokey"); return; }
    let cancelled = false;
    loadMaps()
      .then((maps) => {
        if (cancelled || !divRef.current) return;
        g.current.maps = maps;
        const center =
          insp.geo || insp.siteMap?.center ||
          insp.siteMap?.polygons?.[0]?.path?.[0] ||
          (insp.siteMap?.pins?.[0] ? { lat: insp.siteMap.pins[0].lat, lng: insp.siteMap.pins[0].lng } : DEFAULT_CENTER);
        const map = new maps.Map(divRef.current, {
          center,
          zoom: insp.geo || insp.siteMap ? 20 : 13,
          mapTypeId: "hybrid",
          tilt: 0,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          gestureHandling: "greedy", // one-finger pan on touch
        });
        g.current.map = map;
        maps.event.addListener(map, "click", () => select(null));

        const dm = new maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: { strokeColor: ZONE_STROKE, strokeWeight: 2, fillColor: ZONE_STROKE, fillOpacity: 0.25, editable: true },
          markerOptions: { draggable: true },
        });
        dm.setMap(map);
        g.current.dm = dm;

        maps.event.addListener(dm, "polygoncomplete", (poly: any) => {
          registerPoly(poly, zoneTagRef.current);
          markDirty();
          dm.setDrawingMode(null);
          setMode("pan");
        });
        maps.event.addListener(dm, "markercomplete", (marker: any) => {
          registerPin(marker, zoneTagRef.current);
          markDirty();
          dm.setDrawingMode(null);
          setMode("pan");
        });

        // load existing shapes
        (insp.siteMap?.polygons || []).forEach((p) => {
          const poly = new maps.Polygon({
            paths: p.path, strokeColor: ZONE_STROKE, strokeWeight: 2, fillColor: ZONE_STROKE, fillOpacity: 0.25, editable: true, map,
          });
          registerPoly(poly, p.zone ?? "system", p.id);
        });
        (insp.siteMap?.pins || []).forEach((p) => {
          const marker = new maps.Marker({ position: { lat: p.lat, lng: p.lng }, draggable: true, map });
          registerPin(marker, p.zone ?? "system", p.id);
        });

        setReady(true);
      })
      .catch(() => setErr("load"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerPoly = (obj: any, zone: number | "system", id = uid()) => {
    const entry: Shape = { id, type: "poly", obj, zone };
    g.current.shapes.push(entry);
    obj.addListener("click", () => select(entry));
    obj.addListener("rightclick", () => removeShape(entry));
    // Editing the polygon's vertices counts as a change.
    const path = obj.getPath();
    ["set_at", "insert_at", "remove_at"].forEach((ev) => path.addListener(ev, markDirty));
  };
  const registerPin = (obj: any, zone: number | "system", id = uid()) => {
    const entry: Shape = { id, type: "pin", obj, zone };
    g.current.shapes.push(entry);
    obj.addListener("click", () => select(entry));
    obj.addListener("rightclick", () => removeShape(entry));
    obj.addListener("dragend", markDirty);
  };
  const removeShape = (entry: Shape) => {
    entry.obj.setMap(null);
    g.current.shapes = g.current.shapes.filter((s) => s.id !== entry.id);
    if (selected.current?.id === entry.id) { selected.current = null; setHasSel(false); }
    markDirty();
  };

  // reflect draw mode
  useEffect(() => {
    const dm = g.current.dm;
    const maps = g.current.maps;
    if (!dm || !maps) return;
    dm.setDrawingMode(mode === "zone" ? maps.drawing.OverlayType.POLYGON : mode === "pin" ? maps.drawing.OverlayType.MARKER : null);
  }, [mode, ready]);

  const clearAll = () => {
    if (g.current.shapes.length && !window.confirm(t("confirmClearMap"))) return;
    g.current.shapes.forEach((s) => s.obj.setMap(null));
    g.current.shapes = [];
    selected.current = null;
    setHasSel(false);
    markDirty();
  };

  const saveMap = () => {
    if (!insp) return;
    const siteMap: SiteMapT = { center: g.current.map ? { lat: g.current.map.getCenter().lat(), lng: g.current.map.getCenter().lng() } : undefined, polygons: [], pins: [] };
    for (const s of g.current.shapes) {
      if (s.type === "poly") {
        const path = s.obj.getPath().getArray().map((ll: any) => ({ lat: ll.lat(), lng: ll.lng() }));
        if (path.length >= 3) siteMap.polygons.push({ id: s.id, zone: s.zone, path });
      } else {
        const pos = s.obj.getPosition();
        siteMap.pins.push({ id: s.id, zone: s.zone, lat: pos.lat(), lng: pos.lng() });
      }
    }
    save({ ...insp, siteMap });
    dirty.current = false;
    setIsDirty(false);
    toast(t("edited"));
  };

  // Guard against losing unsaved drawing when leaving the screen.
  const guardedBack = () => {
    if (dirty.current && !window.confirm(t("unsavedMap"))) return;
    back();
  };

  if (!insp) return null;

  if (err) {
    return (
      <div style={{ maxWidth: 560 }}>
        <button className="backlink" onClick={back}><IconChevronLeft size={16} /> {t("back")}</button>
        <h1>{t("siteMap")}</h1>
        <div className="card">
          <p style={{ margin: 0, color: "var(--text-body)" }}>{err === "nokey" ? t("mapNotConfigured") : t("mapError")}</p>
        </div>
      </div>
    );
  }

  const zoneOpts: (number | "system")[] = ["system", ...insp.zones.map((z) => z.n)];

  return (
    <div>
      <button className="backlink noprint" onClick={guardedBack}><IconChevronLeft size={16} /> {t("back")}</button>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ margin: 0 }}>{t("siteMap")}</h1>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          {isDirty && <span className="sub" style={{ margin: 0, color: "var(--warning)" }}>● {t("mapUnsaved")}</span>}
          <button className="btn pri" onClick={saveMap}>{t("saveMap")}</button>
        </div>
      </div>
      <p className="sub">{insp.customer} · {insp.address}</p>

      <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="sub" style={{ margin: 0 }}>{t("forZone")}</span>
          <select className="t" style={{ width: "auto" }} value={String(zoneTag)} onChange={(e) => setZoneTag(e.target.value === "system" ? "system" : Number(e.target.value))}>
            {zoneOpts.map((z) => <option key={z} value={String(z)}>{z === "system" ? t("systemWide") : `${t("zone")} ${z}`}</option>)}
          </select>
        </div>
        <div className="pillbar" style={{ margin: 0 }}>
          <button className={`chip ${mode === "pan" ? "on" : ""}`} onClick={() => { setMode("pan"); }}>{t("panMap")}</button>
          <button className={`chip ${mode === "zone" ? "on" : ""}`} onClick={() => { select(null); setMode("zone"); }}>{t("drawZone")}</button>
          <button className={`chip ${mode === "pin" ? "on" : ""}`} onClick={() => { select(null); setMode("pin"); }}><IconPin size={14} /> {t("addSprinkler")}</button>
          <button className="chip" disabled={!hasSel} onClick={() => selected.current && removeShape(selected.current)}>
            <IconTrash size={14} /> {t("removeSelected")}
          </button>
          <button className="chip" onClick={clearAll}>{t("clearMap")}</button>
        </div>
      </div>

      <div ref={divRef} style={{ width: "100%", height: "64vh", minHeight: 360, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }} />
      <p className="sub" style={{ marginTop: 8, fontSize: 12.5 }}>{t("mapHint")}</p>
    </div>
  );
}
