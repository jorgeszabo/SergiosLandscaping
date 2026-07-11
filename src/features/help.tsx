"use client";
/* Per-page contextual help. A "?" button in the top bar opens a sheet with
   short, plain-language guidance for the current screen — bilingual. */
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Sheet } from "@/components/Sheet";
import { IconHelp } from "@/components/icons";
import type { ViewName } from "./nav";

type Entry = { title: string; steps: string[] };
const HELP: Partial<Record<ViewName, { en: Entry; es: Entry }>> = {
  home: {
    en: { title: "Home", steps: [
      "Your dashboard shows what needs attention and your recent jobs.",
      "Use the bottom tabs to move between Home, Inspections, and more.",
      "Tap “New inspection” to start a job in the field.",
    ]},
    es: { title: "Inicio", steps: [
      "El panel muestra lo que necesita atención y tus trabajos recientes.",
      "Usa las pestañas de abajo para moverte entre Inicio, Inspecciones y más.",
      "Toca “Nueva inspección” para comenzar un trabajo en campo.",
    ]},
  },
  newJob: {
    en: { title: "Start a job", steps: [
      "Pick an existing customer or type a new one.",
      "Add the address, then tap Next to record the system.",
    ]},
    es: { title: "Comenzar un trabajo", steps: [
      "Elige un cliente existente o escribe uno nuevo.",
      "Agrega la dirección y toca Siguiente para registrar el sistema.",
    ]},
  },
  snapshot: {
    en: { title: "System overview", steps: [
      "Record the controller, backflow, pressure and rain sensor.",
      "The number of stations creates that many zones automatically.",
    ]},
    es: { title: "Vista del sistema", steps: [
      "Registra el control, antisifón, presión y sensor de lluvia.",
      "El número de estaciones crea esa cantidad de zonas automáticamente.",
    ]},
  },
  zones: {
    en: { title: "Zones", steps: [
      "This is home base. Tap a zone to inspect it.",
      "Add a system-wide issue for problems that aren't in one zone.",
      "When done, tap Review & price to build the estimate.",
    ]},
    es: { title: "Zonas", steps: [
      "Este es el punto base. Toca una zona para inspeccionarla.",
      "Agrega un problema general para lo que no está en una zona.",
      "Al terminar, toca Revisar y cotizar para armar el estimado.",
    ]},
  },
  zone: {
    en: { title: "Zone detail", steps: [
      "Mark what it waters and the head types.",
      "Tap “Add issue” to log a problem — a price appears automatically.",
    ]},
    es: { title: "Detalle de zona", steps: [
      "Marca qué riega y los tipos de cabezas.",
      "Toca “Agregar problema” para registrarlo — el precio aparece solo.",
    ]},
  },
  addIssue: {
    en: { title: "Add an issue", steps: [
      "Pick the problem; extra fields appear to pin down the exact fix.",
      "Set the count, severity, and add a photo.",
      "The estimated fix and price update live. Tap Save.",
    ]},
    es: { title: "Agregar problema", steps: [
      "Elige el problema; aparecen campos para definir la reparación exacta.",
      "Indica la cantidad, gravedad y agrega una foto.",
      "La reparación y el precio se actualizan en vivo. Toca Guardar.",
    ]},
  },
  review: {
    en: { title: "Review & quote", steps: [
      "Line items are grouped: on quote, deferred, declined.",
      "In the field, the customer signs to approve the estimate, then submit.",
      "In the office, review, approve into a work order, then complete it.",
    ]},
    es: { title: "Revisar y cotizar", steps: [
      "Las líneas se agrupan: en cotización, diferido, rechazado.",
      "En campo, el cliente firma para aprobar el estimado y se envía.",
      "En oficina, revisa, aprueba en orden de trabajo y complétala.",
    ]},
  },
  print: {
    en: { title: "Proposal", steps: [
      "This is the branded proposal for the customer.",
      "Tap Print / save to print or save as PDF.",
    ]},
    es: { title: "Propuesta", steps: [
      "Esta es la propuesta con marca para el cliente.",
      "Toca Imprimir / guardar para imprimir o guardar como PDF.",
    ]},
  },
  catalog: {
    en: { title: "Catalog", steps: [
      "Tabs for parts, labor, assemblies and issue types.",
      "Search, then tap an item to edit its prices and names.",
      "Prices are starter placeholders — replace with your real numbers.",
    ]},
    es: { title: "Catálogo", steps: [
      "Pestañas de piezas, mano de obra, ensambles y tipos de problema.",
      "Busca y toca un elemento para editar sus precios y nombres.",
      "Los precios son de ejemplo — reemplázalos con los tuyos.",
    ]},
  },
  office: {
    en: { title: "Queue", steps: [
      "Submitted inspections land here for review.",
      "Filter by needs review, work orders, or completed.",
      "Open one to price, approve, and track it to completion.",
    ]},
    es: { title: "Cola", steps: [
      "Las inspecciones enviadas llegan aquí para revisión.",
      "Filtra por por revisar, órdenes de trabajo o completadas.",
      "Abre una para cotizar, aprobar y seguirla hasta completarla.",
    ]},
  },
  team: {
    en: { title: "Team & access", steps: [
      "Add people and set their role and permissions.",
      "Set or reset a password — you'll see the value when you set it.",
    ]},
    es: { title: "Equipo y accesos", steps: [
      "Agrega personas y define su rol y permisos.",
      "Asigna o reinicia una contraseña — verás el valor al asignarla.",
    ]},
  },
};

export function HelpButton({ view }: { view: ViewName }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const entry = HELP[view]?.[lang];
  if (!entry) return null;
  return (
    <>
      <button
        className="iconbtn"
        aria-label="Help"
        onClick={() => setOpen(true)}
        title={lang === "es" ? "Ayuda" : "Help"}
      >
        <IconHelp size={19} />
      </button>
      {open && (
        <Sheet onClose={() => setOpen(false)} pad>
          <h2 style={{ marginTop: 0, textTransform: "none", letterSpacing: 0, fontSize: 18, color: "var(--text-strong)" }}>
            {entry.title}
          </h2>
          <ol style={{ margin: "6px 0 12px", paddingLeft: 20, color: "var(--text-body)", lineHeight: 1.6 }}>
            {entry.steps.map((s, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{s}</li>
            ))}
          </ol>
          <button className="btn pri block" onClick={() => setOpen(false)}>
            {lang === "es" ? "Entendido" : "Got it"}
          </button>
        </Sheet>
      )}
    </>
  );
}
