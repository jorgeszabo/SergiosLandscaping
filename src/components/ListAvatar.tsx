import { IconClipboard } from "./icons";

/** The small rounded clipboard avatar used in inspection/job list rows. */
export function ListAvatar() {
  return (
    <span
      style={{
        width: 34, height: 34, borderRadius: 8, flex: "none",
        background: "var(--brand-primary-soft)", color: "var(--brand-primary)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <IconClipboard size={18} />
    </span>
  );
}
