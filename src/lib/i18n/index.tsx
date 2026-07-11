"use client";
/* React context for language: current lang, translate helper t(), and nm() for
   bilingual data names. Language is a per-user setting (§5). */
import { createContext, useContext, useCallback } from "react";
import type { Lang, LocalizedName } from "@/lib/data/types";
import { STRINGS } from "./strings";

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a UI string key. */
  t: (key: string) => string;
  /** Display a bilingual data name in the current language. */
  nm: (o: LocalizedName | undefined) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  lang,
  setLang,
  children,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  children: React.ReactNode;
}) {
  const t = useCallback(
    (key: string) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key,
    [lang]
  );
  const nm = useCallback(
    (o: LocalizedName | undefined) => (o ? o[lang] || o.en : ""),
    [lang]
  );
  return (
    <I18nContext.Provider value={{ lang, setLang, t, nm }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
