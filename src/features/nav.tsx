"use client";
/* In-app router. State-based navigation (not per-URL routes) keeps the field
   face working offline and mirrors the hub-and-spoke flow from the design. */
import { createContext, useContext, useCallback, useState } from "react";

export type ViewName =
  | "home"
  | "newJob"
  | "snapshot"
  | "zones"
  | "zone"
  | "addIssue"
  | "review"
  | "print"
  | "catalog"
  | "office"
  | "team"
  | "guide";

export interface View {
  name: ViewName;
  inspId?: string;
  zn?: number | "system";
  tab?: string;
}

interface Nav {
  view: View;
  navigate: (v: View) => void;
  back: () => void;
}

const NavContext = createContext<Nav | null>(null);

export function NavProvider({
  initial = { name: "home" },
  children,
}: {
  initial?: View;
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<View[]>([initial]);
  const view = stack[stack.length - 1];

  const navigate = useCallback((v: View) => {
    setStack((s) => [...s, v]);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  return <NavContext.Provider value={{ view, navigate, back }}>{children}</NavContext.Provider>;
}

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
