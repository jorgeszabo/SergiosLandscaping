/* Minimal ambient typing for the Google Maps JS API loaded at runtime via a
   script tag. Kept as `any` to avoid a heavy @types dependency; the map code is
   isolated in a few components. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google: any;
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
    __gmapsCb?: () => void;
  }
}
export {};
