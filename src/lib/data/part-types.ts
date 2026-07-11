/* ---------------------------------------------------------------------------
   Component-type dictionary. The translatable part of a catalog item is its
   TYPE — and irrigation has a finite, well-known vocabulary. Admins pick a type
   from this pre-translated list when adding a part; only brand / model / SKU /
   vendor / price are free-text (language-neutral), so nothing ever has to be
   translated by hand. An "Other" escape hatch keeps manual bilingual entry for
   the rare type that isn't here yet.
   --------------------------------------------------------------------------- */
import type { LocalizedName, Unit } from "./types";

export interface PartType {
  id: string;
  category: string;
  unit: Unit;
  name: LocalizedName;
}

const T = (id: string, category: string, unit: Unit, en: string, es: string): PartType => ({
  id,
  category,
  unit,
  name: { en, es },
});

export const PART_TYPES: PartType[] = [
  // Controllers
  T("ctrl_4", "Controller", "each", "Controller — 4-station", "Controlador — 4 estaciones"),
  T("ctrl_6", "Controller", "each", "Controller — 6-station", "Controlador — 6 estaciones"),
  T("ctrl_8", "Controller", "each", "Controller — 8-station", "Controlador — 8 estaciones"),
  T("ctrl_12", "Controller", "each", "Controller — 12-station", "Controlador — 12 estaciones"),
  T("ctrl_smart", "Controller", "each", "Smart Wi-Fi controller", "Controlador inteligente Wi-Fi"),
  T("ctrl_module", "Controller", "each", "Controller station module", "Módulo de estaciones"),
  T("ctrl_xformer", "Controller", "each", "Controller transformer 24V", "Transformador de controlador 24V"),

  // Valves
  T("valve_075", "Valve", "each", 'Electric valve 3/4"', 'Válvula eléctrica 3/4"'),
  T("valve_1", "Valve", "each", 'Electric valve 1"', 'Válvula eléctrica 1"'),
  T("valve_15", "Valve", "each", 'Electric valve 1-1/2"', 'Válvula eléctrica 1-1/2"'),
  T("valve_2", "Valve", "each", 'Electric valve 2"', 'Válvula eléctrica 2"'),
  T("valve_master", "Valve", "each", "Master valve", "Válvula maestra"),
  T("valve_solenoid", "Valve", "each", "Solenoid", "Solenoide"),
  T("valve_diaphragm", "Valve", "each", "Valve diaphragm / repair kit", "Kit de diafragma / reparación"),
  T("valve_ball", "Valve", "each", "Ball valve", "Válvula de bola"),
  T("valve_gate", "Valve", "each", "Gate / isolation valve", "Válvula de compuerta / aislamiento"),
  T("valve_qcv", "Valve", "each", "Quick-coupler valve", "Válvula de acople rápido"),

  // Spray heads
  T("spray_2", "Spray Head", "each", 'Pop-up spray body 2"', 'Aspersor emergente 2"'),
  T("spray_4", "Spray Head", "each", 'Pop-up spray body 4"', 'Aspersor emergente 4"'),
  T("spray_6", "Spray Head", "each", 'Pop-up spray body 6"', 'Aspersor emergente 6"'),
  T("spray_12", "Spray Head", "each", 'Pop-up spray body 12"', 'Aspersor emergente 12"'),
  T("shrub_head", "Spray Head", "each", "Shrub head (fixed riser)", "Aspersor de arbusto (fijo)"),
  T("shrub_adapter", "Spray Head", "each", "Shrub riser adapter", "Adaptador para arbusto"),

  // Spray nozzles
  T("noz_fixed", "Spray Nozzle", "each", "Fixed spray nozzle", "Boquilla de aspersión fija"),
  T("noz_adj", "Spray Nozzle", "each", "Adjustable (VAN) nozzle", "Boquilla ajustable (VAN)"),
  T("noz_mp", "Spray Nozzle", "each", "MP Rotator nozzle", "Boquilla MP Rotator"),
  T("noz_strip", "Spray Nozzle", "each", "Strip / side nozzle", "Boquilla de tira"),
  T("noz_set", "Spray Nozzle", "set", "Nozzle set", "Juego de boquillas"),

  // Rotors
  T("rotor_std", "Rotor", "each", "Rotor", "Rotor"),
  T("rotor_large", "Rotor", "each", "Large-radius rotor", "Rotor de radio grande"),
  T("rotor_nozzle", "Rotor", "set", "Rotor nozzle set", "Juego de boquillas de rotor"),

  // Drip
  T("drip_emitter", "Drip", "each", "Drip emitter", "Emisor de goteo"),
  T("drip_tubing_half", "Drip", "ft", 'Drip tubing 1/2"', 'Tubería de goteo 1/2"'),
  T("drip_tubing_qtr", "Drip", "ft", 'Distribution tubing 1/4"', 'Tubería de distribución 1/4"'),
  T("drip_pr", "Drip", "each", "Drip pressure regulator", "Regulador de presión para goteo"),
  T("drip_filter", "Drip", "each", "Drip filter", "Filtro para goteo"),
  T("drip_kit", "Drip", "each", "Drip conversion kit", "Kit de conversión a goteo"),
  T("drip_fitting", "Drip", "each", "Drip barbed fitting", "Conexión dentada para goteo"),
  T("goof_plug", "Drip", "each", "Goof plug", "Tapón (goof plug)"),

  // Backflow
  T("bf_pvb", "Backflow", "each", "PVB backflow preventer", "Antisifón PVB"),
  T("bf_dcv", "Backflow", "each", "Double check valve", "Válvula de doble retención"),
  T("bf_rp", "Backflow", "each", "Reduced-pressure assembly", "Válvula de presión reducida"),
  T("bf_rebuild", "Backflow", "each", "Backflow rebuild kit", "Kit de reconstrucción de antisifón"),

  // Sensors
  T("sensor_rain_wired", "Sensor", "each", "Rain sensor (wired)", "Sensor de lluvia (cableado)"),
  T("sensor_rain_wl", "Sensor", "each", "Rain sensor (wireless)", "Sensor de lluvia (inalámbrico)"),
  T("sensor_freeze", "Sensor", "each", "Freeze sensor", "Sensor de congelación"),
  T("sensor_flow", "Sensor", "each", "Flow sensor", "Sensor de flujo"),
  T("sensor_soil", "Sensor", "each", "Soil moisture sensor", "Sensor de humedad del suelo"),

  // Pipe & fittings
  T("pipe_pvc", "Pipe & Fittings", "ft", "PVC pipe", "Tubo PVC"),
  T("pipe_poly", "Pipe & Fittings", "ft", "Poly pipe", "Tubo de polietileno"),
  T("fitting_pvc", "Pipe & Fittings", "each", "PVC fitting", "Conexión PVC"),
  T("swing_joint", "Pipe & Fittings", "each", "Swing joint / funny pipe", "Codo articulado / tubo flexible"),
  T("riser", "Pipe & Fittings", "each", "Riser / nipple", "Niple / elevador"),
  T("pvc_cement", "Pipe & Fittings", "each", "PVC primer & cement", "Primer y cemento PVC"),

  // Wire & electrical
  T("wire", "Wire & Electrical", "ft", "Irrigation wire", "Cable de riego"),
  T("wire_conn", "Wire & Electrical", "each", "Waterproof wire connector", "Conector de cable impermeable"),
  T("splice_kit", "Wire & Electrical", "each", "Splice kit", "Kit de empalme"),

  // Valve boxes
  T("vbox_round", "Valve Box", "each", "Round valve box", "Caja de válvula redonda"),
  T("vbox_rect", "Valve Box", "each", "Rectangular valve box", "Caja de válvula rectangular"),
  T("vbox_jumbo", "Valve Box", "each", "Jumbo valve box", "Caja de válvula jumbo"),

  // Consumables
  T("teflon", "Consumables", "each", "Teflon tape", "Cinta de teflón"),
  T("flags", "Consumables", "set", "Marking flags", "Banderas de marcado"),
];
