"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { priceLine, money, findIssue } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
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
  const [photo, setPhoto] = useState<string | null>(null);

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

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setPhoto(rd.result as string);
    rd.readAsDataURL(f);
  };

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
      photo,
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
          <label className="btn sm ghost" style={{ display: "inline-flex" }}>
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onPhoto} />
            📷 {t("addPhoto")}
          </label>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="thumb" src={photo} alt="" style={{ marginLeft: 8, verticalAlign: "middle" }} />
          )}
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
