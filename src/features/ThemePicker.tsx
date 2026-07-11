"use client";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import type { Theme } from "@/lib/data/types";

const OPTS: { id: Theme; icon: string; key: string }[] = [
  { id: "light", icon: "◐", key: "themeLight" },
  { id: "dark", icon: "☾", key: "themeDark" },
  { id: "sunny", icon: "☀", key: "themeSunny" },
];

/** Light / Dark / Sunny segmented control. Sunny is a high-contrast mode for
    reading the screen outdoors in bright sun. */
export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useStore();
  const { t } = useI18n();
  return (
    <div className="pillbar" style={{ margin: 0, gap: 6 }}>
      {OPTS.map((o) => (
        <button
          key={o.id}
          className={`chip ${theme === o.id ? "on" : ""}`}
          onClick={() => setTheme(o.id)}
          aria-label={t(o.key)}
          style={compact ? { padding: "6px 10px" } : undefined}
        >
          <span aria-hidden="true">{o.icon}</span>
          {!compact && <span>{t(o.key)}</span>}
        </button>
      ))}
    </div>
  );
}
