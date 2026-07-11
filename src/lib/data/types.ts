/* ---------------------------------------------------------------------------
   Core domain model — the heart of the build (Code handoff §2).
   Every user-visible name is bilingual (LocalizedName); every string that
   reaches a screen is a label that can carry two languages, never hard-baked.
   --------------------------------------------------------------------------- */

export type Lang = "en" | "es";

/** Light (default), Dark, or Sunny — a very high-contrast light theme for
    reading the screen outdoors in bright sun. */
export type Theme = "light" | "dark" | "sunny";

/** A user-visible name carrying an English and a Spanish value. */
export interface LocalizedName {
  en: string;
  es: string;
}

export type Severity = "safety" | "functional" | "efficiency";
export type FixAction = "repair" | "replace";

/** Parts use each/set/ft; labor uses flat/hour/foot. */
export type Unit = "each" | "set" | "ft" | "flat" | "hour" | "foot";

// ── Catalog (Admin-owned managed lists) ────────────────────────────────────

export interface Part {
  id: string;
  name: LocalizedName;
  category?: string;
  brand?: string;
  model?: string;
  vendor?: string;
  sku?: string;
  unit: Unit;
  cost: number; // supplier cost
  price: number; // sell price
  onHand: boolean; // light-inventory flag (§10)
  notes?: string;
}

export interface LaborRate {
  id: string;
  name: LocalizedName;
  unit: Extract<Unit, "flat" | "hour" | "foot">;
  rate: number;
  notes?: string;
}

/** An issue-specific follow-up whose answer selects the exact part. */
export interface IssueAttribute {
  id: string;
  name: LocalizedName;
  options: Array<{
    val: string;
    label: LocalizedName;
    /** Choosing this option maps the fix to this part. */
    partId: string | null;
  }>;
}

/** Issue type (catalog): bilingual name, attributes, default severity, and the
    default fix mapping into part + labor (§3, the money chain). */
export interface IssueType {
  id: string;
  name: LocalizedName;
  severity: Severity;
  action: FixAction;
  /** Default part for the fix (may be overridden by an attribute choice). */
  partId: string | null;
  /** Default labor line attached to the fix. */
  laborId: string | null;
  /** Labor quantity per unit of count (e.g. 0.25 hr per broken head). */
  laborQty: number;
  /** Optional follow-up that refines the part selection. */
  attr: IssueAttribute | null;
}

export type AssemblyRecipeItem =
  | { kind: "part"; id: string; qty: number }
  | { kind: "labor"; id: string; qty: number };

/** A pre-priced recipe of parts + labor (e.g. "new zone install" $600). */
export interface Assembly {
  id: string;
  name: LocalizedName;
  recipe: AssemblyRecipeItem[];
  price: number;
  /** true → shown as one rolled-up line; false → itemized on the quote. */
  rolled: boolean;
}

export interface Catalog {
  parts: Part[];
  labor: LaborRate[];
  issues: IssueType[];
  assemblies: Assembly[];
}

// ── Users, roles, permissions (§4) ──────────────────────────────────────────

export type Role = "field" | "lead" | "office" | "admin";

/** Individual permission keys, grouped into roles. */
export interface Permissions {
  /** (1) see prices */
  seePrices: boolean;
  /** (2) set/override a price + add local-purchase lines */
  setPrice: boolean;
  /** (3) edit catalog / assemblies / price book (Admin) */
  editCatalog: boolean;
  /** (4) approve an inspection into a work order (Admin) — the one gate */
  approve: boolean;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  lang: Lang;
  permissions: Permissions;
  /** Present only in the server store; never sent to the client. */
  passwordHash?: string;
}

// ── Customer / site (integration seam §7 — may be received externally) ───────

export interface Customer {
  id: string;
  name: string;
  address: string;
  city: string;
  contact?: string;
  /** Set when this record originated in an external system. */
  externalId?: string;
  externalSource?: string;
}

// ── Inspection ──────────────────────────────────────────────────────────────

export interface SystemSnapshot {
  brand: string;
  model: string;
  stations: string; // kept as string from the number field; drives zone count
  backflow: string;
  backflowTestable?: boolean;
  backflowInstalled?: boolean;
  pressure: string;
  rainSensor: string; // "yes" | "no" | ""
  isolationValve?: boolean;
}

export interface Zone {
  n: number;
  waters: string[]; // "turf" | "beds"
  heads: string[]; // "spray" | "rotor" | "drip" | "bubbler"
  schedule: string;
  proposedSchedule?: string;
  visited?: boolean;
}

// ── Site map (Google Maps zone drawing) ─────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}
/** A drawn zone-coverage outline on the aerial map. */
export interface SitePolygon {
  id: string;
  zone?: number | "system";
  path: LatLng[];
}
/** A dropped pin (e.g. a sprinkler head) on the aerial map. */
export interface SitePin {
  id: string;
  zone?: number | "system";
  lat: number;
  lng: number;
  kind?: string;
}
export interface SiteMap {
  center?: LatLng;
  polygons: SitePolygon[];
  pins: SitePin[];
}

export type LineState = "on" | "deferred" | "declined";

/** A quote line. Discriminated by `kind`. `issue` lines carry the structured
    finding; the others are added directly in the quote editor. */
export interface Line {
  id: string;
  kind: "issue" | "part" | "labor" | "assembly" | "local";
  state: LineState;
  count: number;
  // issue lines
  issueId?: string;
  attrVal?: string;
  severity?: Severity;
  action?: FixAction;
  /** Legacy single photo (kept for back-compat). */
  photo?: string | null;
  /** Multiple photos per finding (data URLs). */
  photos?: string[];
  note?: string;
  zone?: number | "system";
  // part / labor / assembly lines
  refId?: string;
  // local-purchase lines (editable price)
  name?: string;
  price?: number;
  cost?: number;
}

/** Lifecycle: draft → (customer signs estimate) submitted → under_review →
    approved (a work order) → in_progress → completed (customer signs completion).
    `returned` sends it back to the tech for edits. Billing after completed is
    handled by the back office, outside the app. */
export type InspectionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "in_progress"
  | "completed"
  | "returned";

export interface Inspection {
  id: string;
  customer: string;
  address: string;
  city: string;
  customerId?: string;
  /** Geocoded location of the site (from Google address autocomplete). */
  geo?: LatLng;
  /** Drawn aerial site map — zone-coverage polygons and sprinkler pins. */
  siteMap?: SiteMap;
  tech: string;
  techId?: string;
  date: string; // ISO yyyy-mm-dd
  status: InspectionStatus;
  snapshot: SystemSnapshot;
  zones: Zone[];
  lines: Line[];
  /** Customer signature approving the estimate (captured in the field). */
  signature?: string | null;
  /** Customer signature confirming the completed work (captured on close-out). */
  completionSignature?: string | null;
  /** Local-first sync bookkeeping. */
  updatedAt?: number;
  synced?: boolean;
}

// ── Whole-database shape (used by the local store & seed) ────────────────────

export interface Database {
  version: number;
  users: User[];
  catalog: Catalog;
  customers: Customer[];
  inspections: Inspection[];
  settings: { lang: Lang; showRunningTotal?: boolean; theme?: Theme };
  session: string | null;
}
