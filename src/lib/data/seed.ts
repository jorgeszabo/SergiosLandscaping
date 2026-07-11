/* ---------------------------------------------------------------------------
   Starter data (Code handoff §8), imported from
   irrigation-parts-catalog-STARTER.xlsx. Everything here is Admin-editable
   after seeding. Prices are PLACEHOLDERS — replace with the company's real
   numbers. Bilingual names (English / Español) are built in from line one.
   --------------------------------------------------------------------------- */
import type {
  Assembly,
  Catalog,
  Customer,
  Database,
  IssueType,
  LaborRate,
  Part,
  Permissions,
  User,
} from "./types";

// ── permission presets by role (§4) ─────────────────────────────────────────
const ROLE_PERMS: Record<string, Permissions> = {
  field: { seePrices: false, setPrice: false, editCatalog: false, approve: false },
  lead: { seePrices: true, setPrice: false, editCatalog: false, approve: false },
  office: { seePrices: true, setPrice: true, editCatalog: false, approve: false },
  admin: { seePrices: true, setPrice: true, editCatalog: true, approve: true },
};

// ── parts (31) ───────────────────────────────────────────────────────────────
const P = (
  id: string,
  en: string,
  es: string,
  opts: Partial<Part> & Pick<Part, "unit" | "cost" | "price">
): Part => ({
  id,
  name: { en, es },
  onHand: true,
  ...opts,
});

