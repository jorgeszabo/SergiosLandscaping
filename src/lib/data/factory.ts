import { uid } from "./id";
import type { Inspection, User } from "./types";

/** Build a fresh, blank inspection draft for `user`. One place to add a new
    Inspection/snapshot field instead of four call sites. `overrides` lets a
    caller prefill (e.g. starting a job from a known customer). */
export function newInspectionDraft(user: User, overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: uid(),
    customer: "",
    address: "",
    city: "",
    tech: user.name,
    techId: user.id,
    date: new Date().toISOString().slice(0, 10),
    status: "draft",
    snapshot: { brand: "", model: "", stations: "", backflow: "", pressure: "", rainSensor: "" },
    zones: [],
    lines: [],
    ...overrides,
  };
}
