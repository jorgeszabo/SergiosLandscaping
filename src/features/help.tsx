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
      "Type a name to search existing customers, or enter a new one.",
      "Start typing the address to pick it from Google, or tap “Use my location”.",
      "Tap Next to record the system.",
    ]},
    es: { title: "Comenzar un trabajo", steps: [
      "Escribe un nombre para buscar clientes, o ingresa uno nuevo.",
      "Escribe la dirección para elegirla de Google, o toca “Usar mi ubicación”.",
      "Toca Siguiente para registrar el sistema.",
    ]},
  },
  customers: {
    en: { title: "Customers", steps: [
      "Every saved customer, searchable by name, address, or city.",
      "Tap “Start inspection” on a customer to begin a job there.",
      "Admins can remove an entry added by mistake with the trash icon.",
    ]},
    es: { title: "Clientes", steps: [
      "Todos los clientes guardados; busca por nombre, dirección o ciudad.",
      "Toca “Iniciar inspección” en un cliente para comenzar un trabajo ahí.",
      "Los administradores pueden eliminar un registro con el icono de bote.",
    ]},
  },
  map: {
    en: { title: "Site map", steps: [
      "Pick a zone, then Draw zone to outline its coverage, or add sprinkler pins.",
      "Tap a shape or pin to select it, then Remove selected to delete it.",
      "Save map when done — an “Unsaved changes” note warns you before leaving.",
    ]},
    es: { title: "Mapa del sitio", steps: [
      "Elige una zona, luego Dibujar zona para su cobertura, o agrega aspersores.",
      "Toca una forma o pin para seleccionarlo, luego Eliminar selección.",
      "Guarda el mapa al terminar — un aviso te avisa si hay cambios sin guardar.",
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
      "Parts are grouped by component type; filter with the chips or search.",
      "Add a part by picking its component type — the name fills in both languages, so you never translate. Then enter brand, model, SKU and price.",
      "Use “Load starter items” to pull in the full starter list without losing your edits. Prices are placeholders — replace with your real numbers.",
    ]},
    es: { title: "Catálogo", steps: [
      "Las piezas se agrupan por tipo de componente; filtra con los chips o busca.",
      "Agrega una pieza eligiendo su tipo de componente — el nombre se llena en ambos idiomas, sin traducir. Luego captura marca, modelo, SKU y precio.",
      "Usa “Cargar elementos iniciales” para traer la lista completa sin perder tus cambios. Los precios son de ejemplo — reemplázalos.",
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
