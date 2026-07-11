/* ---------------------------------------------------------------------------
   Demo / test data — realistic customers and inspections across the whole
   lifecycle. Used by Training mode, which swaps this whole in-memory dataset in
   (nothing is written to the server or device). Ids carry a "demo-" prefix to
   keep them clearly distinct. Pure/repeatable.
   --------------------------------------------------------------------------- */
import type { Customer, Inspection, Line, SiteMap, Zone } from "./types";

const DEMO_PREFIX = "demo-";

let seq = 0;
const lid = () => `${DEMO_PREFIX}l${++seq}`;

function issue(issueId: string, over: Partial<Line> = {}): Line {
  return { id: lid(), kind: "issue", state: "on", count: 1, issueId, ...over };
}
const zone = (n: number, waters: string[], heads: string[], schedule = "Mon/Wed/Fri 6am"): Zone => ({
  n, waters, heads, schedule, visited: true,
});

function btoaSafe(s: string): string {
  try {
    return typeof btoa !== "undefined" ? btoa(s) : Buffer.from(s).toString("base64");
  } catch {
    return "";
  }
}
const svg = (inner: string, w = 160, h = 120) =>
  "data:image/svg+xml;base64," +
  btoaSafe(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`);

const SIG = svg(
  '<path d="M8 42 C30 8, 46 8, 60 32 S96 56, 120 28 S168 10, 192 40" stroke="#16211c" stroke-width="2.4" fill="none"/>',
  200,
  60
);

// Cartoon "photos" for the demo findings (no real photos to invent).
const PHOTO_SPRINKLER = svg(
  '<rect width="160" height="120" fill="#dbe9df"/><ellipse cx="80" cy="108" rx="52" ry="10" fill="#9cc79c"/>' +
    '<rect x="75" y="66" width="10" height="42" rx="3" fill="#5c574e"/>' +
    '<path d="M80 66 C60 46 50 38 38 30" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M80 66 C100 46 110 38 122 30" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M80 62 C78 40 80 34 80 24" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="80" cy="64" r="5" fill="#1B3A5B"/>'
);
const PHOTO_LEAK = svg(
  '<rect width="160" height="120" fill="#dbe9df"/><rect x="18" y="56" width="124" height="12" rx="6" fill="#5c574e"/>' +
    '<path d="M80 68 q-4 10 0 18 q4-8 0-18" fill="#3b82f6"/><circle cx="80" cy="96" r="5" fill="#3b82f6"/>' +
    '<circle cx="80" cy="108" r="3" fill="#3b82f6"/>' +
    '<text x="80" y="34" font-size="14" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#C1272D">LEAK</text>'
);
const PHOTO_WIRE = svg(
  '<rect width="160" height="120" fill="#dbe9df"/><rect x="30" y="48" width="100" height="30" rx="4" fill="#423e37"/>' +
    '<path d="M60 78 q6 16 20 20" stroke="#C68A1E" stroke-width="3" fill="none"/>' +
    '<path d="M96 78 q-4 20 -18 24" stroke="#C1272D" stroke-width="3" fill="none"/>' +
    '<text x="80" y="106" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#5c574e">exposed wire</text>'
);

// A drawn site map (a couple of zone-coverage polygons + sprinkler pins)
// around a center point, so the aerial map shows something in the demo.
function demoSiteMap(lat: number, lng: number): SiteMap {
  const d = 0.00035;
  return {
    center: { lat, lng },
    polygons: [
      { id: lid(), zone: 1, path: [
        { lat: lat - d, lng: lng - d }, { lat: lat - d, lng: lng + d },
        { lat: lat + d * 0.15, lng: lng + d }, { lat: lat + d * 0.15, lng: lng - d },
      ] },
      { id: lid(), zone: 2, path: [
        { lat: lat + d * 0.35, lng: lng - d }, { lat: lat + d * 0.35, lng: lng + d * 0.5 },
        { lat: lat + d * 1.1, lng: lng + d * 0.5 }, { lat: lat + d * 1.1, lng: lng - d },
      ] },
    ],
    pins: [
      { id: lid(), zone: 1, lat: lat - d * 0.5, lng: lng - d * 0.55, kind: "rotor" },
      { id: lid(), zone: 1, lat: lat - d * 0.5, lng: lng + d * 0.55, kind: "rotor" },
      { id: lid(), zone: 1, lat: lat - d * 0.9, lng: lng, kind: "spray" },
      { id: lid(), zone: 2, lat: lat + d * 0.7, lng: lng - d * 0.4, kind: "spray" },
      { id: lid(), zone: 2, lat: lat + d * 0.7, lng: lng + d * 0.2, kind: "spray" },
    ],
  };
}

const NAME_TO_ID: Record<string, string> = { Antonio: "antonio", Luis: "luis", "María": "maria", Admin: "admin" };

export function demoCustomers(): Customer[] {
  const base: Customer[] = [
    { id: DEMO_PREFIX + "c1", name: "Henderson Residence", address: "412 Lakeway Dr", city: "Montgomery, TX" },
    { id: DEMO_PREFIX + "c2", name: "Lake Conroe HOA", address: "88 Marina Blvd", city: "Conroe, TX" },
    { id: DEMO_PREFIX + "c3", name: "Alvarez Property", address: "1207 Pine Grove", city: "Willis, TX" },
    { id: DEMO_PREFIX + "c4", name: "April Sound #14", address: "14 April Wind S", city: "Montgomery, TX" },
    { id: DEMO_PREFIX + "c5", name: "Davis St. Commercial", address: "330 Davis St", city: "Conroe, TX" },
  ];
  const extra = EXTRA_ROWS.map((r, i) => ({ id: `${DEMO_PREFIX}cx${i}`, name: r.name, address: r.address, city: r.city }));
  return [...base, ...extra];
}

type Row = { name: string; address: string; city: string; lat: number; lng: number; tech: string; status: Inspection["status"] };

// 20 more sites — soccer-name customers, random addresses around Conroe & Spring.
const EXTRA_ROWS: Row[] = [
  { name: "Messi Residence", address: "104 Rosa Ln", city: "Conroe, TX", lat: 30.3125, lng: -95.4568, tech: "Luis", status: "draft" },
  { name: "Ronaldo Estate", address: "927 Longmire Rd", city: "Conroe, TX", lat: 30.3061, lng: -95.4702, tech: "Antonio", status: "submitted" },
  { name: "Neymar Property", address: "55 League Line Rd", city: "Conroe, TX", lat: 30.3402, lng: -95.4585, tech: "Luis", status: "under_review" },
  { name: "Mbappe Residence", address: "218 Gosling Rd", city: "Spring, TX", lat: 30.0812, lng: -95.4179, tech: "Antonio", status: "approved" },
  { name: "Modric Home", address: "1440 Rayford Rd", city: "Spring, TX", lat: 30.0771, lng: -95.3921, tech: "Luis", status: "in_progress" },
  { name: "Salah Commercial", address: "700 Sawdust Rd", city: "Spring, TX", lat: 30.1015, lng: -95.4438, tech: "Antonio", status: "completed" },
  { name: "De Bruyne Residence", address: "36 Cypresswood Dr", city: "Spring, TX", lat: 30.0679, lng: -95.4351, tech: "Luis", status: "returned" },
  { name: "Lewandowski HOA", address: "512 Louetta Rd", city: "Spring, TX", lat: 30.0389, lng: -95.4098, tech: "Antonio", status: "submitted" },
  { name: "Benzema Estate", address: "83 Spring Cypress Rd", city: "Spring, TX", lat: 30.0442, lng: -95.4491, tech: "Luis", status: "approved" },
  { name: "Haaland Residence", address: "1290 Kuykendahl Rd", city: "Spring, TX", lat: 30.0623, lng: -95.4712, tech: "Antonio", status: "in_progress" },
  { name: "Kane Property", address: "44 W Davis St", city: "Conroe, TX", lat: 30.3097, lng: -95.4571, tech: "Luis", status: "draft" },
  { name: "Suarez Residence", address: "615 N Frazier St", city: "Conroe, TX", lat: 30.3211, lng: -95.4560, tech: "Antonio", status: "completed" },
  { name: "Vinicius Home", address: "27 Teas Nursery Rd", city: "Conroe, TX", lat: 30.2932, lng: -95.4869, tech: "Luis", status: "submitted" },
  { name: "Pedri Residence", address: "902 Wilson Rd", city: "Conroe, TX", lat: 30.2758, lng: -95.4383, tech: "Antonio", status: "under_review" },
  { name: "Rodri Commercial", address: "150 Interstate 45 N", city: "Conroe, TX", lat: 30.3335, lng: -95.4699, tech: "Luis", status: "approved" },
  { name: "Foden Residence", address: "76 Longmire Cove", city: "Conroe, TX", lat: 30.3049, lng: -95.4738, tech: "Antonio", status: "in_progress" },
  { name: "Griezmann Estate", address: "348 Montgomery Park", city: "Montgomery, TX", lat: 30.3891, lng: -95.6968, tech: "Luis", status: "completed" },
  { name: "Kroos Residence", address: "19 Walden Rd", city: "Montgomery, TX", lat: 30.3728, lng: -95.6072, tech: "Antonio", status: "returned" },
  { name: "Bellingham Home", address: "1102 Honea Egypt Rd", city: "Montgomery, TX", lat: 30.3564, lng: -95.5821, tech: "Luis", status: "draft" },
  { name: "Dias Property", address: "58 Bentwater Dr", city: "Montgomery, TX", lat: 30.4142, lng: -95.6483, tech: "Antonio", status: "approved" },
];

const SEVS: Line["severity"][] = ["safety", "functional", "efficiency"];
const ISSUE_POOL: Array<[string, string]> = [
  ["broken_head", "rotor"], ["adjust_nozzles", ""], ["broken_nozzle", "spray"], ["leak_lateral", ""],
  ["over_pressure", ""], ["mixed_mfr", "rotor"], ["raise_heads", ""], ["exposed_wire", ""],
  ["hydrozoning", ""], ["leak_main", ""],
];
const PHOTOS = [PHOTO_SPRINKLER, PHOTO_LEAK, PHOTO_WIRE];
const BRANDS = ["Hunter", "Rain Bird", "Hunter"];
const MODELS = ["X-Core", "ESP-TM2", "Pro-C"];

/** All demo inspections, newest first. `now` is passed in so the caller controls
    timestamps (keeps this pure/testable). */
export function demoInspections(now: number): Inspection[] {
  seq = 0;
  const day = 86_400_000;
  const iso = (n: number) => new Date(now - n * day).toISOString().slice(0, 10);

  const mk = (
    n: number, cust: string, address: string, city: string, tech: string,
    status: Inspection["status"], zones: Zone[], lines: Line[], extra: Partial<Inspection> = {}
  ): Inspection => {
    const date = iso(n);
    const signed = ["submitted", "under_review", "approved", "in_progress", "completed"].includes(status);
    return {
      id: `${DEMO_PREFIX}i${n}`, customer: cust, address, city, tech, techId: NAME_TO_ID[tech],
      date, status,
      snapshot: { brand: "Hunter", model: "X-Core", stations: String(zones.length), backflow: "PVB", pressure: "62", rainSensor: "yes" },
      zones, lines,
      signedDate: signed ? date : undefined,
      completedDate: status === "completed" ? iso(Math.max(0, n - 2)) : undefined,
      updatedAt: now - n * 3_600_000, synced: true, ...extra,
    };
  };

  const base: Inspection[] = [
    mk(1, "Henderson Residence", "412 Lakeway Dr", "Montgomery, TX", "Antonio", "draft",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [issue("broken_head", { attrVal: "rotor", count: 2, severity: "functional", action: "replace", zone: 1 }),
        issue("adjust_nozzles", { count: 3, severity: "efficiency", action: "repair", zone: 2 })]),
    mk(2, "Lake Conroe HOA", "88 Marina Blvd", "Conroe, TX", "Luis", "submitted",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["turf"], ["spray"]), zone(3, ["beds"], ["drip"])],
      [issue("broken_nozzle", { attrVal: "spray", count: 4, severity: "functional", action: "replace", zone: 2, photos: [PHOTO_SPRINKLER] }),
        issue("leak_lateral", { count: 1, severity: "functional", action: "repair", zone: 1, photos: [PHOTO_LEAK] }),
        issue("over_pressure", { count: 1, severity: "efficiency", action: "repair", zone: "system" })],
      { signature: SIG }),
    mk(3, "Alvarez Property", "1207 Pine Grove", "Willis, TX", "Antonio", "under_review",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [issue("exposed_wire", { count: 1, severity: "safety", action: "repair", zone: "system", photos: [PHOTO_WIRE] }),
        issue("mixed_mfr", { attrVal: "rotor", count: 5, severity: "efficiency", action: "replace", zone: 1 })],
      { signature: SIG }),
    mk(4, "April Sound #14", "14 April Wind S", "Montgomery, TX", "Luis", "approved",
      [zone(1, ["turf"], ["spray"]), zone(2, ["turf"], ["rotor"])],
      [issue("broken_head", { attrVal: "spray", count: 3, severity: "functional", action: "replace", zone: 1 }),
        { id: lid(), kind: "assembly", state: "on", count: 1, refId: "new_zone" }],
      { signature: SIG, geo: { lat: 30.3888, lng: -95.6961 }, siteMap: demoSiteMap(30.3888, -95.6961) }),
    mk(5, "Davis St. Commercial", "330 Davis St", "Conroe, TX", "Antonio", "in_progress",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["turf"], ["rotor"]), zone(3, ["beds"], ["drip"]), zone(4, ["turf"], ["spray"])],
      [issue("leak_main", { count: 1, severity: "safety", action: "repair", zone: "system", photos: [PHOTO_LEAK] }),
        issue("hydrozoning", { count: 1, severity: "efficiency", action: "replace", zone: 3 })],
      { signature: SIG, geo: { lat: 30.3097, lng: -95.4571 }, siteMap: demoSiteMap(30.3097, -95.4571) }),
    mk(6, "Henderson Residence", "412 Lakeway Dr", "Montgomery, TX", "Luis", "completed",
      [zone(1, ["turf"], ["rotor"]), zone(2, ["beds"], ["spray"])],
      [issue("broken_nozzle", { attrVal: "rotor", count: 2, severity: "functional", action: "replace", zone: 1 }),
        issue("raise_heads", { count: 4, severity: "functional", action: "repair", zone: 2 })],
      { signature: SIG, completionSignature: SIG }),
  ];

  const extra: Inspection[] = EXTRA_ROWS.map((r, i) => {
    const n = 10 + i;
    const nZones = 2 + (i % 2);
    const zones = Array.from({ length: nZones }, (_, z) =>
      zone(z + 1, z % 2 ? ["beds"] : ["turf"], [["rotor", "spray", "drip"][z % 3]]));
    const [id1, attr1] = ISSUE_POOL[i % ISSUE_POOL.length];
    const [id2, attr2] = ISSUE_POOL[(i + 4) % ISSUE_POOL.length];
    const withPhoto = i % 3 === 0;
    const signed = ["submitted", "under_review", "approved", "in_progress", "completed"].includes(r.status);
    const lines: Line[] = [
      issue(id1, { attrVal: attr1 || undefined, count: 1 + (i % 3), severity: SEVS[i % 3], action: i % 2 ? "replace" : "repair", zone: 1, photos: withPhoto ? [PHOTOS[i % PHOTOS.length]] : undefined }),
      issue(id2, { attrVal: attr2 || undefined, count: 1 + ((i + 1) % 2), severity: SEVS[(i + 1) % 3], action: "repair", zone: nZones > 1 ? 2 : 1 }),
    ];
    const date = iso(n);
    return {
      id: `${DEMO_PREFIX}ix${i}`,
      customer: r.name, address: r.address, city: r.city, customerId: `${DEMO_PREFIX}cx${i}`,
      tech: r.tech, techId: NAME_TO_ID[r.tech],
      date, status: r.status,
      snapshot: { brand: BRANDS[i % 3], model: MODELS[i % 3], stations: String(nZones), backflow: "PVB", pressure: String(55 + (i % 18)), rainSensor: i % 2 ? "yes" : "no" },
      zones, lines,
      geo: { lat: r.lat, lng: r.lng },
      siteMap: i % 3 === 0 ? demoSiteMap(r.lat, r.lng) : undefined,
      signature: signed ? SIG : undefined,
      signedDate: signed ? date : undefined,
      completionSignature: r.status === "completed" ? SIG : undefined,
      completedDate: r.status === "completed" ? iso(Math.max(0, n - 2)) : undefined,
      updatedAt: now - n * 3_600_000,
      synced: true,
    };
  });

  return [...base, ...extra];
}
