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
      h: "Customers & job history",
      p: "Open Customers from the menu to browse everyone in the database, searchable by name or address. Tap a customer to see their job history — every past inspection and work order at that property, with the date, status, what was found, and the total. Tap any past job to see the full detail (parts and labor used). Start a new inspection right from the customer. Admins can remove a customer added by mistake.",
    },
    {
      h: "Address & site map",
      p: "On a new inspection, start typing the address to pick it from Google, or tap “Use my location” to fill it from GPS. From the Zones hub, open the Site map to see the property from above: pick a zone, draw its coverage, and drop sprinkler pins. Tap a shape or pin to select it, then Remove. Save the map — it warns you if you leave with unsaved changes.",
    },
    {
      h: "Roles & permissions",
      p: "Field tech (capture), Office (pricing), Admin (everything, incl. the approval gate). Permissions are individual switches: see prices, set/override prices, manage catalog, and approve work orders. Manage people under Team.",
    },
    {
      h: "Fixing mistakes",
      p: "Backing out of a brand-new inspection before entering anything leaves nothing behind. Admins can permanently delete an inspection/quote from the Review screen or the Queue, and remove a customer from the Customers screen. Every destructive action asks you to confirm first.",
    },
    {
      h: "Catalog",
      p: "Admins edit parts, labor rates, assemblies, and issue types under Catalog. Parts are grouped by component type. To add a part, pick its component type — the name fills in both English and Spanish automatically, so you never translate by hand; then enter brand, model, SKU, and price. 'Load starter items' pulls in the full starter list without touching your edits. Starter prices are placeholders — replace them with your real numbers.",
    },
    {
      h: "Training mode",
      p: "Turn on Training mode (bottom of the sidebar, or the More menu on mobile) to practice with sample data at every lifecycle stage. A banner shows while it's on, and nothing you do touches real records — no saving to the server or device. Turn it off to return to your real data untouched. It's the safe way to onboard a new hire without mixing sample and real customers.",
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
      h: "Clientes e historial",
      p: "Abre Clientes desde el menú para ver a todos en la base de datos, con búsqueda por nombre o dirección. Toca un cliente para ver su historial — cada inspección y orden de trabajo en esa propiedad, con la fecha, el estado, lo que se encontró y el total. Toca cualquier trabajo pasado para ver el detalle completo (piezas y mano de obra usadas). Inicia una nueva inspección desde el cliente. Los admins pueden eliminar un cliente agregado por error.",
    },
    {
      h: "Dirección y mapa del sitio",
      p: "En una nueva inspección, escribe la dirección para elegirla de Google, o toca “Usar mi ubicación” para llenarla por GPS. Desde las Zonas, abre el Mapa del sitio para ver la propiedad desde arriba: elige una zona, dibuja su cobertura y coloca aspersores. Toca una forma o pin para seleccionarlo, luego Eliminar. Guarda el mapa — te avisa si sales con cambios sin guardar.",
    },
    {
      h: "Roles y permisos",
      p: "Técnico de campo (captura), Oficina (cotización), Admin (todo, incl. la aprobación). Los permisos son interruptores: ver precios, fijar/cambiar precios, administrar catálogo y aprobar órdenes. Administra personas en Equipo.",
    },
    {
      h: "Corregir errores",
      p: "Si sales de una inspección nueva antes de capturar algo, no queda nada guardado. Los admins pueden eliminar de forma permanente una inspección/cotización desde Revisar o la Cola, y quitar un cliente desde la pantalla de Clientes. Toda acción destructiva pide confirmación primero.",
    },
    {
      h: "Catálogo",
      p: "Los admins editan piezas, mano de obra, ensambles y tipos de problema en Catálogo. Las piezas se agrupan por tipo de componente. Para agregar una pieza, elige su tipo de componente — el nombre se llena en inglés y español automáticamente, sin traducir a mano; luego captura marca, modelo, SKU y precio. “Cargar elementos iniciales” trae la lista completa sin tocar tus cambios. Los precios iniciales son de ejemplo — reemplázalos con los tuyos.",
    },
    {
      h: "Modo de entrenamiento",
      p: "Activa el Modo de entrenamiento (al final de la barra lateral, o el menú Más en el teléfono) para practicar con datos de ejemplo en cada etapa. Aparece un aviso mientras está activo y nada de lo que hagas afecta los registros reales — no se guarda en el servidor ni en el dispositivo. Desactívalo para volver a tus datos reales intactos. Es la forma segura de capacitar a alguien nuevo sin mezclar datos de ejemplo con clientes reales.",
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
