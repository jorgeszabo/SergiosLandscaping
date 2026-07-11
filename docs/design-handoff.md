# Design Handoff Packet — Irrigation Inspection-to-Quote App

*For Claude Design. Goal: turn the locked wireframes and structure into a polished, clickable prototype that wows on first look and can be trialed for feedback. This packet is about **appearance, layout, states, and feel** — not data or logic (that's the Code packet's job).*

**Companion documents:** `irrigation-app-requirements-v0.4.md` (full spec), `irrigation-parts-catalog-STARTER.xlsx` (real sample data to populate screens).

---

## 0. What this prototype is (and isn't)

- **Is:** a beautiful, navigable click-through — real-looking screens with realistic sample content, tappable/clickable transitions, both a phone face and a desktop face.
- **Isn't:** a working app. No real login, database, offline sync, or PDF generation. Buttons navigate between screens and show states; they don't persist data. That's intentional — the working version comes from the Code handoff, which will inherit this design.
- **Success test:** the owner and a couple of techs look at it, immediately get it, and can tell us "yes, but change X." Wow + trial + feedback.

---

## 1. Who uses it — design for these two people

- **Field tech** — on a **phone or tablet**, outdoors, bright sun, often one thumb, sometimes gloves. Spanish-first. Values speed and big tap targets over density.
- **Office admin** — on a **laptop/desktop**, reviewing and pricing. Comfortable with denser tables and side-by-side editing.

**One app, two faces, same visual DNA.** Design both. The phone face is the capture flow; the desktop face is the queue, quote editor, and catalog manager.

---

## 2. Brand & aesthetic direction

- **Feeling:** trustworthy, clean, modern trade software — think "the tool a sharp irrigation crew is proud to hand a customer," not clip-art landscaping. Confident, not flashy.
- **Company:** Sergio's Landscaping (Commercial & Residential). If a logo is available, use it; otherwise a clean wordmark placeholder.
- **Palette suggestion (open to your judgment):** a grounded green as primary (irrigation/landscape), a neutral gray scale for surfaces, and one clear accent for actions and the "price appears" moment. Keep it calm — this is a work tool used all day.
- **Type:** highly legible at a glance and in sunlight; generous sizes on the field face.
- **Tone of UI copy:** plain, warm, sentence case. Bilingual (see §5).

---

## 3. Screens to design

Low-fi wireframes already exist for all of these — your job is to elevate them, not reinvent the structure. Keep the flows and information exactly as specified; make them beautiful and real.

### Field face (phone)
1. **Log in** — simple, big fields, language visible/switchable.
2. **Start job** — customer, address, city/state/zip. (Search existing or add new.)
3. **System overview** — controller brand + model, station count (note: "creates N zones"), backflow, static pressure, rain sensor.
4. **Zones (hub)** — the home base. List of zones each with a status (done / has issues / not started), plus a prominent "add system-wide issue" and "review & price." This is the most important navigation screen — it must feel like a comfortable base to return to.
5. **Zone detail** — makeup (waters turf/beds; head types as chips), current schedule, list of logged issues, "add issue."
6. **Add issue (the hero screen)** — pick issue → issue-specific attribute fields appear → count, severity, repair/replace, photo. **The live price preview** ("→ 3× Hunter PGP rotor · $75 est.") must feel like a small moment of magic — this is the emotional centerpiece of the whole app. Make it satisfying.
7. **Review & submit** — summary (zones/issues), estimate total, line items, signature capture, offline/sync reassurance, submit.

### Office face (desktop)
8. **Inspection queue** — a triage inbox: table of submitted inspections (customer, address, tech, issue count, est. total, status) with filter tabs. Scannable at a glance.
9. **Quote editor (the office hero)** — the working cart. Line items grouped into **on quote / deferred (future visit) / declined**; the deferred and declined lines visibly set aside (dimmed/struck) but present. Add-line controls (part, labor, assembly, local purchase). Right rail with parts/labor/cost/margin/total and the one prominent **"Approve → work order"** action plus proposal-PDF and send-back actions.
10. **Catalog / assembly manager** — tabbed (parts / assemblies / labor / issue types). Show the assembly editor: bilingual name fields (English + Español), the recipe (parts + labor rows), price, and a "show recipe on quote: rolled up / itemized" toggle.

---

## 4. States & interactions to show (this is what makes it feel real)

Design isn't just the happy path. Please include:

- **Empty states** — no jobs yet, a zone with no issues logged, an empty queue. Make them inviting, not barren.
- **Filled vs. in-progress** — a zone mid-inspection, a partially-completed job. The status indicators on the Zones hub are central.
- **The attribute-reveal** — on Add Issue, show how fields *appear* after an issue is picked (the form grows). Even as a prototype, show before/after.
- **The price-appears moment** — the estimate line materializing once issue + attributes are set.
- **Finding-state transitions** — a line moving between on-quote / deferred / declined in the quote editor.
- **Deferred/declined visual treatment** — clearly "parked," not deleted.
- **Running-total toggle** — the field face has a hidden-by-default estimate total; show both on and off.
- **Offline indicator** — a calm "saved, will sync" reassurance, not an alarming error.

---

## 5. Bilingual — design for two languages from the start

- Every label, button, and screen title must be **designed to hold either English or Spanish** — and Spanish text often runs ~20–30% longer, so leave room; don't design layouts that only fit tight English.
- Show a **language switch** (per-user). Ideally present the field face in **Spanish** as the default in at least one version, to reflect the real workforce.
- Data names are bilingual too (issue names, part names, assembly names) — the catalog manager shows both fields side by side.

---

## 6. Realistic sample content (pull from the starter catalog)

Populate screens with the real seed data so it looks true, not lorem-ipsum:
- **Customers/jobs:** use the real forms — "City Hall (Panorama), 328 S20" and "108 Marseille"; techs Antonio and Luis.
- **Parts/prices/assemblies:** pull from `irrigation-parts-catalog-STARTER.xlsx` — e.g. Hunter PGP rotor $25, spray nozzle $5, "new zone install" assembly $600.
- **Issues:** from the real list — broken head, broken nozzle, leak in lateral, mixed manufacturers, etc.

---

## 7. Explicit non-goals for the prototype

Leave these for the Code handoff — don't try to fake them deeply: real authentication, real data persistence, real offline sync, real PDF export, the actual price *calculation engine* (show believable numbers, don't build the math). If a screen needs a number, use a realistic static one.

---

## 8. Handoff back to Code

When the prototype is approved, what Code needs from Design: the finalized screen layouts, the color/type system, the component styles (buttons, inputs, chips, cards, line-item rows, status badges), and the interaction patterns. Keeping components consistent and named will make the merge into a working app clean.
