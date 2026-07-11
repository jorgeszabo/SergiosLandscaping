# Self-Hosting & Migrating Off Vercel/Neon

This app is **hosting-agnostic**. It runs today on **Vercel + Neon**, but nothing
ties it there — it's a standard Next.js app talking to **any PostgreSQL database**
over a normal connection string. This guide explains how to move it to a personal
server (e.g. a machine your father-in-law runs) with no code changes.

> **No secrets in this repo.** Real values (database password, auth secret, API
> key) live only in a local `.env` file, which is git-ignored. This document only
> ever refers to variable *names* and shows how to generate values yourself.

---

## What makes it portable

| Concern | How it's handled |
| --- | --- |
| **Database** | `postgres.js` driver + a plain connection string. Works with Neon, a self-hosted Postgres, RDS, etc. The connection code auto-detects any `postgres://…` env var. |
| **Schema/seed** | The app **auto-creates its schema and seeds starter data on first request**. No migration tool required. (Optional manual run: `npm run db:seed`.) |
| **Config** | Everything is environment variables (below). No Vercel-only APIs are used. |
| **Server bundle** | `next.config.mjs` sets `output: "standalone"`, so `npm run build` emits a self-contained server you can run with `node server.js` anywhere. |
| **Offline-first** | With **no** database configured, the app still runs entirely in the browser — handy for a demo or a fallback. |

The only three settings that matter:

| Variable | Purpose | Secret? |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | **Yes** (contains the DB password) |
| `AUTH_SECRET` | Signs the session cookie | **Yes** |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps features (optional) | No — public browser key; lock it down by HTTP referrer in Google Cloud. Baked in at **build** time. |

---

## Option A — Docker Compose (recommended, turnkey)

Brings up **the app + its own PostgreSQL** with one command. Requirements on the
server: Docker + the Compose plugin.

1. **Get the code**
   ```bash
   git clone https://github.com/jorgeszabo/SergiosLandscaping.git
   cd SergiosLandscaping
   ```

2. **Create the env file** (never committed)
   ```bash
   cp .env.example .env
   ```
   Fill in `.env`:
   ```bash
   # a strong DB password (any long random string)
   POSTGRES_PASSWORD=...
   # session signing secret
   AUTH_SECRET=$(openssl rand -base64 32)
   # optional — Google Maps browser key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   # leave DATABASE_URL blank — compose builds it from POSTGRES_PASSWORD
   ```

3. **Start it**
   ```bash
   docker compose up -d --build
   ```
   The app is now on `http://SERVER_IP:3000`. On first load it creates the
   schema and seeds the catalog + starter users automatically.

4. **Log in and lock down.** Every seeded account starts with the same default
   password (printed by `npm run db:seed`, and defined in `src/lib/db/init.ts`).
   Sign in as the admin, then in **Team** change each password and remove any
   accounts you don't need.

Update later with:
```bash
git pull && docker compose up -d --build
```

> Changed the Maps key? Because it's inlined at build time, rebuild the image
> (`docker compose up -d --build`) after updating `.env`.

---

## Option B — Bare Node.js + an existing Postgres

For a server that already runs Node 20+ and Postgres (no Docker).

1. **Create a database**
   ```sql
   CREATE DATABASE sergios;
   CREATE USER sergios WITH PASSWORD '...';
   GRANT ALL PRIVILEGES ON DATABASE sergios TO sergios;
   ```

2. **Build**
   ```bash
   npm ci
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... npm run build
   ```

3. **Run** the standalone server (from `.next/standalone`):
   ```bash
   export DATABASE_URL="postgres://sergios:...@localhost:5432/sergios"
   export AUTH_SECRET="$(openssl rand -base64 32)"
   node .next/standalone/server.js      # serves on :3000
   ```
   Keep it alive with `systemd`, `pm2`, or similar. (Alternatively `npm run start`
   works too, but the standalone bundle is leaner.)

---

## Putting it behind a domain + HTTPS

Run a reverse proxy in front of port 3000. Example with **Caddy** (automatic
HTTPS):

```
irrigation.example.com {
    reverse_proxy localhost:3000
}
```

nginx works equally well — proxy `location / { proxy_pass http://localhost:3000; }`
and terminate TLS with certbot. After the domain is live, update the Google Maps
key's **HTTP referrer restriction** to include the new domain
(`https://irrigation.example.com/*`).

---

## Moving the DATA from Neon to the new database

The schema recreates itself, but to carry over existing customers, inspections,
and catalog edits, copy the data with standard Postgres tools:

```bash
# 1. Dump from Neon (get the connection string from the Neon dashboard)
pg_dump "postgres://…neon connection…" --no-owner --no-privileges -Fc -f sergios.dump

# 2. Restore into the new database
pg_restore --no-owner --no-privileges -d "postgres://sergios:…@NEWHOST:5432/sergios" sergios.dump
```

Do this while the app is idle so no writes are lost. Point `DATABASE_URL` at the
new server, restart, and verify at `/api/health` (should report
`{"configured":true}`).

---

## Backups (self-hosted)

Schedule a nightly dump — e.g. a cron job:

```bash
0 2 * * *  docker compose exec -T db pg_dump -U sergios sergios | gzip > /backups/sergios-$(date +\%F).sql.gz
```

Keep backups off the server too. Restoring is `gunzip -c … | psql "$DATABASE_URL"`.

---

## Rolling back to Vercel

Nothing is one-way. Because the app reads the same env vars everywhere, you can
point it back at Vercel + Neon at any time — set `DATABASE_URL`, `AUTH_SECRET`,
and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the Vercel project and redeploy.

---

## Security checklist for a personal server

- [ ] Strong, unique `AUTH_SECRET` and `POSTGRES_PASSWORD` (in `.env` only).
- [ ] `.env` is never committed (it's in `.gitignore`).
- [ ] Postgres is **not** exposed to the public internet (compose keeps it on the
      internal network; if bare-metal, bind to `localhost`).
- [ ] HTTPS via reverse proxy; the Maps key restricted to your domain.
- [ ] Change every seeded account password after first login.
- [ ] Automated, off-box database backups.
