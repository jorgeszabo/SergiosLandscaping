# Sergio's Landscaping — Irrigation App: User Guide

A plain-language guide for the office and the field crew. The same guide is
available inside the app (**More → User guide**, or the sidebar **User guide**).

---

## What the app does

It turns a field irrigation **inspection** into a priced **quote** and an
admin-approved **work order** — one app with two faces:

- **Field face** (phone/tablet): the tech captures the inspection.
- **Office face** (desktop): the office prices, approves, and tracks the job.

It works **offline** in the field and syncs when back online.

---

## Signing in

Open the app and pick your account from the dropdown, enter your password, and
tap **Sign in**. Your language (English/Español) can be switched any time from
the top bar. In demo mode (before a database is connected) any password works.

---

## Field tech — capturing an inspection

1. **New inspection** (the ＋ button). Choose an existing customer or type a new
   one, add the address.
2. **System overview** — controller brand/model, backflow, static pressure, rain
   sensor. The **number of stations creates that many zones** automatically.
3. **Zones** is home base. Open each zone and:
   - mark what it waters (turf/beds) and the head types,
   - tap **Add issue** → pick the problem → answer the follow-up (e.g. head type)
     → set the count and severity → add a **photo**. A **price appears
     automatically**.
4. Add **system-wide issues** (controller, backflow, pressure) from the hub.
5. Tap **Review & price**. Have the **customer sign** to approve the estimate,
   then **Submit for review**.

Prices can be hidden per person (a tech without the "see prices" permission
never sees dollar amounts).

---

## Office / admin — pricing and work orders

1. Submitted inspections appear in the **Queue** (with counts on the dashboard).
2. Open one to land in the **quote editor**:
   - adjust line items; add part / labor / assembly / local-purchase lines,
   - stage each line as **on quote / deferred / declined**,
   - the right side shows parts, labor, cost, **margin**, and total.
3. **Approve → creates a work order** (the one deliberate control point).
4. **Start work**, then **Mark complete** and capture the customer's
   **completion signature**.
5. **Print** the branded proposal at any stage.

Billing after a job is completed is handled by the office, outside the app.

**Lifecycle:** draft → (customer signs) submitted → under review → approved
(work order) → in progress → completed.

---

## Admin — catalog & team

- **Catalog**: parts, labor rates, assemblies, and issue types. Search, tap an
  item, edit its prices and bilingual names. Starter prices are placeholders —
  replace them with your real numbers.
- **Team**: add people; set role and the individual permission switches (see
  prices, set/override prices, manage catalog, approve work orders). Set or
  **generate a password** — you'll see the value when you set it so you can
  share it. Passwords are stored hashed and can't be shown later; reset one here
  any time.
- **Demo data** (Team screen): load or clear sample customers and inspections at
  every stage, to try things out. It's local to your device and safe to clear.

---

## Roles at a glance

| Role | Does |
| --- | --- |
| Field tech | Captures inspections; may hold pricing permission |
| Technical lead | Owns issue types / attributes / mappings |
| Office | Builds and prices quotes |
| Admin | Everything, including the approval gate and Team |

---

## Offline & sync

The field app works with no signal — everything is saved on the device and
syncs when you're back online. The pill on the dashboard shows the state
(**Synced**, **Waiting to sync**, or **Offline — saved on device**).
