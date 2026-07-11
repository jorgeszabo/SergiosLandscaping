/* ---------------------------------------------------------------------------
   Demo / test data — realistic customers and inspections at each stage of the
   lifecycle. All records use the "demo-" id prefix so an admin can load and
   clear them cleanly from the app. Safe to run repeatedly.
   --------------------------------------------------------------------------- */
import type { Customer, Inspection, Line, Zone } from "./types";

export const DEMO_PREFIX = "demo-";

let seq = 0;
const lid = () => `${DEMO_PREFIX}l${++seq}`;

function issue(issueId: string, over: Partial<Line> = {}): Line {
  return { id: lid(), kind: "issue", state: "on", count: 1, issueId, ...over };
}
const zone = (n: number, waters: string[], heads: string[], schedule = "Mon/Wed/Fri 6am"): Zone => ({
  n, waters, heads, schedule, visited: true,
});

const SIG =
  "data:image/svg+xml;base64," +
  btoaSafe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M8 42 C30 8, 46 8, 60 32 S96 56, 120 28 S168 10, 192 40" stroke="#16211c" stroke-width="2.4" fill="none"/></svg>'
  );

function btoaSafe(s: string): string {
  try {
    return typeof btoa !== "undefined" ? btoa(s) : Buffer.from(s).toString("base64");
  } catch {
    return "";
  }
}

export function demoCustomers(): Customer[] {
  return [
    { id: DEMO_PREFIX + "c1", name: "Henderson Residence", address: "412 Lakeway Dr", city: "Montgomery, TX" },
    { id: DEMO_PREFIX + "c2", name: "Lake Conroe HOA", address: "88 Marina Blvd", city: "Conroe, TX" },
    { id: DEMO_PREFIX + "c3", name: "Alvarez Property", address: "1207 Pine Grove", city: "Willis, TX" },
    { id: DEMO_PREFIX + "c4", name: "April Sound #14", address: "14 April Wind S", city: "Montgomery, TX" },
    { id: DEMO_PREFIX + "c5", name: "Davis St. Commercial", address: "330 Davis St", city: "Conroe, TX" },
  ];
}

/** One inspection per lifecycle stage, newest first. `now` is passed in so the
    caller controls timestamps (keeps this pure/testable). */
export function demoInspections(now: number): Inspection[] {
  seq = 0;
  const day = 86_400_000;
  const mk = (
    n: number,
    cust: string,
    address: string,
    city: string,
    tech: string,
    status: Inspection["status"],
    zones: Zone[],
    lines: Line[],
    extra: Partial<Inspection> = {}
  ): Inspection => ({
    id: `${DEMO_PREFIX}i${n}`,
    customer: cust,
    address,
    city,
    tech,
    date: new Date(now - n * day).toISOString().slice(0, 10),
    status,
    snapshot: { brand: "Hunter", model: "X-Core", stations: String(zones.length), backflow: "PVB", pressure: "62", rainSensor: "yes" },
    zones,
    lines,
    updatedAt: now - n * 3_600_000,
    synced: true,
    ...extra,
  });

  return [
    mk(1, "Henderson Residence", "412 Lakeway Dr", "Montgomery, TX", "Antonio", "draft",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [
        issue("broken_head", { attrVal: "rotor", count: 2, severity: "functional", action: "replace", zone: 1 }),
        issue("adjust_nozzles", { count: 3, severity: "efficiency", action: "repair", zone: 2 }),
      ]),
    mk(2, "Lake Conroe HOA", "88 Marina Blvd", "Conroe, TX", "Luis", "submitted",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["turf"], ["spray"]), zone(3, ["beds"], ["drip"])],
      [
        issue("broken_nozzle", { attrVal: "spray", count: 4, severity: "functional", action: "replace", zone: 2 }),
        issue("leak_lateral", { count: 1, severity: "functional", action: "repair", zone: 1 }),
        issue("over_pressure", { count: 1, severity: "efficiency", action: "repair", zone: "system" }),
      ],
      { signature: SIG }),
    mk(3, "Alvarez Property", "1207 Pine Grove", "Willis, TX", "Antonio", "under_review",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [
        issue("exposed_wire", { count: 1, severity: "safety", action: "repair", zone: "system" }),
        issue("mixed_mfr", { attrVal: "rotor", count: 5, severity: "efficiency", action: "replace", zone: 1 }),
      ],
      { signature: SIG }),
    mk(4, "April Sound #14", "14 April Wind S", "Montgomery, TX", "Luis", "approved",
      [zone(1, ["turf"], ["spray"]), zone(2, ["turf"], ["rotor"])],
      [
        issue("broken_head", { attrVal: "spray", count: 3, severity: "functional", action: "replace", zone: 1 }),
        { id: lid(), kind: "assembly", state: "on", count: 1, refId: "new_zone" },
      ],
      { signature: SIG }),
    mk(5, "Davis St. Commercial", "330 Davis St", "Conroe, TX", "Antonio", "in_progress",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["turf"], ["rotor"]), zone(3, ["beds"], ["drip"]), zone(4, ["turf"], ["spray"])],
      [
        issue("leak_main", { count: 1, severity: "safety", action: "repair", zone: "system" }),
        issue("hydrozoning", { count: 1, severity: "efficiency", action: "replace", zone: 3 }),
      ],
      { signature: SIG }),
    mk(6, "Henderson Residence", "412 Lakeway Dr", "Montgomery, TX", "Luis", "completed",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [
        issue("broken_nozzle", { attrVal: "rotor", count: 2, severity: "functional", action: "replace", zone: 1 }),
        issue("raise_heads", { count: 4, severity: "functional", action: "repair", zone: 2 }),
      ],
      { signature: SIG, completionSignature: SIG }),
  ];
}
