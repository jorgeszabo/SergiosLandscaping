# Sergio's Landscaping — Irrigation App: User Guide

A plain-language guide for the office and the field crew. The same guide is
available inside the app (**More → User guide**, or the sidebar **User guide**).

> 🇲🇽 Versión en español: [`USER_GUIDE.es.md`](USER_GUIDE.es.md)

---

## What the app does

It turns a field irrigation **inspection** into a priced **quote** and an
admin-approved **work order** — one app with two faces:

- **Field face** (phone/tablet): the tech captures the inspection.
- **Office face** (desktop): the office prices, approves, and tracks the job.

It works **offline** in the field and syncs when back online.

---

## Signing in

Open the app, pick your account, and choose your language with the
**Español / English** buttons on the login card — **your choice carries into the
app**. Enter your password and tap **Sign in**. (Once inside, you can switch
language any time from the top bar.) In demo mode — before a database is
connected — any password works.

---

## Your dashboard

After signing in you land on your **dashboard**. The **Needs your attention**
list is personal to you:

- **Field techs / leads** see only *their own* jobs that need action —
  **returned** ones to rework, **drafts** to finish, and their **approved /
  in-progress** work orders to go do.
- **Office / admin** see what needs the office — **submitted / under review** to
  review, then **approved** to schedule.

A count **badge** on the **Dashboard** nav (sidebar on desktop, bottom tab on
mobile) shows how many items need you — including a job just **reassigned** to
you. When there's nothing pending it reads *You're all caught up.*

---

## Field tech — capturing an inspection

1. **New inspection** (the ＋ button). Type a name to **search existing
   customers**, or enter a new one. Start typing the address to **pick it from
   Google**, or tap **Use my location** to fill it from GPS.
2. **System overview** — controller brand/model, backflow, static pressure, rain
   sensor. The **number of stations creates that many zones** automatically.
3. **Zones** is home base. Open each zone and:
   - mark what it waters (turf/beds) and the head types,
   - tap **Add issue** → pick the problem → answer the follow-up (e.g. head type)
     → set the count and severity → add a **photo**. A **price appears
     automatically**.
4. Add **system-wide issues** (controller, backflow, pressure) from the hub.
5. Optional: open the **Site map** from the Zones hub to see the property from
   above — pick a zone, **draw its coverage**, and drop **sprinkler pins**. Tap a
   shape or pin to select it, then **Remove**. **Save map** when done.
6. Tap **Review & price**. Have the **customer sign** to approve the estimate,
   then **Submit for review**.

Prices can be hidden per person (a tech without the "see prices" permission
never sees dollar amounts).

---

## Office / admin — pricing and work orders

1. Submitted inspections appear under **Jobs** (with counts on the dashboard).
   Opening one marks it **under review**.
2. Open one to land in the **quote editor**:
   - adjust line items; add part / labor / assembly / local-purchase lines,
   - stage each line as **on quote / deferred / declined**,
   - the right side shows parts, labor, cost, **margin**, and total,
   - captured **customer signatures show read-only with their dates**.
3. **Reassign** the job to another tech any time with the **Assigned to**
   selector — it moves into that person's dashboard queue.
4. **Approve → creates a work order** (the one deliberate control point).
5. **Start work**, then **Mark complete** and capture the customer's
   **completion signature**.
6. **Print** any of the four documents (see *Printable documents* below).

Billing after a job is completed is handled by the office, outside the app.

**Lifecycle:** draft → (customer signs) submitted → under review → approved
(work order) → in progress → completed.

---

## Printable documents

From any job's **Review** screen, the buttons under the totals open branded
documents you can **print or save as PDF** — one per stage:

| Document | Shows | Available |
| --- | --- | --- |
| **Inspection report** | System overview, zones, findings (severity + notes), photos — no prices | Always |
| **Estimate** | Priced line items + future-visit items + the customer's **approval signature and date** | When you can see prices |
| **Work order** | The crew's task list (work · quantity · a **Done** checkbox to tick in the field), plus the approval note — no customer pricing | Once approved |
| **Completion certificate** | Work completed + the **completion signature and date** | Once completed |

Each opens to a clean page; tap **Print / save PDF** (choose "Save as PDF" in
the print dialog to email or file it).

