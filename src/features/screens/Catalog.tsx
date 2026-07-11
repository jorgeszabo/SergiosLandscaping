"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { money, findPart, findLabor, nm as engineNm } from "@/lib/money/engine";
import { uid } from "@/lib/data/id";
import { SEED_CATALOG } from "@/lib/data/seed";
import { PART_TYPES } from "@/lib/data/part-types";
import { IconSearch, IconChevronRight, IconChevronLeft, IconPlus, IconTrash } from "@/components/icons";
import type {
  Assembly, Catalog as CatalogT, IssueType, Lang, LaborRate, Part, Severity, Unit,
} from "@/lib/data/types";

type Tab = "parts" | "labor" | "assemblies" | "issues";
type EditItem = Part | LaborRate | Assembly | IssueType;

// Component-type groups for the parts list, in display order, with bilingual
// labels. Unknown/custom categories fall back to the raw string.
const CATEGORY_ORDER = [
  "Controller", "Valve", "Spray Head", "Spray Nozzle", "Rotor", "Drip",
  "Backflow", "Sensor", "Pipe & Fittings", "Wire & Electrical", "Valve Box", "Consumables",
];
const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  Controller: { en: "Controllers", es: "Controladores" },
  Valve: { en: "Valves", es: "Válvulas" },
  "Spray Head": { en: "Spray heads", es: "Aspersores emergentes" },
  "Spray Nozzle": { en: "Spray nozzles", es: "Boquillas" },
  Rotor: { en: "Rotors", es: "Rotores" },
  Drip: { en: "Drip", es: "Goteo" },
  Backflow: { en: "Backflow", es: "Antisifón" },
  Sensor: { en: "Sensors", es: "Sensores" },
  "Pipe & Fittings": { en: "Pipe & fittings", es: "Tubería y conexiones" },
  "Wire & Electrical": { en: "Wire & electrical", es: "Cable y eléctrico" },
  "Valve Box": { en: "Valve boxes", es: "Cajas de válvula" },
  Consumables: { en: "Consumables", es: "Consumibles" },
};

const blankPart = (): Part => ({ id: "part_" + uid(), name: { en: "", es: "" }, unit: "each", cost: 0, price: 0, onHand: true });
const blankLabor = (): LaborRate => ({ id: "labor_" + uid(), name: { en: "", es: "" }, unit: "hour", rate: 0 });
const blankAssembly = (): Assembly => ({ id: "asm_" + uid(), name: { en: "", es: "" }, recipe: [], price: 0, rolled: true });
const blankIssue = (): IssueType => ({ id: "issue_" + uid(), name: { en: "", es: "" }, severity: "functional", action: "repair", partId: null, laborId: null, laborQty: 0.25, attr: null });

