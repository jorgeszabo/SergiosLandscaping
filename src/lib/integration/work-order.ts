/* ---------------------------------------------------------------------------
   Integration seam — "work order out" (Code handoff §7, requirements §9).
   An approved work order is emitted as a clean, self-describing object that a
   scheduling / dispatch / routing system can consume without knowing anything
   about our internal storage. The exact contract firms up with the partner
   (requirements §15.11); this is the stable shape to build against.
   --------------------------------------------------------------------------- */
import type { Catalog, Inspection } from "@/lib/data/types";
import { priceLine, lineName, inspectionTotals } from "@/lib/money/engine";

export interface WorkOrderLineItem {
  kind: "issue" | "part" | "labor" | "assembly" | "local";
  description: string;
  detail: string;
  count: number;
  price: number;
  cost: number;
  state: "on" | "deferred" | "declined";
  zone: number | "system" | null;
  severity?: string;
  action?: string;
}

export interface WorkOrderExport {
  schema: "sergios.workorder/v1";
  sourceInspectionId: string;
  status: Inspection["status"];
  exportedAt: number;
  customer: {
    externalId?: string;
    name: string;
    address: string;
    city: string;
  };
  system: Inspection["snapshot"];
  zones: Inspection["zones"];
  lineItems: WorkOrderLineItem[];
  deferred: WorkOrderLineItem[];
  totals: { price: number; cost: number; parts: number; labor: number; margin: number };
  tech: string;
  date: string;
  signatureCaptured: boolean;
}

function toLineItem(
  line: Inspection["lines"][number],
  catalog: Catalog
): WorkOrderLineItem {
  const r = priceLine(line, catalog, "en");
  return {
    kind: line.kind,
    description: lineName(line, catalog, "en"),
    detail: r.detail,
    count: line.count || 1,
    price: r.price,
    cost: r.cost,
    state: line.state,
    zone: line.zone ?? null,
    severity: line.severity,
    action: line.action,
  };
}

/** Serialize an inspection into the outbound work-order contract. */
export function exportWorkOrder(insp: Inspection, catalog: Catalog): WorkOrderExport {
  const totals = inspectionTotals(insp, catalog);
  return {
    schema: "sergios.workorder/v1",
    sourceInspectionId: insp.id,
    status: insp.status,
    exportedAt: insp.updatedAt || Date.now(),
    customer: {
      externalId: insp.customerId,
      name: insp.customer,
      address: insp.address,
      city: insp.city,
    },
    system: insp.snapshot,
    zones: insp.zones,
    lineItems: insp.lines.filter((l) => l.state === "on").map((l) => toLineItem(l, catalog)),
    deferred: insp.lines.filter((l) => l.state === "deferred").map((l) => toLineItem(l, catalog)),
    totals,
    tech: insp.tech,
    date: insp.date,
    signatureCaptured: !!insp.signature,
  };
}
