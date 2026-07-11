"use client";
import dynamic from "next/dynamic";

// The app is a client-rendered SPA so the field face works fully offline.
const App = dynamic(() => import("@/features/App"), { ssr: false });

export default function Page() {
  return <App />;
}
