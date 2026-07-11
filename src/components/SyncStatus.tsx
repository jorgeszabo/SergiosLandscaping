"use client";
/* Calm "saved, will sync" reassurance — never an alarming error (design §4). */
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";

export function SyncStatus() {
  const { mode, online, syncState } = useStore();
  const { t } = useI18n();

  if (mode === "local") {
    return <span className="syncpill synced">💾 {t("synced")}</span>;
  }
  if (!online || syncState === "offline") {
    return <span className="syncpill offline">⛺ {t("offline")}</span>;
  }
  if (syncState === "pending") {
    return <span className="syncpill pending">↻ {t("pendingSync")}</span>;
  }
  return <span className="syncpill synced">✓ {t("synced")}</span>;
}
