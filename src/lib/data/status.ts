import type { InspectionStatus } from "./types";

/** Map an inspection status to its badge CSS class. Shared by every list/badge
    so the status→colour mapping lives in one place. */
export function badgeTone(s: InspectionStatus): string {
  if (s === "completed") return "done";
  if (s === "approved" || s === "in_progress") return "navy";
  if (s === "returned") return "red";
  return "new";
}