export const SEED_PARTS: Part[] = [
  P("ctrl_xc400", "Controller — 4-station", "Control — 4 estaciones", { category: "Controller", brand: "Hunter", model: "X-Core XC-400", vendor: "Ewing / SiteOne", sku: "XC-400i", unit: "each", cost: 90, price: 160, notes: "Indoor/outdoor" }),
  P("ctrl_pc401", "Controller — 8-station", "Control — 8 estaciones", { category: "Controller", brand: "Hunter", model: "Pro-C PC-401", vendor: "Ewing / SiteOne", sku: "PC-401i", unit: "each", cost: 140, price: 240, onHand: false }),
  P("ctrl_esptm2", "Controller — 8-station", "Control — 8 estaciones", { category: "Controller", brand: "Rain Bird", model: "ESP-TM2", vendor: "SiteOne", sku: "ESP8TM2", unit: "each", cost: 120, price: 210, onHand: false }),
  P("bf_pvb", 'Backflow PVB 1"', 'Antisifón PVB 1"', { category: "Backflow", brand: "Febco", model: "765-1", vendor: "SiteOne", sku: "765-100", unit: "each", cost: 70, price: 130, onHand: false, notes: "Pressure vacuum breaker" }),
  P("bf_dcv", 'Double check valve 1"', 'Válvula de doble retención 1"', { category: "Backflow", brand: "Watts", model: "007-1", vendor: "SiteOne", sku: "0061878", unit: "each", cost: 60, price: 110, onHand: false }),
  P("bf_rebuild", "Backflow rebuild kit", "Kit de reconstrucción de antisifón", { category: "Backflow", brand: "Febco", model: "905-212", vendor: "SiteOne", sku: "905212", unit: "each", cost: 20, price: 45 }),
  P("valve_pgv", 'Electric valve 1"', 'Válvula eléctrica 1"', { category: "Valve", brand: "Hunter", model: "PGV-101G", vendor: "Ewing / SiteOne", sku: "PGV-101G", unit: "each", cost: 16, price: 35, notes: "Common repair item" }),
  P("valve_dv", 'Electric valve 1"', 'Válvula eléctrica 1"', { category: "Valve", brand: "Rain Bird", model: "DV-100", vendor: "SiteOne", sku: "DV100", unit: "each", cost: 15, price: 33 }),
  P("solenoid", "Solenoid", "Solenoide", { category: "Valve", brand: "Hunter", model: "458200", vendor: "Ewing", sku: "458200", unit: "each", cost: 10, price: 25 }),
  P("iso_valve", 'Isolation / gate valve 1"', 'Válvula de aislamiento 1"', { category: "Valve", brand: "Generic", vendor: "SiteOne", unit: "each", cost: 12, price: 28, onHand: false }),
  P("rain_wired", "Rain sensor (wired)", "Sensor de lluvia (cableado)", { category: "Sensor", brand: "Hunter", model: "Mini-Clik", vendor: "Ewing", sku: "MINI-CLIK", unit: "each", cost: 22, price: 45 }),
  P("rain_wireless", "Rain sensor (wireless)", "Sensor de lluvia (inalámbrico)", { category: "Sensor", brand: "Hunter", model: "Wireless Rain-Clik", vendor: "Ewing", sku: "WRCLIK", unit: "each", cost: 40, price: 75, onHand: false }),
  P("spray_04", 'Pop-up spray body 4"', 'Aspersor emergente 4"', { category: "Spray Head", brand: "Hunter", model: "Pro-Spray PROS-04", vendor: "Ewing / SiteOne", sku: "PROS-04", unit: "each", cost: 3, price: 8 }),
  P("spray_06", 'Pop-up spray body 6"', 'Aspersor emergente 6"', { category: "Spray Head", brand: "Hunter", model: "Pro-Spray PROS-06", vendor: "Ewing / SiteOne", sku: "PROS-06", unit: "each", cost: 4, price: 10 }),
  P("spray_12", 'Pop-up spray body 12"', 'Aspersor emergente 12"', { category: "Spray Head", brand: "Hunter", model: "Pro-Spray PROS-12", vendor: "Ewing", sku: "PROS-12", unit: "each", cost: 6, price: 14, onHand: false, notes: "For beds/shrubs" }),
  P("spray_nozzle", "Fixed/adjustable spray nozzle", "Boquilla de aspersión", { category: "Spray Nozzle", brand: "Hunter", model: "Pro-Spray nozzle", vendor: "Ewing / SiteOne", sku: "PS-nozzle", unit: "each", cost: 1.5, price: 5, notes: "Very common" }),
  P("mp_rotator", "MP Rotator nozzle", "Boquilla MP Rotator", { category: "Spray Nozzle", brand: "Hunter", model: "MP2000", vendor: "Ewing", sku: "MP200090210", unit: "each", cost: 6, price: 14, notes: "High-efficiency" }),
  P("rotor_pgp", "Rotor", "Rotor", { category: "Rotor", brand: "Hunter", model: "PGP Ultra", vendor: "Ewing / SiteOne", sku: "PGP-ADJ", unit: "each", cost: 10, price: 25, notes: "Common repair item" }),
  P("rotor_5000", "Rotor", "Rotor", { category: "Rotor", brand: "Rain Bird", model: "5000", vendor: "SiteOne", sku: "5004PL", unit: "each", cost: 11, price: 26, onHand: false }),
  P("rotor_nozzle", "Rotor nozzle set", "Juego de boquillas de rotor", { category: "Rotor", brand: "Hunter", model: "PGP nozzle rack", vendor: "Ewing", sku: "PGP-NOZZLES", unit: "set", cost: 2, price: 6 }),
  P("drip_emitter", "Drip emitter", "Emisor de goteo", { category: "Drip", brand: "Rain Bird", model: "XB-10PC", vendor: "SiteOne", sku: "XB10PC", unit: "each", cost: 0.5, price: 2 }),
  P("drip_tubing", 'Drip tubing 1/2"', 'Tubería de goteo 1/2"', { category: "Drip", brand: "Rain Bird", model: "XFD-0912", vendor: "SiteOne", sku: "XFD0912", unit: "ft", cost: 0.25, price: 1, onHand: false, notes: "Priced per foot" }),
  P("drip_kit", "Drip conversion kit", "Kit de conversión a goteo", { category: "Drip", brand: "Hunter", vendor: "Ewing", unit: "each", cost: 8, price: 18, onHand: false }),
  P("pvc_34", 'PVC pipe Class 200, 3/4"', 'Tubo PVC Clase 200, 3/4"', { category: "Pipe & Fittings", model: "Cl 200", vendor: "SiteOne", unit: "ft", cost: 0.4, price: 1.25, notes: "Priced per foot" }),
  P("pvc_1", 'PVC pipe Class 200, 1"', 'Tubo PVC Clase 200, 1"', { category: "Pipe & Fittings", model: "Cl 200", vendor: "SiteOne", unit: "ft", cost: 0.6, price: 1.75, onHand: false, notes: "Priced per foot" }),
  P("pvc_fittings", "Assorted PVC fittings", "Conexiones PVC surtidas", { category: "Pipe & Fittings", model: "Sch 40", vendor: "SiteOne", unit: "each", cost: 1, price: 4 }),
  P("swing_joint", "Swing joint / funny pipe", "Codo articulado / tubo flexible", { category: "Pipe & Fittings", vendor: "Ewing", unit: "each", cost: 2, price: 6, notes: "For raising/lowering heads" }),
  P("wire", "Irrigation wire", "Cable de riego", { category: "Wire & Electrical", model: "18ga multi", vendor: "SiteOne", unit: "ft", cost: 0.2, price: 0.75, notes: "Priced per foot" }),
  P("wire_conn", "Waterproof wire connectors", "Conectores de cable impermeables", { category: "Wire & Electrical", brand: "3M", model: "DBR/Y-6", vendor: "SiteOne", sku: "DBRY6", unit: "each", cost: 1, price: 4 }),
  P("vbox_6", 'Valve box 6" round', 'Caja de válvula 6" redonda', { category: "Valve Box", brand: "NDS", model: "111BC", vendor: "SiteOne", sku: "111BC", unit: "each", cost: 8, price: 20 }),
  P("vbox_10", 'Valve box 10" rectangular', 'Caja de válvula 10" rectangular', { category: "Valve Box", brand: "NDS", model: "113BC", vendor: "SiteOne", sku: "113BC", unit: "each", cost: 14, price: 32, onHand: false }),

  // ── expanded popular components ──────────────────────────────────────────
  // Controllers
  P("ctrl_hydrawise", "Smart Wi-Fi controller", "Controlador inteligente Wi-Fi", { category: "Controller", brand: "Hunter", model: "Hydrawise HC", vendor: "Ewing", sku: "HC-1200i", unit: "each", cost: 160, price: 280, onHand: false, notes: "Wi-Fi / app control" }),
  P("ctrl_espme", "Modular controller — up to 22", "Controlador modular — hasta 22", { category: "Controller", brand: "Rain Bird", model: "ESP-Me3", vendor: "SiteOne", sku: "ESP4ME3", unit: "each", cost: 130, price: 230, onHand: false }),
  P("ctrl_transformer", "Controller transformer 24V", "Transformador de controlador 24V", { category: "Controller", brand: "Generic", unit: "each", cost: 14, price: 35, onHand: false }),
  // Backflow
  P("bf_rp", 'Reduced-pressure assembly 1"', 'Válvula de presión reducida 1"', { category: "Backflow", brand: "Watts", model: "009-1", vendor: "SiteOne", sku: "0062033", unit: "each", cost: 150, price: 260, onHand: false, notes: "RP — high-hazard" }),
  P("bf_ball", 'Ball valve 1"', 'Válvula de bola 1"', { category: "Backflow", brand: "Generic", vendor: "SiteOne", unit: "each", cost: 8, price: 20 }),
  // Valves
  P("valve_075", 'Electric valve 3/4"', 'Válvula eléctrica 3/4"', { category: "Valve", brand: "Hunter", model: "PGV-075", vendor: "Ewing", sku: "PGV-075", unit: "each", cost: 15, price: 33, onHand: false }),
  P("valve_150", 'Electric valve 1-1/2"', 'Válvula eléctrica 1-1/2"', { category: "Valve", brand: "Rain Bird", model: "PEB-150", vendor: "SiteOne", sku: "PEB150", unit: "each", cost: 45, price: 85, onHand: false, notes: "Larger mainline zones" }),
  P("valve_master", "Master valve", "Válvula maestra", { category: "Valve", brand: "Hunter", model: "ICV-101G", vendor: "Ewing", unit: "each", cost: 40, price: 80, onHand: false }),
  P("valve_diaphragm", "Valve diaphragm/repair kit", "Kit de diafragma / reparación de válvula", { category: "Valve", brand: "Hunter", model: "PGV diaphragm", vendor: "Ewing", unit: "each", cost: 6, price: 16, notes: "Common repair item" }),
  // Sensors
  P("flow_sensor", "Flow sensor", "Sensor de flujo", { category: "Sensor", brand: "Hunter", model: "HFS", vendor: "Ewing", unit: "each", cost: 90, price: 160, onHand: false }),
  P("soil_sensor", "Soil moisture sensor", "Sensor de humedad del suelo", { category: "Sensor", brand: "Hunter", model: "Soil-Clik", vendor: "Ewing", unit: "each", cost: 60, price: 110, onHand: false }),
  // Spray heads
  P("spray_02", 'Pop-up spray body 2"', 'Aspersor emergente 2"', { category: "Spray Head", brand: "Hunter", model: "Pro-Spray PROS-02", vendor: "Ewing", sku: "PROS-02", unit: "each", cost: 2.5, price: 7, onHand: false }),
  P("rb_1804", 'Pop-up spray body 4"', 'Aspersor emergente 4"', { category: "Spray Head", brand: "Rain Bird", model: "1804", vendor: "SiteOne", sku: "1804", unit: "each", cost: 3, price: 8 }),
  P("shrub_adapter", "Shrub riser adapter", "Adaptador para arbusto", { category: "Spray Head", brand: "Generic", vendor: "Ewing", unit: "each", cost: 1, price: 4, onHand: false }),
  // Spray nozzles
  P("van_nozzle", "Adjustable (VAN) nozzle", "Boquilla ajustable (VAN)", { category: "Spray Nozzle", brand: "Rain Bird", model: "VAN", vendor: "SiteOne", sku: "10-VAN", unit: "each", cost: 1.25, price: 5 }),
  P("fixed_set", "Fixed nozzle set (¼/½/full)", "Juego de boquillas fijas (¼/½/completo)", { category: "Spray Nozzle", brand: "Rain Bird", model: "U-Series", vendor: "SiteOne", unit: "set", cost: 4, price: 12, onHand: false, notes: "High-uniformity" }),
  P("mp_1000", "MP Rotator MP1000", "Boquilla MP Rotator MP1000", { category: "Spray Nozzle", brand: "Hunter", model: "MP1000", vendor: "Ewing", sku: "MP100021036", unit: "each", cost: 6, price: 14, onHand: false }),
  P("mp_3000", "MP Rotator MP3000", "Boquilla MP Rotator MP3000", { category: "Spray Nozzle", brand: "Hunter", model: "MP3000", vendor: "Ewing", sku: "MP300090210", unit: "each", cost: 6.5, price: 15, onHand: false }),
  P("side_strip", "Side/end strip nozzle", "Boquilla de tira", { category: "Spray Nozzle", brand: "Hunter", model: "Side Strip", vendor: "Ewing", unit: "each", cost: 1.5, price: 5, onHand: false }),
  // Rotors
  P("rotor_i20", "Rotor (I-20)", "Rotor (I-20)", { category: "Rotor", brand: "Hunter", model: "I-20", vendor: "Ewing", sku: "I-20-ADV", unit: "each", cost: 12, price: 28, onHand: false }),
  P("rotor_3500", "Rotor (3500)", "Rotor (3500)", { category: "Rotor", brand: "Rain Bird", model: "3500", vendor: "SiteOne", sku: "3504", unit: "each", cost: 9, price: 22, onHand: false }),
  // Drip
  P("drip_pr", "Drip pressure regulator", "Regulador de presión para goteo", { category: "Drip", brand: "Rain Bird", model: "PRF-075", vendor: "SiteOne", unit: "each", cost: 6, price: 16, notes: "With filter" }),
  P("drip_filter", "Drip filter / Y-strainer", "Filtro para goteo", { category: "Drip", brand: "Rain Bird", vendor: "SiteOne", unit: "each", cost: 5, price: 14, onHand: false }),
  P("drip_14", 'Distribution tubing 1/4"', 'Tubería de distribución 1/4"', { category: "Drip", brand: "Rain Bird", vendor: "SiteOne", unit: "ft", cost: 0.15, price: 0.75, onHand: false, notes: "Priced per foot" }),
  P("goof_plug", "Goof plugs (bag)", "Tapones (bolsa)", { category: "Drip", brand: "Generic", vendor: "Ewing", unit: "each", cost: 2, price: 6, onHand: false }),
  P("drip_fittings", "Drip barbed fittings", "Conexiones dentadas para goteo", { category: "Drip", brand: "Generic", vendor: "SiteOne", unit: "each", cost: 0.4, price: 2 }),
  // Pipe & fittings
  P("poly_pipe", "Poly lateral pipe", "Tubo de polietileno", { category: "Pipe & Fittings", model: "100 psi", vendor: "SiteOne", unit: "ft", cost: 0.35, price: 1.1, onHand: false, notes: "Priced per foot" }),
  P("pvc_cement", "PVC primer & cement", "Primer y cemento PVC", { category: "Pipe & Fittings", brand: "Oatey", vendor: "SiteOne", unit: "each", cost: 12, price: 26, notes: "Per can set" }),
  P("pvc_riser", "PVC riser / nipple", "Niple / elevador PVC", { category: "Pipe & Fittings", vendor: "SiteOne", unit: "each", cost: 0.5, price: 2.5 }),
  P("pvc_tee", "PVC tee / ell (assorted)", "Tee / codo PVC surtido", { category: "Pipe & Fittings", model: "Sch 40", vendor: "SiteOne", unit: "each", cost: 0.8, price: 3.5, onHand: false }),
  // Consumables
  P("teflon", "Teflon tape", "Cinta de teflón", { category: "Consumables", brand: "Generic", vendor: "SiteOne", unit: "each", cost: 0.5, price: 2 }),
  P("marking_flags", "Marking flags (bundle)", "Banderas de marcado (paquete)", { category: "Consumables", vendor: "SiteOne", unit: "set", cost: 4, price: 10, onHand: false }),
];

