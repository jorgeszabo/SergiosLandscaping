/* ---------------------------------------------------------------------------
   The money chain (Code handoff §3): issue + attributes → exact part / labor /
   assembly → price. Pure functions over a Catalog — no UI, no storage — so the
   engine can be unit-tested in isolation. Every screen prices through here.
   --------------------------------------------------------------------------- */
import type {
  Catalog,
  Lang,
  Line,
  Inspection,
  Part,
  LaborRate,
  IssueType,
  Assembly,
} from "@/lib/data/types";

/** Billed labor rate vs. loaded crew cost. Cost ≈ 60% of the billed rate.
    Admin-tunable later; kept as one constant so margin math stays honest. */
export const LABOR_COST_RATIO = 0.6;

export interface PricedLine {
  price: number;
  cost: number;
  /** Human-readable breakdown, e.g. "3× Hunter PGP rotor + Standard labor". */
  detail: string;
}

export interface InspectionTotals {
  price: number;
  cost: number;
  parts: number;
  labor: number;
  /** (price − cost) / price, in [0, 1]. */
  margin: number;
}

// ── catalog lookups ─────────────────────────────────────────────────────────

export const findPart = (c: Catalog, id?: string | null): Part | undefined =>
  id ? c.parts.find((p) => p.id === id) : undefined;
export const findLabor = (c: Catalog, id?: string | null): LaborRate | undefined =>
  id ? c.labor.find((l) => l.id === id) : undefined;
export const findIssue = (c: Catalog, id?: string | null): IssueType | undefined =>
  id ? c.issues.find((i) => i.id === id) : undefined;
export const findAssembly = (c: Catalog, id?: string | null): Assembly | undefined =>
  id ? c.assemblies.find((a) => a.id === id) : undefined;

/** Localized display name, falling back to English. */
export const nm = (o: { en: string; es: string } | undefined, lang: Lang): string =>
  o ? o[lang] || o.en : "";

export const laborLineCost = (rate: number, qty: number): number =>
  rate * qty * LABOR_COST_RATIO;

// ── line pricing ────────────────────────────────────────────────────────────

/** Price a single line. The core of the engine. */
export function priceLine(line: Line, catalog: Catalog, lang: Lang = "en"): PricedLine {
  const count = line.count || 1;

  if (line.kind === "issue") {
    const def = findIssue(catalog, line.issueId);
    if (!def) return { price: 0, cost: 0, detail: "" };
    let price = 0;
    let cost = 0;
    const bits: string[] = [];

    // 1. default part, possibly refined by the finding's attribute
    let partId = def.partId;
    if (def.attr && line.attrVal) {
      const opt = def.attr.options.find((o) => o.val === line.attrVal);
      if (opt) partId = opt.partId;
    }
    const part = findPart(catalog, partId);
    if (part) {
      price += part.price * count;
      cost += part.cost * count;
      bits.push(`${count}× ${nm(part.name, lang)}`);
    }

    // 2. labor attached to the fix
    const labor = findLabor(catalog, def.laborId);
    if (labor) {
      const qty = (labor.unit === "flat" ? 1 : def.laborQty) * count;
      price += labor.rate * qty;
      cost += laborLineCost(labor.rate, qty);
      bits.push(nm(labor.name, lang));
    }
    return { price, cost, detail: bits.join(" + ") };
  }

  if (line.kind === "part") {
    const p = findPart(catalog, line.refId);
    if (!p) return { price: 0, cost: 0, detail: "" };
    return {
      price: p.price * count,
      cost: p.cost * count,
      detail: `${count}× ${nm(p.name, lang)}`,
    };
  }

  if (line.kind === "labor") {
    const l = findLabor(catalog, line.refId);
    if (!l) return { price: 0, cost: 0, detail: "" };
    return {
      price: l.rate * count,
      cost: laborLineCost(l.rate, count),
      detail: `${count}${l.unit === "hour" ? " hr" : ""} ${nm(l.name, lang)}`,
    };
  }

  if (line.kind === "assembly") {
    const a = findAssembly(catalog, line.refId);
    if (!a) return { price: 0, cost: 0, detail: "" };
    let cost = 0;
    a.recipe.forEach((r) => {
      if (r.kind === "part") {
        const p = findPart(catalog, r.id);
        if (p) cost += p.cost * r.qty;
      } else {
        const l = findLabor(catalog, r.id);
        if (l) cost += laborLineCost(l.rate, r.qty);
      }
    });
    return { price: a.price * count, cost: cost * count, detail: nm(a.name, lang) };
  }

  if (line.kind === "local") {
    return {
      price: line.price || 0,
      cost: line.cost != null ? line.cost : line.price || 0,
      detail: line.name || "",
    };
  }

  return { price: 0, cost: 0, detail: "" };
}

/** Display name for a line (independent of its price breakdown). */
export function lineName(line: Line, catalog: Catalog, lang: Lang = "en"): string {
  if (line.kind === "issue") return nm(findIssue(catalog, line.issueId)?.name, lang) || "—";
  if (line.kind === "part") return nm(findPart(catalog, line.refId)?.name, lang) || "—";
  if (line.kind === "labor") return nm(findLabor(catalog, line.refId)?.name, lang) || "—";
  if (line.kind === "assembly") return nm(findAssembly(catalog, line.refId)?.name, lang) || "—";
  if (line.kind === "local") return line.name || "—";
  return "—";
}

/** Roll every on-quote line into totals + a parts/labor split + margin. */
export function inspectionTotals(insp: Inspection, catalog: Catalog): InspectionTotals {
  let price = 0;
  let cost = 0;
  let labor = 0;

  for (const line of insp.lines) {
    if (line.state !== "on") continue;
    const r = priceLine(line, catalog);
    price += r.price;
    cost += r.cost;

    // isolate the labor portion for the office parts/labor split
    if (line.kind === "labor") {
      labor += r.price;
    } else if (line.kind === "issue") {
      const def = findIssue(catalog, line.issueId);
      const l = findLabor(catalog, def?.laborId);
      if (def && l) {
        const qty = (l.unit === "flat" ? 1 : def.laborQty) * (line.count || 1);
        labor += l.rate * qty;
      }
    }
  }

  const parts = price - labor;
  const margin = price > 0 ? (price - cost) / price : 0;
  return { price, cost, parts, labor, margin };
}

/** "$1,234.00" — tabular currency formatting used across the app. */
export function money(n: number): string {
  return (
    "$" +
    (Math.round(n * 100) / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
