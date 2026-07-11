"use client";
import { useEffect } from "react";
import { StoreProvider, useStore } from "@/lib/data/store-context";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/Toast";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { NavProvider, useNav } from "./nav";
import { DeskShell } from "./DeskShell";
import { MobileShell } from "./MobileShell";
import { Login } from "./screens/Login";
import { Home } from "./screens/Home";
import { NewJob } from "./screens/NewJob";
import { Snapshot } from "./screens/Snapshot";
import { Zones } from "./screens/Zones";
import { Zone } from "./screens/Zone";
import { AddIssue } from "./screens/AddIssue";
import { Review } from "./screens/Review";
import { Print } from "./screens/Print";
import { Catalog } from "./screens/Catalog";
import { Office } from "./screens/Office";
import { Team } from "./screens/Team";
import { Guide } from "./screens/Guide";

export default function App() {
  return (
    <StoreProvider>
      <Inner />
    </StoreProvider>
  );
}

function Inner() {
  const { lang, setLang } = useStore();

  // Register the offline app-shell service worker.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <ToastProvider>
        <NavProvider>
          <Root />
        </NavProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

function Splash() {
  return (
    <div className="app">
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ fontSize: 40 }}>💧</div>
      </main>
    </div>
  );
}

function Root() {
  const { ready, user } = useStore();
  if (!ready) return <Splash />;
  if (!user) return <Login />;
  return <Shell />;
}

function Shell() {
  const { user } = useStore();
  const isDesktop = useIsDesktop();
  const isOffice = user?.role === "office" || user?.role === "admin";
  // Office/admin get the desktop operations shell on wide screens; everyone
  // else (and everyone on phones) gets the mobile shell with bottom tabs.
  if (isOffice && isDesktop) {
    return (
      <DeskShell>
        <Screen />
      </DeskShell>
    );
  }
  return (
    <MobileShell>
      <Screen />
    </MobileShell>
  );
}

function Screen() {
  const { view } = useNav();
  switch (view.name) {
    case "home":
      return <Home />;
    case "newJob":
      return <NewJob />;
    case "snapshot":
      return <Snapshot />;
    case "zones":
      return <Zones />;
    case "zone":
      return <Zone />;
    case "addIssue":
      return <AddIssue />;
    case "review":
      return <Review />;
    case "print":
      return <Print />;
    case "catalog":
      return <Catalog />;
    case "office":
      return <Office />;
    case "team":
      return <Team />;
    case "guide":
      return <Guide />;
    default:
      return <Home />;
  }
}