// ── labor rates (4) ──────────────────────────────────────────────────────────
export const SEED_LABOR: LaborRate[] = [
  { id: "trip", name: { en: "Service call / trip charge", es: "Visita de servicio" }, unit: "flat", rate: 75, notes: "Applied once per visit" },
  { id: "std", name: { en: "Standard irrigation labor", es: "Mano de obra estándar" }, unit: "hour", rate: 85 },
  { id: "skilled", name: { en: "Skilled / backflow labor", es: "Mano de obra especializada" }, unit: "hour", rate: 110, notes: "Backflow, mainline, electrical" },
  { id: "trench", name: { en: "Trenching", es: "Zanjeo" }, unit: "foot", rate: 3, notes: "Hand or machine" },
];

// ── issue attributes (refine the part selection) ─────────────────────────────
const headAttr: IssueType["attr"] = {
  id: "head",
  name: { en: "Head type", es: "Tipo de cabeza" },
  options: [
    { val: "spray", label: { en: "Spray", es: "Aspersor" }, partId: "spray_04" },
    { val: "rotor", label: { en: "Rotor", es: "Rotor" }, partId: "rotor_pgp" },
    { val: "drip", label: { en: "Drip / MP", es: "Goteo / MP" }, partId: "mp_rotator" },
  ],
};
const nozAttr: IssueType["attr"] = {
  id: "noz",
  name: { en: "Nozzle type", es: "Tipo de boquilla" },
  options: [
    { val: "spray", label: { en: "Spray", es: "Aspersor" }, partId: "spray_nozzle" },
    { val: "rotor", label: { en: "Rotor", es: "Rotor" }, partId: "rotor_nozzle" },
  ],
};