---

## Customers & job history

Open **Customers** (sidebar on desktop, **More** menu on mobile) to browse
everyone in the database, searchable by name, address, or city. Tap a customer
to open their record:

- **Job history** — every past inspection and work order at that property, with
  the date, status, what was found, and the total. Tap any past job to see the
  full detail (parts and labor used) — useful for "what did we do here last
  time?"
- **New inspection here** — starts a job prefilled with that customer.
- Admins can **remove** a customer added by mistake (inspections keep their own
  copy of the name, so nothing is orphaned).

---

## Fixing mistakes & cleanup

- Backing out of a brand-new inspection **before entering anything** leaves no
  empty entry behind. Anything entered past the first screen is kept as a draft.
- **Admins can permanently delete** an inspection/quote — from the **Review**
  screen or the trash icon on a **Jobs** row — to clear tests and mistakes.
- Every **destructive action asks you to confirm** first.

---

## Admin — catalog & team

- **Catalog**: parts, labor rates, assemblies, and issue types. Parts are
  **grouped by component type** with a category filter. To **add a part**, pick
  its **component type** from the list — the name fills in **both languages
  automatically**, so you never translate by hand; then enter the brand, model,
  SKU, and price (those are the same in any language). "Other — type it in"
  covers a type that isn't in the list yet. **Load starter items** pulls in the
  full starter catalog without overwriting your edits. Starter prices are
  placeholders — replace them with your real numbers.
- **Team**: *only* people & access — add people; set role and the individual
  permission switches (see prices, set/override prices, manage catalog, approve
  work orders). Set or **generate a password** — you'll see the value when you
  set it so you can share it. Passwords are stored hashed and can't be shown
  later; reset one here any time.

## Training mode

Turn on **Training mode** (bottom of the sidebar on desktop, or the **More**
menu on mobile) to practice with sample data — sample customers and inspections
at every lifecycle stage. While it's on, a banner shows across the top and
**nothing you do touches the real records** (no saving to the server or device).
Turn it off to return to your real data, exactly as you left it. It's the safe
way to train a new hire or try a flow end-to-end — no loading or clearing, no
mixing with real customers.

---

## Roles & permissions

Access is built from **four individual permissions**. A **role** is just a
starting bundle of those permissions — you can tick any switch on or off per
person under **Team**.

### The four permissions

| Permission | What it unlocks |
| --- | --- |
| **See prices** | Sees dollar amounts everywhere (quote lines, totals, the proposal). Without it, the person captures and works jobs but never sees money. |
| **Set / override prices** | Can change a line's price and add local-purchase (buy-on-the-way) lines while building a quote. Implies working with prices, so it's paired with *See prices*. |
| **Approve work orders** | Can approve a priced inspection into a **work order** — the one deliberate gate between "quote" and "go do the work." |
| **Manage catalog & admin** | Admin power: edit the catalog (parts, labor, assemblies, issue types), manage **Team** (add/remove people, set passwords), and **delete** records (jobs, customers). This is what makes someone an admin. |

### The four starter roles

| Role | See prices | Set prices | Approve | Manage/admin | In practice |
| --- | :---: | :---: | :---: | :---: | --- |
| **Field tech** | — | — | — | — | Captures inspections and does the work; never sees money. |
| **Lead** | ✓ | — | — | — | Senior tech who can see prices/quotes but not change them. |
| **Office** | ✓ | ✓ | — | — | Builds and prices quotes. Can't self-approve or delete — that's the admin gate. |
| **Admin** | ✓ | ✓ | ✓ | ✓ | Everything: approves work orders, manages the catalog and team, cleans up records. |

**Why office can't approve its own quotes:** approval is the single control point
between pricing a job and committing to do it, so it's kept separate from
pricing — an admin approves. If you want a specific office person to also
approve, just turn on their **Approve work orders** switch under Team.

Enforcement is real on the server, not just hidden in the screen — e.g. deleting
a record or editing the catalog is rejected for anyone without the admin
permission, even via the API.

---

## Offline & sync

The field app works with no signal — everything is saved on the device and
syncs when you're back online. The pill on the dashboard shows the state
(**Synced**, **Waiting to sync**, or **Offline — saved on device**).
