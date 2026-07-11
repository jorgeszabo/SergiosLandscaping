"use client";
/* Google Maps loader. The key is a public, referrer-restricted client key
   (NEXT_PUBLIC_*). The feature activates only when the key is present; otherwise
   the map screens show a friendly "not configured" state. */

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export const mapsConfigured = (): boolean => MAPS_KEY.length > 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loader: Promise<any> | null = null;

/** Load the Maps JS API (places + drawing + marker) once; resolves with
    `google.maps`. Rejects if no key or the script fails. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (!MAPS_KEY) return Promise.reject(new Error("Google Maps key not configured"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    window.__gmapsCb = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("Maps loaded but google.maps missing"));
    };
    const s = document.createElement("script");
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}` +
      `&libraries=places,drawing,marker&loading=async&callback=__gmapsCb`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return loader;
}
