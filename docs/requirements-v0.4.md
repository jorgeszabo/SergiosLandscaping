# Irrigation Inspection-to-Quote App — Requirements & Flow (v0.4)

*A living "north star" document. Everything here is a draft to react to, not a locked decision. Changes since v0.3 are marked **[new in v0.4]**. Open questions are collected at the end.*

---

## 1. The one-paragraph north star

We're digitizing a paper process where a **field tech** inspects a residential irrigation system, records its current condition and problems, prices the repairs, and submits it to the **back office**, where an **Admin** reviews and approves it into a work order. The app is a **digital job folder that rides from the truck to the office**. The core win: a problem logged in the field turns into a priced line item **automatically**.

**Design stance:** a world-class default the company configures and edits. Ship sensible starter data (parts, prices, issue types, labor rates, assemblies) an Admin can change.

**Positioning [new in v0.4]:** a **standalone irrigation module** — sharp and excellent at inspection-to-quote — built with **clean integration seams** so it can later be absorbed into a larger platform (scheduling, routing, dispatch) that a partner is building separately. We stay narrow on purpose; being specialized where all-in-one tools are generic is the strategy, not a limitation.

Scope for v1: **inspection → priced estimate → admin-approved work order** (residential). Not a water-efficiency audit; not scheduling/dispatch (see §13).

---

## 2. What the paper taught us: four layers hiding in two sheets

The forms blend four kinds of information; the app separates and **auto-links** them: **A. Job & site** · **B. System snapshot** · **C. Zone conditions** (schedule + makeup + problems) · **D. Parts & price**. The paper's flaw is that C (the problem) and D (part + price) are disconnected, forcing the same fact to be written three times. The app collapses this into one structured record.

---

## 3. The core data model

### 3a. Issue → Attributes → Part/Assembly/Labor → Price (the money chain)

A logged problem is a structured record: **what** (issue), **where** (zone or system-wide), **how many** (count), **attributes** (issue-specific follow-ups that pick the exact fix), **severity** (safety / functional / efficiency), **repair or replace**, **proof** (photo + optional note). Chain: **issue + attributes → exact part, assembly, and/or labor → price.**

### 3b. Line-item types

- **Part** — a single catalog SKU.
- **Labor** — first-class line (service call, hours). Can stand alone, ride in an assembly, or attach to an issue's default fix. This is what makes it a full quote, not a parts list.
- **Assembly** — a pre-priced *recipe* of parts + labor (e.g. "new zone install" = valve + wire + pipe + heads + labor, $600). Admin-owned; per-assembly choice to show rolled-up or itemized on the quote.

### 3c. Finding state — the flexible quote

Every finding is **on this quote**, **deferred / future visit**, or **declined**. The quote is a *filtered view* of a complete inspection — deferring a finding never deletes it, so the office keeps the knowledge and no one re-inspects it next visit.

### 3d. The zone

**Makeup** (turf/beds, head types), **schedule** (current + optional proposed), **issues**. Generated from the controller's station count.

### 3e. The system snapshot

Controller brand/model + station count, backflow type + testable + installed, static pressure, rain sensor, isolation/master valve, "changed controller?" flag. Its job is to **generate zones**; it is **not a gate**.

### 3f. Managed lists (Admin-owned; editing is an Admin permission)