// ── issue types (17, from the real paper form + Issue → Fix Map) ─────────────
const I = (
  id: string,
  en: string,
  es: string,
  severity: IssueType["severity"],
  action: IssueType["action"],
  partId: string | null,
  laborId: string | null,
  laborQty: number,
  attr: IssueType["attr"] = null
): IssueType => ({ id, name: { en, es }, severity, action, partId, laborId, laborQty, attr });

export const SEED_ISSUES: IssueType[] = [
  I("broken_head", "Broken head", "Cabeza rota", "functional", "replace", null, "std", 0.25, headAttr),
  I("broken_nozzle", "Broken nozzle", "Boquilla rota", "functional", "replace", null, "std", 0.15, nozAttr),
  I("poor_layout", "Poor head layout", "Mala distribución de cabezas", "efficiency", "repair", null, "std", 0.5),
  I("adjust_nozzles", "Adjust nozzles", "Ajustar boquillas", "efficiency", "repair", null, "std", 0.15),
  I("not_aligned", "Heads not aligned", "Cabezas desalineadas", "efficiency", "repair", null, "std", 0.15),
  I("raise_heads", "Raise heads", "Subir cabezas", "functional", "repair", "swing_joint", "std", 0.25),
  I("lower_heads", "Lower heads", "Bajar cabezas", "efficiency", "repair", null, "std", 0.2),
  I("under_pressure", "Under pressure", "Baja presión", "functional", "repair", null, "skilled", 0.5),
  I("over_pressure", "Over pressure", "Alta presión", "efficiency", "repair", "spray_nozzle", "std", 0.25),
  I("obstructions", "Obstructions", "Obstrucciones", "efficiency", "repair", null, "std", 0.15),
  I("overspray", "Overspray", "Sobrerriego", "efficiency", "repair", "spray_nozzle", "std", 0.15),
  I("hydrozoning", "Needs hydrozoning", "Requiere hidrozonificación", "efficiency", "replace", "valve_pgv", "skilled", 1),
  I("leak_lateral", "Leak in lateral", "Fuga en lateral", "functional", "repair", "pvc_fittings", "std", 0.5),
  I("leak_main", "Leak in main", "Fuga en línea principal", "safety", "repair", "pvc_fittings", "skilled", 1),
  I("exposed_pipe", "Exposed pipe", "Tubo expuesto", "safety", "repair", null, "std", 0.3),
  I("exposed_wire", "Exposed wire", "Cable expuesto", "safety", "repair", "wire_conn", "std", 0.25),
  I("mixed_mfr", "Mixed manufacturers", "Fabricantes mezclados", "efficiency", "replace", null, "std", 0.25, headAttr),
];

