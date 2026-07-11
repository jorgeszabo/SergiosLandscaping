# Claude Design — Prompt & Attachments

## Attach these four files
1. **irrigation-DESIGN-handoff.md** — the design brief (screens, states, bilingual requirement). Read closely.
2. **sergios-irrigation-app.html** — a WORKING version of the app. Open and click through it; it's the functional reference for the real flows, screens, and sample content.
3. **irrigation-app-requirements-v0.4.md** — full product spec for deeper context.
4. **irrigation-parts-catalog-STARTER.xlsx** — real sample data (parts, prices, the $600 "new zone" assembly) to populate screens truthfully.

## The prompt (paste this)

You're the design lead for a web app called **Sergio's Irrigation** — a tool an irrigation and landscaping company uses to run sprinkler-system inspections in the field and turn them into priced repair quotes in the office. I need a polished, distinctive visual design system plus the key screens. This will be built for real in Next.js, so keep components realistic and implementable — no effects that can't ship.

Read the attached files first. In particular, open **sergios-irrigation-app.html** and click through it — it's a working version of the app and your functional reference for the exact flows, screens, and real content. Your job is to make this beautiful and real, **not to reinvent the structure**.

Essentials:

- **Two faces, one visual system.** A FIELD face for phones/tablets (big taps, used outdoors in bright sun, often one thumb or gloves) and an OFFICE face for desktop (denser tables, side-by-side quote editing). Design both.
- **Spanish-first workforce.** Design bilingual from the start; Spanish text runs ~20–30% longer than English, so leave room and don't hard-size to English. Present at least the field face in Spanish in one version.
- **Two hero moments to make satisfying:** (1) on the field "add issue" screen, the live price estimate that appears once a problem and its details are entered — this is the emotional centerpiece; (2) the office "quote editor," where line items move between on-quote / deferred / declined and the total and margin update live.
- **Show the states, not just the happy path:** empty states (no jobs, a zone with no issues, an empty office queue), in-progress states (a partly-inspected job; the zones list with per-zone status), the attribute fields appearing after an issue is picked, and the deferred/declined lines visibly set aside but present.
- **Company & tone:** Sergio's Landscaping (Commercial & Residential, Conroe TX). Trustworthy, clean, modern trade software — the tool a sharp crew is proud to hand a customer. Not clip-art landscaping, not flashy.
- **Functional constraints that shape the look:** legibility in bright sunlight and generous tap targets on the field face are requirements, not just taste.

Deliver a cohesive design system (color, type, and components — buttons, inputs, chips, cards, line-item rows, status badges) and the key screens for both faces. Take one justified aesthetic risk that genuinely fits an irrigation field tool.

## Note for the merge back into code
The design system output will be implemented in the real Next.js app, so keep components consistent and clearly named — that's what makes wiring them to real data clean.
