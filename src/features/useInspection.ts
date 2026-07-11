"use client";
import { useStore } from "@/lib/data/store-context";
import { useNav } from "./nav";
import type { Inspection } from "@/lib/data/types";

/** Resolve the inspection the current view points at, plus a save helper that
    persists locally and syncs to the server. */
export function useInspection() {
  const { view } = useNav();
  const { db, upsertInspection } = useStore();
  const insp = db.inspections.find((i) => i.id === view.inspId) || null;
  const save = (next: Inspection) => upsertInspection(next);
  return { insp, save, catalog: db.catalog };
}