export function Catalog() {
  const { db, saveCatalog } = useStore();
  const { t, lang, nm } = useI18n();
  const toast = useToast();
  const { view, navigate } = useNav();
  const tab = (view.tab as Tab) || "parts";

  const [draft, setDraft] = useState<CatalogT>(() => structuredClone(db.catalog));
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [edit, setEdit] = useState<EditItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  // For parts: whether the admin is typing a custom (off-dictionary) name
  // instead of picking a predefined component type.
  const [partCustom, setPartCustom] = useState(false);
  const catLabel = (cat: string) =>
    cat === "__unc" ? t("catUncategorized") : CATEGORY_LABELS[cat]?.[lang as Lang] ?? cat;

  const loadStarter = async () => {
    const mergeById = <T extends { id: string }>(cur: T[], seed: T[]): T[] => {
      const ids = new Set(cur.map((x) => x.id));
      return [...cur, ...seed.filter((s) => !ids.has(s.id))];
    };
    const next: CatalogT = {
      parts: mergeById(draft.parts, SEED_CATALOG.parts),
      labor: mergeById(draft.labor, SEED_CATALOG.labor),
      assemblies: mergeById(draft.assemblies, SEED_CATALOG.assemblies),
      issues: mergeById(draft.issues, SEED_CATALOG.issues),
    };
    setDraft(next);
    await saveCatalog(next);
    toast(t("starterLoaded"));
  };

  const persist = async (next: CatalogT) => {
    setDraft(next);
    await saveCatalog(next);
    toast(t("edited"));
  };
  const match = (s: string) => s.toLowerCase().includes(q.trim().toLowerCase());

  const openEdit = (item: EditItem) => {
    setEdit(structuredClone(item));
    setIsNew(false);
    // Off-dictionary existing part → start in custom-name mode.
    setPartCustom(tab === "parts" && !!item.name.en && !PART_TYPES.some((pt) => pt.name.en === item.name.en));
  };
  const openNew = () => {
    setIsNew(true);
    setPartCustom(false);
    setEdit(tab === "parts" ? blankPart() : tab === "labor" ? blankLabor() : tab === "assemblies" ? blankAssembly() : blankIssue());
  };
  const close = () => setEdit(null);

  const upsertInto = <K extends keyof CatalogT>(key: K, item: EditItem): CatalogT => {
    const arr = draft[key] as unknown as EditItem[];
    const i = arr.findIndex((x) => x.id === item.id);
    const next = i >= 0 ? arr.map((x) => (x.id === item.id ? item : x)) : [...arr, item];
    return { ...draft, [key]: next };
  };
  const removeFrom = <K extends keyof CatalogT>(key: K, id: string): CatalogT => {
    const arr = draft[key] as unknown as EditItem[];
    return { ...draft, [key]: arr.filter((x) => x.id !== id) };
  };
  const keyFor = (tb: Tab): keyof CatalogT =>
    tb === "parts" ? "parts" : tb === "labor" ? "labor" : tb === "assemblies" ? "assemblies" : "issues";

  const saveEdit = async () => {
    if (!edit) return;
    await persist(upsertInto(keyFor(tab), edit));
    close();
  };
  const deleteEdit = async () => {
    if (!edit) return;
    await persist(removeFrom(keyFor(tab), edit.id));
    close();
  };

  // ── detail editor ──────────────────────────────────────────────────────────
  if (edit) {
    const set = (patch: Partial<EditItem>) => setEdit({ ...edit, ...patch } as EditItem);
    const title = nm(edit.name) || t(isNew ? "addUser" : "edit");
    return (
      <div style={{ maxWidth: 560 }}>
        <button className="backlink" onClick={close}>
          <IconChevronLeft size={16} /> {t("back")}
        </button>
        <div className="card stack" style={{ marginTop: 8 }}>
          {tab === "parts" ? (
            <>
              <Field label={t("componentType")}>
                <select
                  className="t"
                  value={partCustom ? "__custom" : (PART_TYPES.find((pt) => pt.name.en === edit.name.en)?.id ?? "")}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__custom") { setPartCustom(true); return; }
                    setPartCustom(false);
                    if (v === "") { set({ name: { en: "", es: "" } }); return; }
                    const pt = PART_TYPES.find((x) => x.id === v);
                    if (pt) set({ name: { ...pt.name }, category: pt.category, unit: pt.unit } as Partial<EditItem>);
                  }}
                >
                  <option value="">{t("chooseType")}</option>
                  {CATEGORY_ORDER.filter((c) => PART_TYPES.some((pt) => pt.category === c)).map((c) => (
                    <optgroup key={c} label={catLabel(c)}>
                      {PART_TYPES.filter((pt) => pt.category === c).map((pt) => (
                        <option key={pt.id} value={pt.id}>{nm(pt.name)}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__custom">{t("customType")}</option>
                </select>
              </Field>
              {partCustom ? (
                <div className="grid2">
                  <Field label="English"><input className="t" value={edit.name.en} onChange={(e) => set({ name: { ...edit.name, en: e.target.value } })} /></Field>
                  <Field label="Español"><input className="t" value={edit.name.es} onChange={(e) => set({ name: { ...edit.name, es: e.target.value } })} /></Field>
                </div>
              ) : edit.name.en ? (
                <div className="note">
                  <b style={{ color: "var(--text-strong)" }}>{edit.name.en}</b> · {edit.name.es}
                  <div style={{ marginTop: 2 }}>{t("typeFillsName")}</div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="grid2">
              <Field label="English"><input className="t" value={edit.name.en} onChange={(e) => set({ name: { ...edit.name, en: e.target.value } })} /></Field>
              <Field label="Español"><input className="t" value={edit.name.es} onChange={(e) => set({ name: { ...edit.name, es: e.target.value } })} /></Field>
            </div>
          )}

          {tab === "parts" && <PartFields p={edit as Part} set={set} t={t} />}
          {tab === "labor" && <LaborFields l={edit as LaborRate} set={set} t={t} />}
          {tab === "assemblies" && <AssemblyFields a={edit as Assembly} set={set} draft={draft} t={t} nm={nm} />}
          {tab === "issues" && <IssueFields iss={edit as IssueType} set={set} draft={draft} t={t} nm={nm} />}
        </div>

        <button className="btn pri block" disabled={!edit.name.en.trim()} onClick={saveEdit}>{t("save")}</button>
        {!isNew && (
          <button className="btn danger block ghost" style={{ marginTop: 8 }} onClick={deleteEdit}>
            <IconTrash size={16} /> {t("remove")}
          </button>
        )}
      </div>
    );
  }

  // ── list ─────────────────────────────────────────────────────────────────────
  const rows: { id: string; item: EditItem; title: string; meta: string; right: string; sev?: Severity }[] = (() => {
    if (tab === "parts")
      return draft.parts.filter((p) => match(p.name.en) || match(p.name.es) || match(p.brand || "") || match(p.sku || ""))
        .map((p) => ({ id: p.id, item: p, title: nm(p.name), meta: [p.brand, p.sku].filter(Boolean).join(" · "), right: money(p.price) }));
    if (tab === "labor")
      return draft.labor.filter((l) => match(l.name.en) || match(l.name.es))
        .map((l) => ({ id: l.id, item: l, title: nm(l.name), meta: t("unit_" + l.unit), right: money(l.rate) }));
    if (tab === "assemblies")
      return draft.assemblies.filter((a) => match(a.name.en) || match(a.name.es))
        .map((a) => ({ id: a.id, item: a, title: nm(a.name), meta: a.rolled ? t("rolled") : t("itemized"), right: money(a.price) }));
    return draft.issues.filter((i) => match(i.name.en) || match(i.name.es))
      .map((iss) => {
        const bits: string[] = [];
        const p = findPart(draft, iss.partId);
        if (p) bits.push(engineNm(p.name, lang));
        if (iss.attr) bits.push(engineNm(iss.attr.name, lang) + " →");
        const l = findLabor(draft, iss.laborId);
        if (l) bits.push(engineNm(l.name, lang));
        return { id: iss.id, item: iss, title: nm(iss.name), meta: `${t(iss.action)} · ${bits.join(" + ") || "labor"}`, right: "", sev: iss.severity };
      });
  })();

  // Parts grouped by component type (category), for the friendlier list.
  const catOf = (p: Part) => p.category || "__unc";
  const partMatches = draft.parts.filter(
    (p) => match(p.name.en) || match(p.name.es) || match(p.brand || "") || match(p.sku || "")
  );
  const presentCats = [
    ...CATEGORY_ORDER,
    ...draft.parts.map(catOf).filter((c) => c !== "__unc" && !CATEGORY_ORDER.includes(c)),
  ]
    .filter((c, i, a) => a.indexOf(c) === i)
    .filter((c) => draft.parts.some((p) => catOf(p) === c));
  const filterCats = [...presentCats, ...(draft.parts.some((p) => catOf(p) === "__unc") ? ["__unc"] : [])];
  const groupCats = catFilter === "all" ? filterCats : [catFilter];
  const partGroups = groupCats
    .map((cat) => ({ cat, items: partMatches.filter((p) => catOf(p) === cat) }))
    .filter((g) => g.items.length > 0);

  const TABS: Tab[] = ["parts", "labor", "assemblies", "issues"];

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="pillbar">
        {TABS.map((tb) => (
          <button key={tb} className={`chip ${tab === tb ? "on" : ""}`} onClick={() => { navigate({ name: "catalog", tab: tb }); setQ(""); setCatFilter("all"); }}>
            {t(tb === "parts" ? "tabParts" : tb === "labor" ? "tabLabor" : tb === "assemblies" ? "tabAssm" : "tabIssues")}
          </button>
        ))}
      </div>

      <div className="row" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 8, flex: 1, background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0 12px", height: 42 }}>
          <IconSearch size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "var(--text-strong)" }} />
        </div>
        <button className="btn pri" style={{ whiteSpace: "nowrap" }} onClick={openNew}>
          <IconPlus size={16} /> {t("addUser") === "Add person" ? "Add" : "Nuevo"}
        </button>
      </div>

      {tab === "parts" && filterCats.length > 1 && (
        <div className="pillbar" style={{ marginTop: 10 }}>
          <button className={`chip ${catFilter === "all" ? "on" : ""}`} onClick={() => setCatFilter("all")}>{t("all")}</button>
          {filterCats.map((c) => (
            <button key={c} className={`chip ${catFilter === c ? "on" : ""}`} onClick={() => setCatFilter(c)}>{catLabel(c)}</button>
          ))}
        </div>
      )}

      {tab === "parts" ? (
        <>
          <div className="card" style={{ padding: 0, marginTop: 12 }}>
            {partGroups.length === 0 && <div className="empty">{t("nothingHere")}</div>}
            {partGroups.map((g) => (
              <div key={g.cat}>
                {catFilter === "all" && (
                  <div className="cathdr">{catLabel(g.cat)} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({g.items.length})</span></div>
                )}
                <div className="list" style={{ padding: "0 14px" }}>
                  {g.items.map((p) => (
                    <button key={p.id} className="item" onClick={() => openEdit(p)}>
                      <div className="g">
                        <div className="n">{nm(p.name)}</div>
                        <div className="m">{[p.brand, p.sku].filter(Boolean).join(" · ")}</div>
                      </div>
                      <div className="money">{money(p.price)}</div>
                      <span style={{ color: "var(--text-muted)" }}><IconChevronRight size={18} /></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 10, fontSize: 12.5 }}>{partMatches.length} {t("itemsCount")}</p>
          <div className="note" style={{ marginTop: 4 }}>
            {t("loadStarterHint")}
            <div style={{ marginTop: 8 }}>
              <button className="btn sm" onClick={loadStarter}><IconPlus size={14} /> {t("loadStarter")}</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card" style={{ padding: 0, marginTop: 12 }}>
            <div className="list" style={{ padding: "0 14px" }}>
              {rows.length === 0 && <div className="empty">{t("nothingHere")}</div>}
              {rows.map((r) => (
                <button key={r.id} className="item" onClick={() => openEdit(r.item)}>
                  <div className="g">
                    <div className="n">{r.sev ? <span className={`sev ${r.sev}`} /> : null}{r.title}</div>
                    <div className="m">{r.meta}</div>
                  </div>
                  {r.right && <div className="money">{r.right}</div>}
                  <span style={{ color: "var(--text-muted)" }}><IconChevronRight size={18} /></span>
                </button>
              ))}
            </div>
          </div>
          <p className="sub" style={{ marginTop: 10, fontSize: 12.5 }}>{rows.length} {t("itemsCount")}</p>
        </>
      )}
    </div>
  );
}

// ── per-type field groups ────────────────────────────────────────────────────
const UNITS: Unit[] = ["each", "set", "ft", "flat", "hour", "foot"];

function PartFields({ p, set, t }: { p: Part; set: (patch: Partial<Part>) => void; t: (k: string) => string }) {
  return (
    <>
      <div className="grid2">
        <Field label={t("unitCost")}><input className="t" type="number" value={p.cost} onChange={(e) => set({ cost: parseFloat(e.target.value || "0") })} /></Field>
        <Field label={t("sellPrice")}><input className="t" type="number" value={p.price} onChange={(e) => set({ price: parseFloat(e.target.value || "0") })} /></Field>
        <Field label={t("unitLabel")}><select className="t" value={p.unit} onChange={(e) => set({ unit: e.target.value as Unit })}>{UNITS.map((u) => <option key={u} value={u}>{t("unit_" + u)}</option>)}</select></Field>
        <Field label={t("catCategory")}>
          <input className="t" list="catlist" value={p.category || ""} onChange={(e) => set({ category: e.target.value })} />
          <datalist id="catlist">{CATEGORY_ORDER.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label={t("brandLabel")}><input className="t" value={p.brand || ""} onChange={(e) => set({ brand: e.target.value })} /></Field>
        <Field label="SKU"><input className="t" value={p.sku || ""} onChange={(e) => set({ sku: e.target.value })} /></Field>
        <Field label={t("vendorLabel")}><input className="t" value={p.vendor || ""} onChange={(e) => set({ vendor: e.target.value })} /></Field>
      </div>
    </>
  );
}

function LaborFields({ l, set, t }: { l: LaborRate; set: (patch: Partial<LaborRate>) => void; t: (k: string) => string }) {
  return (
    <div className="grid2">
      <Field label={t("priceEach")}><input className="t" type="number" value={l.rate} onChange={(e) => set({ rate: parseFloat(e.target.value || "0") })} /></Field>
      <Field label={t("unitLabel")}>
        <select className="t" value={l.unit} onChange={(e) => set({ unit: e.target.value as LaborRate["unit"] })}>
          <option value="flat">{t("unit_flat")}</option><option value="hour">{t("unit_hour")}</option><option value="foot">{t("unit_foot")}</option>
        </select>
      </Field>
    </div>
  );
}

function AssemblyFields({ a, set, draft, t, nm }: { a: Assembly; set: (patch: Partial<Assembly>) => void; draft: CatalogT; t: (k: string) => string; nm: (o: { en: string; es: string }) => string }) {
  const [addKind, setAddKind] = useState<"part" | "labor">("part");
  const [addId, setAddId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const opts = addKind === "part" ? draft.parts : draft.labor;
  const addRow = () => {
    const id = addId || opts[0]?.id;
    if (!id) return;
    set({ recipe: [...a.recipe, { kind: addKind, id, qty: addQty }] });
    setAddId(""); setAddQty(1);
  };
  return (
    <>
      <Field label={t("priceEach")}><input className="t" type="number" value={a.price} onChange={(e) => set({ price: parseFloat(e.target.value || "0") })} /></Field>
      <Field label={t("recipe")}>
        <div className="stack">
          {a.recipe.map((r, i) => {
            const it = r.kind === "part" ? draft.parts.find((p) => p.id === r.id) : draft.labor.find((l) => l.id === r.id);
            return (
              <div key={i} className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>{r.qty}× {it ? nm(it.name) : r.id}</span>
                <button className="btn sm danger ghost" onClick={() => set({ recipe: a.recipe.filter((_, x) => x !== i) })}>{t("remove")}</button>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <select className="t" style={{ width: "auto" }} value={addKind} onChange={(e) => { setAddKind(e.target.value as "part" | "labor"); setAddId(""); }}>
            <option value="part">{t("tabParts")}</option><option value="labor">{t("tabLabor")}</option>
          </select>
          <select className="t" style={{ flex: 1, minWidth: 120 }} value={addId} onChange={(e) => setAddId(e.target.value)}>
            {opts.map((o) => <option key={o.id} value={o.id}>{nm(o.name)}</option>)}
          </select>
          <input className="t" style={{ width: 70 }} type="number" min={0} step={0.25} value={addQty} onChange={(e) => setAddQty(parseFloat(e.target.value || "1"))} />
          <button className="btn sm" onClick={addRow}><IconPlus size={14} /></button>
        </div>
      </Field>
      <button className={`chip ${a.rolled ? "on" : ""}`} style={{ marginTop: 4 }} onClick={() => set({ rolled: !a.rolled })}>
        {a.rolled ? t("rolled") : t("itemized")}
      </button>
    </>
  );
}

function IssueFields({ iss, set, draft, t, nm }: { iss: IssueType; set: (patch: Partial<IssueType>) => void; draft: CatalogT; t: (k: string) => string; nm: (o: { en: string; es: string }) => string }) {
  const SEV: Severity[] = ["safety", "functional", "efficiency"];
  return (
    <>
      <Field label={t("severity")}>
        <div className="pillbar">
          {SEV.map((s) => <button key={s} className={`chip ${iss.severity === s ? "on" : ""}`} onClick={() => set({ severity: s })}>{t(s)}</button>)}
        </div>
      </Field>
      <Field label={`${t("repair")} / ${t("replace")}`}>
        <div className="pillbar">
          <button className={`chip ${iss.action === "repair" ? "on" : ""}`} onClick={() => set({ action: "repair" })}>{t("repair")}</button>
          <button className={`chip ${iss.action === "replace" ? "on" : ""}`} onClick={() => set({ action: "replace" })}>{t("replace")}</button>
        </div>
      </Field>
      <div className="grid2">
        <Field label={t("tabParts")}>
          <select className="t" value={iss.partId || ""} onChange={(e) => set({ partId: e.target.value || null })}>
            <option value="">—</option>
            {draft.parts.map((p) => <option key={p.id} value={p.id}>{nm(p.name)}</option>)}
          </select>
        </Field>
        <Field label={t("tabLabor")}>
          <select className="t" value={iss.laborId || ""} onChange={(e) => set({ laborId: e.target.value || null })}>
            <option value="">—</option>
            {draft.labor.map((l) => <option key={l.id} value={l.id}>{nm(l.name)}</option>)}
          </select>
        </Field>
      </div>
      <Field label={`${t("laborL")} × ${t("count")}`}>
        <input className="t" type="number" step={0.05} min={0} value={iss.laborQty} onChange={(e) => set({ laborQty: parseFloat(e.target.value || "0") })} />
      </Field>
      {iss.attr && <div className="note">{nm(iss.attr.name)}: {iss.attr.options.map((o) => nm(o.label)).join(" · ")}</div>}
    </>
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