// ── assemblies (Code handoff §8 — created from the §3 shape) ──────────────────
export const SEED_ASSEMBLIES: Assembly[] = [
  {
    id: "new_zone",
    name: { en: "New zone install", es: "Instalar zona nueva" },
    recipe: [
      { kind: "part", id: "valve_pgv", qty: 1 },
      { kind: "part", id: "wire", qty: 50 },
      { kind: "part", id: "pvc_34", qty: 40 },
      { kind: "part", id: "rotor_pgp", qty: 4 },
      { kind: "labor", id: "std", qty: 3 },
    ],
    price: 600,
    rolled: true,
  },
  {
    id: "backflow_rebuild",
    name: { en: "Backflow rebuild", es: "Reconstrucción de antisifón" },
    recipe: [
      { kind: "part", id: "bf_rebuild", qty: 1 },
      { kind: "labor", id: "skilled", qty: 1 },
    ],
    price: 165,
    rolled: true,
  },
  {
    id: "drip_conversion",
    name: { en: "Drip conversion", es: "Conversión a goteo" },
    recipe: [
      { kind: "part", id: "drip_kit", qty: 1 },
      { kind: "part", id: "drip_tubing", qty: 50 },
      { kind: "labor", id: "std", qty: 1.5 },
    ],
    price: 220,
    rolled: false, // itemized on the quote — demonstrates the roll-up flag
  },
];

