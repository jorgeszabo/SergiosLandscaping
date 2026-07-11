# Code Handoff Packet — Irrigation Inspection-to-Quote App

*The build packet this repository implements. Companion documents:
`requirements-v0.4.md` (source of truth), `irrigation-parts-catalog-STARTER.xlsx`
(seed data), `design-handoff.md` + `prototype.html` (the approved design).*

## 0. What we're building

A standalone irrigation inspection-to-quote web app. Field techs capture
inspections on a phone (offline-capable); the office reviews, prices, and
approves them into work orders on desktop. One responsive app, two faces, same
data — built with clean integration seams so a partner's larger platform
(scheduling/routing) can absorb it later.

**In scope for v1:** auth, inspection capture, the issue→part/labor/assembly→
price engine, the quote editor with finding-states, admin approval → work order,
the catalog/assembly/labor/issue-type managers, bilingual support, offline
capture + sync, branded proposal.

**Out of scope for v1:** scheduling, routing, dispatch, recurring service,
customer online approval/e-signature (v2), customer-selectable options (v2).

## 1. Architecture & stack

- Web app, responsive — phone/tablet field face + desktop office face from one
  codebase, one URL.
- Code in GitHub; hosted on Vercel (auto-deploys on push).
- Database: a Vercel-friendly managed Postgres, behind a clean, swappable data
  interface.
- Offline-first field capture from the start: local storage + a sync mechanism.

## 2. Core data model

User · Customer/Site · Inspection · System snapshot · Zone · Finding (issue) ·
Issue type · Part · Assembly · Labor rate · Quote/Work order. Names of
user-visible things are bilingual.

## 3. The money chain

`issue + attributes → exact part/assembly/labor → price`. Count multiplies
quantity; labor/assembly attach per the mapping; line price = catalog price;
margin = (price − cost) / price. Computed silently on every finding; the field
running total is hidden by default (per-user toggle).

## 4. Permissions

Individual keys grouped into roles: (1) see prices · (2) set/override a price +
add local-purchase lines · (3) edit catalog/assemblies/price book (Admin) ·
(4) approve inspection into a work order (Admin — the one deliberate gate).

## 5. Bilingual

Externalize every UI string (English + Spanish). Each data name stores an
English and a Spanish value. Assume Spanish runs longer; don't hard-size to
English. Set this up before building screens.

## 6. Security

Standard, well-tested auth. Never store plaintext passwords — hash only.
Standard sessions + reset. Don't hand-roll crypto.

## 7. Integration seams

- Customer/site in: support creating customers here, but keep the path open to
  receiving a customer from an external system.
- Work order out: the approved work order should be cleanly serializable/
  exportable for a scheduling/dispatch system.
- Catalog & users: structure so they could be shared/synced later.

## 8. Seed data

Import Parts Catalog, Labor Rates, and Issue → Fix Map from the starter
spreadsheet. Add the issue types from the real paper form. Seed a few
assemblies. Everything Admin-editable after seeding; prices are placeholders.

## 9. Suggested build order

Foundation (repo + Vercel + database + auth + bilingual scaffolding) → catalog
managers + seed → money-chain engine (tested in isolation) → field capture
(offline) → office queue + quote editor → proposal + signature → polish,
offline-sync hardening, integration-seam exports.

## 10. What comes from Design vs. built here

From Design: screen layouts, color/type system, component styles, both faces.
Built here: data model, price engine, auth, permissions, offline sync, seed
import, integration seams, bilingual data layer. The merge wires Design's
components to real data and behavior, keeping component names/structure.

---

## How this repo maps to the packet

| Packet | Where |
| --- | --- |
| §2 data model | `src/lib/data/types.ts` |
| §3 money chain | `src/lib/money/engine.ts` (+ `engine.test.ts`) |
| §4 permissions | `Permissions` in `types.ts`, enforced in screens + API |
| §5 bilingual | `src/lib/i18n/`, bilingual `LocalizedName` on every data name |
| §6 security | `src/lib/auth/` (bcrypt + jose sessions) |
| §7 seams | `src/lib/integration/`, `/api/work-orders/:id` |
| §8 seed | `src/lib/data/seed.ts` (from the starter xlsx) |
| offline-first | `src/lib/data/local-db.ts` + `store-context.tsx` + `public/sw.js` |
| server/multi-user | `src/lib/db/`, `src/app/api/` |