Issue types (attributes, default severity, fix mapping), Parts catalog (brand, model, vendor, vendor part # / SKU, cost, price), Assemblies, Labor rates, price book / markup. All ship as an editable starter set (companion spreadsheet).

### 3g. Bilingual data model [new in v0.4]

**Spanish-first workforce; the app is bilingual by design, not by translate-button.** Two distinct needs:
- **UI strings** (buttons, labels, screen titles) — standard localization, planned from day one.
- **User-entered data** (issue names, part names, assembly names) — each name carries an English *and* a Spanish version, entered by the Admin, shown per the user's chosen language. "Broken nozzle" / "Boquilla rota."

Language is a **per-user setting** (field likely defaults to Spanish, office either way). Building this in now is near-free; retrofitting after everything is in English is brutal. **Every piece of human-readable text is a label that can carry two versions — never hard-baked.**

---

## 4. The field flow — hub-and-spoke, not a locked wizard

The **zones list is home base.** From it the tech jumps to any spoke in any order and returns.

- **Spoke: a zone** — makeup, schedule, issues (count + severity + attributes + photo).
- **Spoke: system-wide issue** — controller, backflow, pressure — no zone required.
- **Spoke: system snapshot** — generates zones; optional, re-enterable, not a gate.
- **Spoke: review & price** — see §5.

Two paths, same hub: *full inspection* (snapshot → walk zones → review → submit, the nudged path) and *quick known issue* ("controller's dead" → add system-wide issue → price → submit, ~30 seconds).

Capture-first: price computed silently on every issue; **running total available but hidden by default** (per-user toggle) to avoid target-chasing. Works **offline**, syncs later. Close-out captures an on-site signature.

---

## 5. The office flow & screens [expanded in v0.4]

**Office-process assumptions (there was only paper; we're designing the good version). Guiding rule: every step must earn its friction. A small shop has no dedicated ops person, so default to fewest clicks — keep deliberate friction only where money leaves.**

1. **Queue = a triage inbox, not a task manager.** Submitted inspections in a list showing customer, address, tech, issue count, and estimated total at a glance, with filter tabs (needs review / all / approved). No manual statuses, no drag-and-drop columns.
2. **Opening one drops into the quote editor = the working cart.** Adjust (price, part, labor, assembly), stage (on-quote / deferred / declined), decide (approve or send back). Live recalculation. Right rail always shows margin.
3. **Approval is the one deliberate gate.** One action turns the estimate into an approved work order and unlocks the customer PDF. Assumed a **solo act** (one admin, no multi-person sign-off chain) — right for a small/mid shop; approval thresholds can be added later.
4. **Catalog / assembly manager = a back-room, not a daily screen.** Tabs for parts / assemblies / labor / issue types. Where the Admin builds the $600 zone recipe and edits prices, separate from daily quoting. Bilingual name fields (English / Español) live here.

Assumption: the tech's estimate is a **strong draft the admin refines**, not a separate thing to re-do.

Sketched wireframes exist for: field capture (6 screens), office queue, quote editor, catalog/assembly manager.

---

## 6. Users, roles & permissions

Accounts with roles (keyrings) + per-user permissions (keys). **Field Tech** (capture; may hold pricing keys), **Technical Lead** (owns issue types/attributes/mappings), **Office** (builds quotes), **Admin** (users, catalog, assemblies, price book, permissions; the approval gate). Keys: see prices · set/override price + local-purchase · edit catalog/assemblies (Admin) · approve into work order (Admin).

---

## 7. Authentication & security

Accounts with roles/permissions. **Passwords never stored** — one-way hashed via a standard auth library. Standard sessions and reset. Not improvised.

---

## 8. Platform & architecture — one app, two faces

One responsive web app, same data and logic: **field face** (phone/tablet — big taps, camera, offline) and **office face** (laptop/desktop — dense tables, quote editing, catalog management). Same URL, layout adapts to device.

**Code in GitHub · hosted on Vercel** (auto-publishes on push). **Database** is a companion decision at build time (Vercel-friendly options).

---

## 9. Integration seams — standalone but absorbable [new in v0.4]

Built as **a module with clean seams, not a sealed box** — excellent alone, easy to absorb into the partner's larger platform. Design the likely connection points as clean hand-offs from day one:

- **Customer / site record** — can be received from an external system rather than only created here.
- **Approved work order** — emitted as a clean output another system (scheduling/dispatch) can pick up.
- **Parts catalog, user accounts** — structured so they could be shared or synced later.

The partner has **GitHub access** to incorporate the module into what they're building. Same clean-seam discipline also keeps the module **extendable later** (e.g. in Claude Code) — the safe bet under uncertainty, regardless of which future happens.

---

## 10. Inventory / stock (Light, decided)

Catalog is the master list; tech picks from it; not-on-truck items become editable "local purchase" lines. No quantity tracking. Door left open to full inventory later.

---

## 11. Cross-cutting requirements

Offline-first · photo per issue · severity per issue · on-site signature · branded PDF with plain-language descriptions · running-total toggle (off by default) · **bilingual by design (per-user language)** · water-waste hook (future) · residential default, multi-controller-capable for commercial later.

---

## 12. Best-in-class pressure test [new in v0.4]

Checked against leading 2026 tools (ServiceTitan, Jobber, Housecall Pro, QuoteIQ, LMN, FieldPie, etc.).

**Confirms our design:** irrigation assemblies + takeoffs are how leaders price; margin-on-quote is standard; offline capture of photos/signatures/forms is the expected bar; English/Spanish apps already exist in-market (our bilingual requirement is table stakes — we go deeper).

**Trap to avoid:** most tools are all-in-one (dispatch, routing, GPS, marketing, payroll) with steep learning curves; reviewers ding the generalists for lacking irrigation-specific depth (zone mapping). Our edge is being sharp where they're generic. Stay narrow.

---

## 13. Roadmap — v2 and beyond, split by owner [new in v0.4]

**Ours (inside the quote — our lane), strong candidates post-v1:**
- **Customer online approval + e-signature** — loudest signal in the research; customers approve/sign digitally (esp. valuable for HOA/commercial). Natural next step after v1.
- **Customer-selectable optional / tiered line items** — customer toggles add-ons and watches the total update; builds directly on our finding-state model.

**Theirs (partner's platform — deliberately fenced off, we don't build but don't block):**
- Scheduling, routing, dispatch.
- Recurring / seasonal service (spring start-ups, fall blow-outs) — high-value in irrigation but a whole scheduling product.

Documenting both piles marks exactly where the seam is between our module and the partner's system.

---

## 14. Residential vs. commercial (v1 = residential)

Residential: one controller, ~4–8 zones, owner signature. Commercial (later): multiple controllers per site, many zones, staggered start times, site-manager check-in, possible backflow-test/compliance reporting.

---

## 15. Open questions / decisions still needed

1. ~~Field pricing?~~ **Resolved:** yes, with permission.
2. **New schedule:** billable deliverable, or advice bundled with the quote?
3. **Attribute depth:** how much part detail does the tech capture vs. the office fills in?
4. **Backflow testing:** separate regulated report, or just a snapshot flag for v1?
5. **Customer approval / e-signature:** research says high-value; confirm whether it's v1 or v2. (Leaning v2 per §13.)
6. ~~Real price list?~~ **Resolved:** ship an editable starter catalog.
7. ~~Inventory depth?~~ **Resolved:** Light for v1.
8. ~~Zone-by-zone vs issue-by-issue?~~ **Resolved:** zone-by-zone, hub-and-spoke.
9. ~~Inline vs deferred pricing?~~ **Resolved:** silent compute; running total hidden by default; real pricing at review.
10. **Database choice** — pick at build time (Vercel-friendly).
11. **Integration contract [new in v0.4]** — nail down the exact shape of the customer-in and work-order-out hand-offs once the partner's platform direction is clearer.
