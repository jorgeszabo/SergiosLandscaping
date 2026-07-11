"use client";
import type { ComponentType, SVGProps } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import type { Theme } from "@/lib/data/types";
import { IconContrast, IconMoon, IconSun } from "@/components/icons";

type IconT = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
const OPTS: { id: Theme; Icon: IconT; key: string }[] = [
  { id: "light", Icon: IconContrast, key: "themeLight" },
  { id: "dark", Icon: IconMoon, key: "themeDark" },
  { id: "sunny", Icon: IconSun, key: "themeSunny" },
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
          <o.Icon size={16} />
          {!compact && <span>{t(o.key)}</span>}
        </button>
      ))}
    </div>
  );
}
