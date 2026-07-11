"use client";
import { useI18n } from "@/lib/i18n";

/* In-app user guide. Mirrors docs/USER_GUIDE.md in short, bilingual form. */
const GUIDE = {
  en: [
    {
      h: "What this app does",
      p: "It turns a field irrigation inspection into a priced quote and an admin-approved work order — one app, two faces: a phone flow for techs and an office view for pricing and approval.",
    },
    {
      h: "For the field tech",
      p: "1. Tap ＋ New inspection and enter the customer.\n2. Record the system overview — the station count creates the zones.\n3. From the Zones hub, open each zone and log issues. Pick the problem, answer the follow-up, set the count and severity, and add a photo — a price appears automatically.\n4. Add system-wide issues (controller, backflow) from the hub.\n5. Open Review, have the customer sign to approve the estimate, then Submit for review.",
    },
    {
      h: "For the office / admin",
      p: "1. Submitted inspections appear in the Queue.\n2. Open one to adjust line items, stage them as on-quote / deferred / declined, and see margin.\n3. Approve → creates a work order.\n4. Start work, then Mark complete and capture the customer's completion signature.\n5. Print the branded proposal at any point. Billing after completion is handled by the office, outside the app.",
    },
    {
      h: "Roles & permissions",
      p: "Field tech (capture), Office (pricing), Admin (everything, incl. the approval gate). Permissions are individual switches: see prices, set/override prices, manage catalog, and approve work orders. Manage people under Team.",
    },
    {
      h: "Catalog",
      p: "Admins edit parts, labor rates, assemblies, and issue types under Catalog. Search, tap an item, and edit its prices and bilingual names. The starter prices are placeholders — replace them with your real numbers.",
    },
    {
      h: "Offline & sync",
      p: "The field app works with no signal — everything is saved on the device and syncs when you're back online. The pill at the top of the dashboard shows the sync state.",
    },
  ],
  es: [
    {
      h: "Qué hace esta app",
      p: "Convierte una inspección de riego en campo en una cotización con precios y una orden de trabajo aprobada por el admin — una app, dos caras: un flujo de teléfono para técnicos y una vista de oficina para cotizar y aprobar.",
    },
    {
      h: "Para el técnico de campo",
      p: "1. Toca ＋ Nueva inspección y captura el cliente.\n2. Registra la vista del sistema — el número de estaciones crea las zonas.\n3. Desde las Zonas, abre cada zona y registra problemas. Elige el problema, responde el detalle, indica la cantidad y gravedad, y agrega una foto — el precio aparece solo.\n4. Agrega problemas generales (control, antisifón) desde las Zonas.\n5. Abre Revisar, pide al cliente que firme para aprobar el estimado y toca Enviar a revisión.",
    },
    {
      h: "Para la oficina / admin",
      p: "1. Las inspecciones enviadas aparecen en la Cola.\n2. Abre una para ajustar líneas, marcarlas como en cotización / diferido / rechazado, y ver el margen.\n3. Aprobar → crea una orden de trabajo.\n4. Inicia el trabajo, luego Marcar completado y captura la firma de finalización del cliente.\n5. Imprime la propuesta con marca en cualquier momento. La facturación posterior la maneja la oficina, fuera de la app.",
    },
    {
      h: "Roles y permisos",
      p: "Técnico de campo (captura), Oficina (cotización), Admin (todo, incl. la aprobación). Los permisos son interruptores: ver precios, fijar/cambiar precios, administrar catálogo y aprobar órdenes. Administra personas en Equipo.",
    },
    {
      h: "Catálogo",
      p: "Los admins editan piezas, mano de obra, ensambles y tipos de problema en Catálogo. Busca, toca un elemento y edita sus precios y nombres bilingües. Los precios iniciales son de ejemplo — reemplázalos con los tuyos.",
    },
    {
      h: "Sin conexión y sincronización",
      p: "La app de campo funciona sin señal — todo se guarda en el dispositivo y se sincroniza al reconectar. La etiqueta arriba del panel muestra el estado de sincronización.",
    },
  ],
};

export function Guide() {
  const { lang, t } = useI18n();
  const sections = GUIDE[lang];
  return (
    <div style={{ maxWidth: 720 }}>
      <h1>{t("userGuide")}</h1>
      <p className="sub">{t("appName")} · {t("moduleName")}</p>
      {sections.map((s, i) => (
        <div className="card" key={i}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 8px", color: "var(--text-strong)" }}>
            {s.h}
          </h3>
          <p style={{ margin: 0, whiteSpace: "pre-line", color: "var(--text-body)", lineHeight: 1.6 }}>{s.p}</p>
        </div>
      ))}
    </div>
  );
}
