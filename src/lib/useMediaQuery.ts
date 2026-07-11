"use client";
import { useEffect, useState } from "react";

/** Reactive media query. Returns false on the server / first paint. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatches(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 900px)");
