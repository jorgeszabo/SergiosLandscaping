"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { money, findPart, findLabor, nm as engineNm } from "@/lib/money/engine";
import { IconSearch, IconChevronRight, IconChevronLeft } from "@/components/icons";
import type { Catalog as CatalogT } from "@/lib/data/types";

type Tab = "parts" | "labor" | "assemblies" | "issues";

export function Catalog() {
  const { db, saveCatalog } = useStore();
  const { t, lang, nm } = useI18n();
  const toast = useToast();
  const { view, navigate } = useNav();
  const tab = (view.tab as Tab) || "parts";

  const [draft, setDraft] = useState<CatalogT>(() => structuredClone(db.catalog));
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const save = async (next: CatalogT) => {
    setDraft(next);
    await saveCatalog(next);
    toast(t("edited"));
  };

  const match = (s: string) => s.toLowerCase().includes(q.trim().toLowerCase());

  // ---- detail editors ----
  if (editId) {
    const back = () => setEditId(null);
    if (tab === "parts") {
      const i = draft.parts.findIndex((p) => p.id === editId);
      const p = draft.parts[i];
      if (!p) return null;
      const set = (patch: Partial<typeof p>) => {
        const parts = [...draft.parts];
        parts[i] = { ...p, ...patch };
        setDraft({ ...draft, parts });
      };
      return (
        <DetailWrap title={nm(p.name)} onBack={back}>
          <div className="grid2">
            <Field label="English"><input className="t" value={p.name.en} onChange={(e) => set({ name: { ...p.name, en: e.target.value } })} /></Field>
            <Field label="Español"><input className="t" value={p.name.es} onChange={(e) => set({ name: { ...p.name, es: e.target.value } })} /></Field>
            <Field label={t("unitCost")}><input className="t" type="number" value={p.cost} onChange={(e) => set({ cost: parseFloat(e.target.value || "0") })} /></Field>
            <Field label={t("sellPrice")}><input className="t" type="number" value={p.price} onChange={(e) => set({ price: parseFloat(e.target.value || "0") })} /></Field>
          </div>
          <div className="note" style={{ marginTop: 10 }}>{p.brand} {p.model ? "· " + p.model : ""} {p.sku ? "· " + p.sku : ""} · {p.unit}</div>
          <SaveBtn onClick={() => save(draft).then(back)} label={t("save")} />
        </DetailWrap>
      );
    }
    if (tab === "labor") {
      const i = draft.labor.findIndex((l) => l.id === editId);
      const l = draft.labor[i];
      if (!l) return null;
      const set = (patch: Partial<typeof l>) => {
        const labor = [...draft.labor];
        labor[i] = { ...l, ...patch };
        setDraft({ ...draft, labor });
      };
      return (
        <DetailWrap title={nm(l.name)} onBack={back}>
          <div className="grid2">
            <Field label="English"><input className="t" value={l.name.en} onChange={(e) => set({ name: { ...l.name, en: e.target.value } })} /></Field>
            <Field label="Español"><input className="t" value={l.name.es} onChange={(e) => set({ name: { ...l.name, es: e.target.value } })} /></Field>
          </div>
          <Field label={`${t("priceEach")} (${l.unit})`}><input className="t" type="number" value={l.rate} onChange={(e) => set({ rate: parseFloat(e.target.value || "0") })} /></Field>
          <SaveBtn onClick={() => save(draft).then(back)} label={t("save")} />
        </DetailWrap>
      );
    }
    if (tab === "assemblies") {
      const i = draft.assemblies.findIndex((a) => a.id === editId);
      const a = draft.assemblies[i];
      if (!a) return null;
      const set = (patch: Partial<typeof a>) => {
        const assemblies = [...draft.assemblies];
        assemblies[i] = { ...a, ...patch };
        setDraft({ ...draft, assemblies });
      };
      const rec = a.recipe
        .map((r) => {
          const it = r.kind === "part" ? findPart(draft, r.id) : findLabor(draft, r.id);
          return `${r.qty}× ${it ? engineNm(it.name, lang) : r.id}`;
        })
        .join(" · ");
      return (
        <DetailWrap title={nm(a.name)} onBack={back}>
          <div className="grid2">
            <Field label="English"><input className="t" value={a.name.en} onChange={(e) => set({ name: { ...a.name, en: e.target.value } })} /></Field>
            <Field label="Español"><input className="t" value={a.name.es} onChange={(e) => set({ name: { ...a.name, es: e.target.value } })} /></Field>
          </div>
          <Field label={t("priceEach")}><input className="t" type="number" value={a.price} onChange={(e) => set({ price: parseFloat(e.target.value || "0") })} /></Field>
          <Field label={t("recipe")}><div className="note" style={{ marginTop: 0 }}>{rec}</div></Field>
          <button className={`chip ${a.rolled ? "on" : ""}`} style={{ marginTop: 4 }} onClick={() => set({ rolled: !a.rolled })}>
            {a.rolled ? t("rolled") : t("itemized")}
          </button>
          <SaveBtn onClick={() => save(draft).then(back)} label={t("save")} />
        </DetailWrap>
      );
    }
  }

  // ---- list views ----
  const rows = (() => {
    if (tab === "parts")
      return draft.parts
        .filter((p) => match(p.name.en) || match(p.name.es) || match(p.brand || "") || match(p.sku || ""))
        .map((p) => ({ id: p.id, title: nm(p.name), meta: [p.brand, p.sku].filter(Boolean).join(" · "), right: money(p.price), editable: true }));
    if (tab === "labor")
      return draft.labor
        .filter((l) => match(l.name.en) || match(l.name.es))
        .map((l) => ({ id: l.id, title: nm(l.name), meta: l.unit, right: money(l.rate), editable: true }));
    if (tab === "assemblies")
      return draft.assemblies
        .filter((a) => match(a.name.en) || match(a.name.es))
        .map((a) => ({ id: a.id, title: nm(a.name), meta: a.rolled ? t("rolled") : t("itemized"), right: money(a.price), editable: true }));
    // issues (read-only)
    return draft.issues
      .filter((i) => match(i.name.en) || match(i.name.es))
      .map((iss) => {
        const bits: string[] = [];
        const p = findPart(draft, iss.partId);
        if (p) bits.push(engineNm(p.name, lang));
        if (iss.attr) bits.push(engineNm(iss.attr.name, lang) + " →");
        const l = findLabor(draft, iss.laborId);
        if (l) bits.push(engineNm(l.name, lang));
        return { id: iss.id, title: nm(iss.name), meta: `${t(iss.action)} · ${bits.join(" + ") || "labor"}`, right: "", editable: false, sev: iss.severity };
      });
  })();

  const TABS: Tab[] = ["parts", "labor", "assemblies", "issues"];

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="pillbar">
        {TABS.map((tb) => (
          <button
            key={tb}
            className={`chip ${tab === tb ? "on" : ""}`}
            onClick={() => { navigate({ name: "catalog", tab: tb }); setEditId(null); setQ(""); }}
          >
            {t(tb === "parts" ? "tabParts" : tb === "labor" ? "tabLabor" : tb === "assemblies" ? "tabAssm" : "tabIssues")}
          </button>
        ))}
      </div>

      <div className="row" style={{ gap: 8, background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0 12px", height: 42, margin: "4px 0 12px" }}>
        <IconSearch size={17} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "var(--text-strong)" }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="list" style={{ padding: "0 14px" }}>
          {rows.length === 0 && <div className="empty">{t("nothingHere")}</div>}
          {rows.map((r) => (
            <button
              key={r.id}
              className="item"
              style={{ cursor: r.editable ? "pointer" : "default" }}
              onClick={() => r.editable && setEditId(r.id)}
            >
              <div className="g">
                <div className="n">
                  {"sev" in r && r.sev ? <span className={`sev ${r.sev}`} /> : null}
                  {r.title}
                </div>
                <div className="m">{r.meta}</div>
              </div>
              {r.right && <div className="money">{r.right}</div>}
              {r.editable && <span style={{ color: "var(--text-muted)" }}><IconChevronRight size={18} /></span>}
            </button>
          ))}
        </div>
      </div>
      <p className="sub" style={{ marginTop: 10, fontSize: 12.5 }}>
        {rows.length} {t("itemsCount")}
      </p>
    </div>
  );
}

function DetailWrap({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <button className="backlink" onClick={onBack}>
        <IconChevronLeft size={16} /> {title}
      </button>
      <div className="card stack" style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="f" style={{ marginTop: 0 }}>{label}</label>
      {children}
    </div>
  );
}
function SaveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="btn pri block" style={{ marginTop: 6 }} onClick={onClick}>
      {label}
    </button>
  );
}
