import { describe, it, expect } from "vitest";
import { SEED_CATALOG } from "@/lib/data/seed";
import {
  priceLine,
  inspectionTotals,
  lineName,
  money,
  LABOR_COST_RATIO,
} from "./engine";
import type { Inspection, Line } from "@/lib/data/types";

const cat = SEED_CATALOG;

function issueLine(over: Partial<Line>): Line {
  return { id: "x", kind: "issue", state: "on", count: 1, ...over };
}

describe("priceLine — issue lines (the money chain)", () => {
  it("prices a broken head with the rotor attribute and standard labor", () => {
    // rotor_pgp = $25, std labor $85 × 0.25 hr = $21.25 → $46.25
    const r = priceLine(issueLine({ issueId: "broken_head", attrVal: "rotor", count: 1 }), cat);
    expect(r.price).toBeCloseTo(25 + 85 * 0.25, 5);
    expect(r.detail).toContain("Rotor");
  });

  it("multiplies part + labor by count", () => {
    const one = priceLine(issueLine({ issueId: "broken_head", attrVal: "spray", count: 1 }), cat).price;
    const three = priceLine(issueLine({ issueId: "broken_head", attrVal: "spray", count: 3 }), cat).price;
    expect(three).toBeCloseTo(one * 3, 5);
  });

  it("selects the spray body when the head attribute is spray", () => {
    // spray_04 = $8, std $85 × 0.25 = $21.25 → $29.25
    const r = priceLine(issueLine({ issueId: "broken_head", attrVal: "spray" }), cat);
    expect(r.price).toBeCloseTo(8 + 85 * 0.25, 5);
  });

  it("prices a labor-only issue (no part) — adjust nozzles", () => {
    // std $85 × 0.15 = $12.75, no part
    const r = priceLine(issueLine({ issueId: "adjust_nozzles" }), cat);
    expect(r.price).toBeCloseTo(85 * 0.15, 5);
  });

  it("uses skilled labor for a main line leak", () => {
    // pvc_fittings $4 + skilled $110 × 1 = $114
    const r = priceLine(issueLine({ issueId: "leak_main", count: 1 }), cat);
    expect(r.price).toBeCloseTo(4 + 110 * 1, 5);
  });
});

describe("priceLine — part / labor / assembly / local", () => {
  it("prices a bare part line", () => {
    const r = priceLine({ id: "a", kind: "part", state: "on", count: 2, refId: "rotor_pgp" }, cat);
    expect(r.price).toBeCloseTo(25 * 2, 5);
    expect(r.cost).toBeCloseTo(10 * 2, 5);
  });

  it("prices an assembly at its recipe price and rolls up its cost", () => {
    const r = priceLine({ id: "a", kind: "assembly", state: "on", count: 1, refId: "new_zone" }, cat);
    expect(r.price).toBe(600);
    // cost = valve 16 + wire 0.2*50 + pvc .4*40 + rotor 10*4 + std labor 85*3*0.6
    const expected = 16 + 0.2 * 50 + 0.4 * 40 + 10 * 4 + 85 * 3 * LABOR_COST_RATIO;
    expect(r.cost).toBeCloseTo(expected, 5);
  });

  it("prices a local-purchase line with editable price and cost fallback", () => {
    const r = priceLine({ id: "a", kind: "local", state: "on", count: 1, name: "Special part", price: 40 }, cat);
    expect(r.price).toBe(40);
    expect(r.cost).toBe(40); // cost falls back to price when unset
  });
});

describe("inspectionTotals", () => {
  const insp: Inspection = {
    id: "i1",
    customer: "Test",
    address: "",
    city: "",
    tech: "Antonio",
    date: "2026-07-11",
    status: "draft",
    snapshot: { brand: "", model: "", stations: "4", backflow: "", pressure: "", rainSensor: "" },
    zones: [],
    lines: [
      issueLine({ id: "l1", issueId: "broken_head", attrVal: "rotor", count: 2 }),
      { id: "l2", kind: "labor", state: "on", count: 1, refId: "trip" },
      issueLine({ id: "l3", issueId: "over_pressure", count: 1, state: "deferred" }), // parked
    ],
  };

  it("sums only on-quote lines and computes margin", () => {
    const t = inspectionTotals(insp, cat);
    // on-quote: 2× broken head rotor = 2*(25 + 85*0.25) + trip $75
    const heads = 2 * (25 + 85 * 0.25);
    expect(t.price).toBeCloseTo(heads + 75, 5);
    expect(t.margin).toBeGreaterThan(0);
    expect(t.margin).toBeLessThanOrEqual(1);
  });

  it("excludes deferred/declined lines from the total", () => {
    const t = inspectionTotals(insp, cat);
    const withDeferred = inspectionTotals(
      { ...insp, lines: insp.lines.map((l) => ({ ...l, state: "on" as const })) },
      cat
    );
    expect(withDeferred.price).toBeGreaterThan(t.price);
  });

  it("splits parts vs labor", () => {
    const t = inspectionTotals(insp, cat);
    expect(t.parts + t.labor).toBeCloseTo(t.price, 5);
  });
});

describe("money + lineName", () => {
  it("formats currency", () => {
    expect(money(1234.5)).toBe("$1,234.50");
    expect(money(0)).toBe("$0.00");
  });

  it("localizes line names", () => {
    const l = issueLine({ issueId: "broken_head" });
    expect(lineName(l, cat, "en")).toBe("Broken head");
    expect(lineName(l, cat, "es")).toBe("Cabeza rota");
  });
});
