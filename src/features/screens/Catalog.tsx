"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { money, findPart, findLabor, nm as engineNm } from "@/lib/money/engine";
import type { Catalog as CatalogT } from "@/lib/data/types";

type Tab = "parts" | "labor" | "assemblies" | "issues";

export function Catalog() {
  const { db, saveCatalog } = useStore();
  const { t, lang, nm } = useI18n();
  const toast = useToast();
  const { view, navigate } = useNav();
  const tab = (view.tab as Tab) || "parts";

  // Work on a local draft; write on Save.
  const [draft, setDraft] = useState<CatalogT>(() => structuredClone(db.catalog));

  const commit = async () => {
    await saveCatalog(draft);
    toast(t("edited"));
  };

  return (
    <div>
      <button className="backlink" onClick={() => navigate({ name: "home" })}>
        ‹ {t("back")}
      </button>
      <h1>{t("catTitle")}</h1>
      <p className="sub">{t("adminOnly")}</p>

      <div className="pillbar">
        {(["parts", "labor", "assemblies", "issues"] as Tab[]).map((tb) => (
          <button
            key={tb}
            className={`chip ${tab === tb ? "on" : ""}`}
            onClick={() => navigate({ name: "catalog", tab: tb })}
          >
            {t(tb === "parts" ? "tabParts" : tb === "labor" ? "tabLabor" : tb === "assemblies" ? "tabAssm" : "tabIssues")}
          </button>
        ))}
      </div>

      {tab === "parts" && (
        <>
          {draft.parts.map((p, i) => (
            <div key={p.id} className="card" style={{ padding: "12px 14px" }}>
              <div style={{ fontWeight: 600 }}>
                {nm(p.name)}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>
                  {p.brand} {p.sku ? "· " + p.sku : ""}
                </span>
              </div>
              <div className="grid2" style={{ marginTop: 8 }}>
                <div>
                  <label className="f" style={{ marginTop: 0 }}>
                    English
                  </label>
                  <input
                    className="t"
                    value={p.name.en}
                    onChange={(e) => {
                      const parts = [...draft.parts];
                      parts[i] = { ...p, name: { ...p.name, en: e.target.value } };
                      setDraft({ ...draft, parts });
                    }}
                  />
                </div>
                <div>
                  <label className="f" style={{ marginTop: 0 }}>
                    Español
                  </label>
                  <input
                    className="t"
                    value={p.name.es}
                    onChange={(e) => {
                      const parts = [...draft.parts];
                      parts[i] = { ...p, name: { ...p.name, es: e.target.value } };
                      setDraft({ ...draft, parts });
                    }}
                  />
                </div>
                <div>
                  <label className="f" style={{ marginTop: 0 }}>
                    {t("unitCost")}
                  </label>
                  <input
                    className="t"
                    type="number"
                    value={p.cost}
                    onChange={(e) => {
                      const parts = [...draft.parts];
                      parts[i] = { ...p, cost: parseFloat(e.target.value || "0") };
                      setDraft({ ...draft, parts });
                    }}
                  />
                </div>
                <div>
                  <label className="f" style={{ marginTop: 0 }}>
                    {t("sellPrice")}
                  </label>
                  <input
                    className="t"
                    type="number"
                    value={p.price}
                    onChange={(e) => {
                      const parts = [...draft.parts];
                      parts[i] = { ...p, price: parseFloat(e.target.value || "0") };
                      setDraft({ ...draft, parts });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "labor" && (
        <>
          {draft.labor.map((l, i) => (
            <div key={l.id} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{nm(l.name)}</div>
                <div className="m" style={{ fontSize: 12, color: "var(--muted)" }}>
                  {l.unit}
                </div>
              </div>
              <div style={{ width: 110 }}>
                <input
                  className="t"
                  type="number"
                  value={l.rate}
                  onChange={(e) => {
                    const labor = [...draft.labor];
                    labor[i] = { ...l, rate: parseFloat(e.target.value || "0") };
                    setDraft({ ...draft, labor });
                  }}
                />
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "assemblies" && (
        <>
          {draft.assemblies.map((a, i) => {
            const rec = a.recipe
              .map((r) => {
                const item = r.kind === "part" ? findPart(draft, r.id) : findLabor(draft, r.id);
                return `${r.qty}× ${item ? engineNm(item.name, lang) : r.id}`;
              })
              .join(" · ");
            return (
              <div key={a.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 600, flex: 1 }}>{nm(a.name)}</div>
                  <div style={{ width: 110 }}>
                    <input
                      className="t"
                      type="number"
                      value={a.price}
                      onChange={(e) => {
                        const assemblies = [...draft.assemblies];
                        assemblies[i] = { ...a, price: parseFloat(e.target.value || "0") };
                        setDraft({ ...draft, assemblies });
                      }}
                    />
                  </div>
                </div>
                <div className="note">
                  {t("recipe")}: {rec}
                </div>
                <button
                  className={`chip ${a.rolled ? "on" : ""}`}
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    const assemblies = [...draft.assemblies];
                    assemblies[i] = { ...a, rolled: !a.rolled };
                    setDraft({ ...draft, assemblies });
                  }}
                >
                  {a.rolled ? t("rolled") : t("itemized")}
                </button>
              </div>
            );
          })}
        </>
      )}

      {tab === "issues" && (
        <>
          {draft.issues.map((iss) => {
            const fixParts: string[] = [];
            const p = findPart(draft, iss.partId);
            if (p) fixParts.push(engineNm(p.name, lang));
            if (iss.attr) fixParts.push(engineNm(iss.attr.name, lang) + " →");
            const l = findLabor(draft, iss.laborId);
            if (l) fixParts.push(engineNm(l.name, lang));
            return (
              <div key={iss.id} className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 600 }}>
                  <span className={`sev ${iss.severity}`} />
                  {nm(iss.name)}
                </div>
                <div className="m" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {t(iss.action)} · {fixParts.join(" + ") || "labor"}
                </div>
              </div>
            );
          })}
        </>
      )}

      {tab !== "issues" && (
        <button className="btn pri block" onClick={commit}>
          {t("save")}
        </button>
      )}
    </div>
  );
}
