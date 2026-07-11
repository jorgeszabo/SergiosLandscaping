# Sergio's Irrigation — Inspection-to-Quote App

A standalone, bilingual (English / Español) web app that turns a field
irrigation **inspection** into a priced **quote** and an admin-approved **work
order**. One responsive app, two faces:

- **Field face** (phone/tablet) — offline-capable capture: system snapshot →
  zones → issues, with a live "price appears" estimate.
- **Office face** (desktop) — a triage queue, a quote editor with
  on-quote / deferred / declined line states, margin, approval, and a branded
  printable proposal.

Built to be excellent on its own and to be absorbed into a larger
scheduling/dispatch platform later, via clean integration seams.

---

## Two ways it runs

The app is **local-first**. It always works, even with no backend:

| Mode | When | Data lives in | Auth |
| --- | --- | --- | --- |
| **Local (offline demo)** | No database configured | The browser (IndexedDB) | Pick a user — no password |
| **Server (multi-user)** | A Postgres database is connected | Postgres (shared) + browser cache | Real accounts, hashed passwords |

The **same URL** serves both. When you connect a database (below), the app
automatically switches to multi-user mode — real logins, shared inspections
across every phone and the office, one catalog everyone edits.

> Why local-first? The field face must work with no signal (Code handoff §1).
> Capture is written to the device immediately and synced to the server when
> back online — so the demo is also instantly shareable with zero setup.

---

## Make it live with a multi-user database

You said Vercel + Neon are connected. Here's the whole checklist — only two
steps are on your side (I can't set secrets in your Vercel account):

1. **Deploy the code to Vercel.** (Done for you if this session deployed it;
   otherwise import this GitHub repo as a new Vercel project — it auto-detects
   Next.js.)
2. **Connect the Neon database to the Vercel project.**
   Vercel dashboard → your project → **Storage** → connect your Neon Postgres.
   This automatically sets `DATABASE_URL` in the project. *(This is the one
   thing only you can do — it needs your account.)*
3. **Set `AUTH_SECRET`** (strongly recommended).
   Project → **Settings → Environment Variables** → add `AUTH_SECRET`.
   Generate a value with `openssl rand -base64 32`. If you skip it the app still
   runs — in production it derives a key from the database URL and logs a warning
   — but a dedicated secret is the right way to sign sessions, so set it.
4. **Redeploy** (Vercel does this automatically when you add env vars, or click
   **Redeploy**).

> **Not tied to Vercel/Neon.** The app is a standard Next.js app on plain
> PostgreSQL — it can move to a personal server (Docker or bare Node) with no
> code changes. See **[`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md)** for the
> full migration guide (Docker Compose, data transfer, HTTPS, backups).

That's it. On the first request after the database is connected, the app
**creates its own tables and loads the starter catalog automatically** — no
migration step to run. Then:

- Log in with a seeded account. **Every seeded account's password is
  `sergios2026`** — change it per user after go-live.
- Seeded users: `Admin` (full access), `María` (office), `Antonio` (field, can
  price), `Luis` (field, prices hidden).

To verify the database is on, open `/api/health` — it returns
`{"configured": true}` once `DATABASE_URL` is present.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000  (local-first, no database needed)
npm test             # price-engine unit tests
npm run build        # production build
```

To develop against a real database locally, put a connection string in
`.env.local` (see `.env.example`) and optionally run `npm run db:seed`.

---

## Architecture

```
src/
  app/                 Next.js App Router
    page.tsx           mounts the client SPA (offline-capable)
    api/               server endpoints (active only when a DB is connected)
  features/            screens + in-app router (field + office faces)
  components/          design-system pieces (Toast, Sheet, Signature, SyncStatus)
  lib/
    data/              domain types, seed, local (IndexedDB) store, sync store,
                       API client  — the swappable data layer
    money/engine.ts    the price engine (issue → part/labor/assembly → price)
    i18n/              English/Spanish string tables + React context
    db/                Postgres schema init + repository (server data layer)
    auth/              bcrypt password hashing + jose session cookies
    integration/       work-order export + customer-in adapter (the seams)
```

**Data layer is swappable.** The client reads from an in-memory database that is
loaded from IndexedDB (offline) and, when configured, hydrated from and synced
to Postgres. The server side is a thin repository over Postgres — the only place
that knows SQL.

**Bilingual from line one.** Every UI string lives in `lib/i18n/strings.ts`;
every data name (parts, issues, assemblies) carries an English *and* a Spanish
value, shown per the user's language.

**The money chain** (`lib/money/engine.ts`) is a pure, unit-tested module:
`issue + attributes → exact part/labor/assembly → price`, with margin =
`(price − cost) / price`. Tested in isolation (`npm test`).

**Permissions** are individual keys grouped into roles: see prices · set/override
price + local purchase · edit catalog (Admin) · approve into a work order
(Admin — the one deliberate gate).

## Integration seams (standalone now, absorbable later)

- **Work order out** — `GET /api/work-orders/:id` (and the "Export work order"
  button) emit a clean `sergios.workorder/v1` object a scheduling/dispatch
  system can consume. See `lib/integration/work-order.ts`.
- **Customer in** — `lib/integration/customer-in.ts` maps an external customer
  record into ours, so this app isn't assumed to be the sole owner of customer
  identity.
- **Catalog & users** are structured to be shared/synced later.

The exact contract shapes firm up with the partner (requirements §15.11); the
seams are built and stable to develop against.

## Seed data

The starter catalog (31 parts, 4 labor rates, 17 issue types, 3 assemblies) is
imported from `docs/irrigation-parts-catalog-STARTER.xlsx` into
`src/lib/data/seed.ts`. **Prices are placeholders** — replace with the company's
real numbers in the Catalog manager (Admin). Everything is Admin-editable after
seeding.

## Roadmap (from the requirements)

- **v1 (this build):** inspection capture, price engine, quote editor with
  finding-states, admin approval → work order, catalog managers, bilingual,
  offline capture + sync, branded proposal, integration seams.
- **v2 (ours):** customer online approval + e-signature; customer-selectable
  optional/tiered line items.
- **Partner's platform (fenced off):** scheduling, routing, dispatch, recurring
  service.

## Reference docs

- `docs/requirements-v0.4.md` — the north-star spec (source of truth)
- `docs/code-handoff.md` — the build packet this implements
- `docs/design-handoff.md` — the design packet
- `docs/prototype.html` — the approved click-through prototype the UI is ported from
- `docs/irrigation-parts-catalog-STARTER.xlsx` — the starter catalog
- `docs/SELF_HOSTING.md` — moving off Vercel/Neon to a personal server
- `docs/USER_GUIDE.md` — plain-language guide for the office and field crew
  (Spanish: `docs/USER_GUIDE.es.md`)
