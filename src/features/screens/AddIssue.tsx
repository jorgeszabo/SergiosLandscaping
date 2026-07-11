"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { priceLine, money, findIssue } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
import { compressImage } from "@/lib/image";
import { IconCamera } from "@/components/icons";
import type { Line, Severity } from "@/lib/data/types";

export function AddIssue() {
  const { insp, save, catalog } = useInspection();
  const { user } = useStore();
  const { t, nm, lang } = useI18n();
  const { view, navigate, back } = useNav();

  const isSystem = view.zn === "system";
  const [issueId, setIssueId] = useState("");
  const [attrVal, setAttrVal] = useState("");
  const [count, setCount] = useState(1);
  const [severity, setSeverity] = useState<Severity>("functional");
  const [action, setAction] = useState<"repair" | "replace">("repair");
  const [photos, setPhotos] = useState<string[]>([]);

  const def = findIssue(catalog, issueId);
  const canSeePrice = !!user?.permissions.seePrices;

  const preview = useMemo(() => {
    if (!issueId) return null;
    const line: Line = { id: "preview", kind: "issue", state: "on", count, issueId, attrVal };
    return priceLine(line, catalog, lang);
  }, [issueId, attrVal, count, catalog, lang]);

  const needAttr = !!def?.attr && !attrVal;

  const onPickIssue = (id: string) => {
    setIssueId(id);
    setAttrVal("");
    const d = findIssue(catalog, id);
    if (d) {
      setSeverity(d.severity);
      setAction(d.action);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    for (const f of files) {
      const compressed = await compressImage(f);
      setPhotos((p) => [...p, compressed]);
    }
  };
  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, x) => x !== i));

  const saveIssue = () => {
    if (!insp || !issueId) return;
    const line: Line = {
      id: uid(),
      kind: "issue",
      state: "on",
      count,
      issueId,
      attrVal,
      severity,
      action,
      photos,
      zone: isSystem ? "system" : (view.zn as number),
    };
    save({ ...insp, lines: [...insp.lines, line] });
    back();
  };

  if (!insp) return null;

  return (
    <div>
      <button className="backlink" onClick={back}>
        ‹ {t("back")}
      </button>
      <h1>{t("addIssue")}</h1>
      <p className="sub">{isSystem ? t("systemWide") : `${t("zone")} ${view.zn}`}</p>

      <div className="card stack">
        <div>
          <label className="f">{t("pickIssue")}</label>
          <select className="t" value={issueId} onChange={(e) => onPickIssue(e.target.value)}>
            <option value="" />
            {catalog.issues.map((i) => (
              <option key={i.id} value={i.id}>
                {nm(i.name)}
              </option>
            ))}
          </select>
        </div>

        {def?.attr && (
          <div>
            <label className="f">{nm(def.attr.name)}</label>
            <div className="pillbar">
              {def.attr.options.map((o) => (
                <button
                  key={o.val}
                  className={`chip ${attrVal === o.val ? "on" : ""}`}
                  onClick={() => setAttrVal(o.val)}
                >
                  {nm(o.label)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid2">
          <div>
            <label className="f">{t("count")}</label>
            <input
              className="t"
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value || "1")))}
            />
          </div>
          <div>
            <label className="f">{t("severity")}</label>
            <select className="t" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              <option value="safety">{t("safety")}</option>
              <option value="functional">{t("functional")}</option>
              <option value="efficiency">{t("efficiency")}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="f">
            {t("repair")} / {t("replace")}
          </label>
          <div className="pillbar">
            <button className={`chip ${action === "repair" ? "on" : ""}`} onClick={() => setAction("repair")}>
              {t("repair")}
            </button>
            <button className={`chip ${action === "replace" ? "on" : ""}`} onClick={() => setAction("replace")}>
              {t("replace")}
            </button>
          </div>
        </div>

        <div>
          <label className="f">{t("photo")}</label>
          <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {photos.map((src, i) => (
              <span key={i} style={{ position: "relative", display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="thumb" src={src} alt="" style={{ width: 56, height: 56 }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  style={{ position: "absolute", top: -6, right: -6, background: "var(--danger)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 13, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <label className="btn sm ghost" style={{ display: "inline-flex" }}>
              <input type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }} onChange={onPhoto} />
              <IconCamera size={16} /> {t("addPhoto")}
            </label>
          </div>
        </div>
      </div>

      {preview && (
        <div className="price-pop">
          <span className="lbl">
            {t("estAppears")}
            {preview.detail ? ` · ${preview.detail}` : ""}
          </span>
          {canSeePrice && <span className="amt">{money(preview.price)}</span>}
        </div>
      )}

      <button className="btn amber block" style={{ marginTop: 12 }} disabled={!issueId || needAttr} onClick={saveIssue}>
        {t("saveIssue")}
      </button>
    </div>
  );
}