export const SEED_CATALOG: Catalog = {
  parts: SEED_PARTS,
  labor: SEED_LABOR,
  issues: SEED_ISSUES,
  assemblies: SEED_ASSEMBLIES,
};

// ── users (roles + individual permission keys) ───────────────────────────────
export const SEED_USERS: User[] = [
  { id: "antonio", name: "Antonio", role: "lead", lang: "es", permissions: ROLE_PERMS.lead },
  { id: "luis", name: "Luis", role: "field", lang: "es", permissions: ROLE_PERMS.field },
  { id: "maria", name: "María", role: "office", lang: "en", permissions: ROLE_PERMS.office },
  { id: "admin", name: "Admin", role: "admin", lang: "en", permissions: ROLE_PERMS.admin },
];

// ── sample customers (from the real forms, §6 of the design handoff) ─────────
export const SEED_CUSTOMERS: Customer[] = [
  { id: "cust_cityhall", name: "City Hall (Panorama)", address: "328 S20", city: "Panorama Village, TX" },
  { id: "cust_marseille", name: "108 Marseille", address: "108 Marseille", city: "Conroe, TX" },
];

/** A brand-new local database, seeded and ready to run offline. */
export function freshDatabase(): Database {
  return {
    version: 1,
    users: SEED_USERS,
    catalog: SEED_CATALOG,
    customers: SEED_CUSTOMERS,
    inspections: [],
    settings: { lang: "es" },
    session: null,
  };
}
