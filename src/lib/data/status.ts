import type { Inspection, InspectionStatus, User } from "./types";

/** Map an inspection status to its badge CSS class. Shared by every list/badge
    so the status→colour mapping lives in one place. */
export function badgeTone(s: InspectionStatus): string {
  if (s === "completed") return "done";
  if (s === "approved" || s === "in_progress") return "navy";
  if (s === "returned") return "red";
  return "new";
}

/** The inspections that need THIS user's action, most urgent first. Office/admin
    see everyone's review/schedule queue; field/lead see only their own jobs
    (rework → drafts → their work orders). Used by the dashboard and the nav
    "work waiting" badge. */
export function myAttention(inspections: Inspection[], user: User): Inspection[] {
  const isOffice = user.role === "office" || user.role === "admin";
  const scope = isOffice ? inspections : inspections.filter((i) => i.techId === user.id);
  const order: InspectionStatus[] = isOffice
    ? ["submitted", "under_review", "approved"]
    : ["returned", "draft", "approved", "in_progress"];
  return scope
    .filter((i) => order.includes(i.status))
    .sort(
      (a, b) =>
        order.indexOf(a.status) - order.indexOf(b.status) || (b.updatedAt || 0) - (a.updatedAt || 0)
    );
}
