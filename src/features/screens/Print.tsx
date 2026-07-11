"use client";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { priceLine, lineName, inspectionTotals, money } from "@/lib/money/engine";
import type { Line } from "@/lib/data/types";

type DocType = "report" | "estimate" | "workorder" | "completion";

const DOC_TITLE: Record<DocType, string> = {
  report: "docReportTitle",
  estimate: "docEstimateTitle",
  workorder: "docWorkOrderTitle",
  completion: "docCompletionTitle",
};

export function Print() {
  const { insp, catalog } = useInspection();
  const { t, lang } = useI18n();
  const { view, back } = useNav();
  if (!insp) return null;

  const doc: DocType = view.doc || "estimate";
  const tot = inspectionTotals(insp, catalog);
  const onLines = insp.lines.filter((l) => l.state === "on");
  const defLines = insp.lines.filter((l) => l.state === "deferred");
  const issues = insp.lines.filter((l) => l.kind === "issue");

  const zoneLabel = (z: Line["zone"]) =>
    z == null ? "" : z === "system" ? t("systemWide") : `${t("zone")} ${z}`;

  return (
    <div>
      <div className="noprint" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="btn ghost" onClick={back}>‹ {t("back")}</button>
        <button className="btn pri" style={{ flex: 1 }} onClick={() => window.print()}>{t("printThis")}</button>
      </div>

      {/* ---- Shared branded header ---- */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sergio's Landscaping" style={{ width: 170, height: "auto", margin: "0 auto 4px" }} />
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Commercial &amp; Residential · Conroe, TX · 936-788-1219
        </div>
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 4 }}>
        {t(DOC_TITLE[doc])}
      </div>

      <div
        style={{
          display: "flex", justifyContent: "space-between", fontSize: 13, margin: "10px 0",
          borderTop: "2px solid var(--brand-primary)", borderBottom: "1px solid var(--border-subtle)", padding: "10px 0",
        }}
      >
        <div>
          <b>{t("quoteFor")}:</b> {insp.customer}
          <br />
          {insp.address} {insp.city}
        </div>
        <div style={{ textAlign: "right" }}>
          <b>{t("dateL")}:</b> {insp.date}
          <br />
          <b>{t("techL")}:</b> {insp.tech}
        </div>
      </div>

      {/* ---- Inspection report: system + findings, no prices ---- */}
      {doc === "report" && (
        <>
          <SectionTitle>{t("sysOverview")}</SectionTitle>
          <div className="grid2" style={{ fontSize: 13, gap: 6 }}>
            <Field label={t("brand")}>{insp.snapshot.brand || "—"} {insp.snapshot.model}</Field>
            <Field label={t("stations")}>{insp.snapshot.stations || "—"}</Field>
            <Field label={t("backflow")}>{insp.snapshot.backflow || "—"}</Field>
            <Field label={t("pressure")}>{insp.snapshot.pressure || "—"}</Field>
            <Field label={t("rainSensor")}>{insp.snapshot.rainSensor || "—"}</Field>
          </div>

          <SectionTitle>{t("zonesHub")} ({insp.zones.length})</SectionTitle>
          <div style={{ fontSize: 13 }}>
            {insp.zones.map((z) => (
              <div key={z.n} style={{ padding: "4px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <b>{t("zone")} {z.n}</b>
                <span style={{ color: "var(--text-muted)" }}>
                  {" · "}{[...z.waters, ...z.heads].join(", ") || "—"}{z.schedule ? ` · ${z.schedule}` : ""}
                </span>
              </div>
            ))}
          </div>

          <SectionTitle>{t("findingsH")}</SectionTitle>
          {issues.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("noFindings")}</p>
          ) : (
            <div style={{ fontSize: 13 }}>
              {issues.map((l) => (
                <div key={l.id} style={{ padding: "5px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  {l.severity && <span className={`sev ${l.severity}`} />}
                  <b>{lineName(l, catalog, lang)}</b>{l.count > 1 ? ` ×${l.count}` : ""}
                  <span style={{ color: "var(--text-muted)" }}>
                    {" · "}{zoneLabel(l.zone)}{l.severity ? ` · ${t(l.severity)}` : ""}
                  </span>
                  {l.note && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{l.note}</div>}
                </div>
              ))}
            </div>
          )}

          <Photos lines={insp.lines} lineName={(l) => lineName(l, catalog, lang)} />
        </>
      )}

      {/* ---- Estimate: priced proposal + approval signature ---- */}
      {doc === "estimate" && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 12 }}>
                <th style={{ padding: "6px 0" }}>{t("name")}</th>
                <th style={{ textAlign: "right" }}>{t("priceEach")}</th>
              </tr>
            </thead>
            <tbody>
              {onLines.map((line) => {
                const r = priceLine(line, catalog, lang);
                return (
                  <tr key={line.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "9px 0" }}>
                      <b>{lineName(line, catalog, lang)}</b>{line.count > 1 ? ` ×${line.count}` : ""}
                      <br />
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {[zoneLabel(line.zone), r.detail].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }} className="money">{money(r.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="tot big" style={{ marginTop: 12 }}>
            <span>{t("total")}</span>
            <span className="money">{money(tot.price)}</span>
          </div>

          {defLines.length > 0 && (
            <div style={{ marginTop: 20, fontSize: 13 }}>
              <b>{t("futureNote")}</b>
              <ul style={{ margin: "6px 0", paddingLeft: 18, color: "var(--text-muted)" }}>
                {defLines.map((l) => (
                  <li key={l.id}>{lineName(l, catalog, lang)}{l.count > 1 ? ` ×${l.count}` : ""}</li>
                ))}
              </ul>
            </div>
          )}

          <SignatureBlock
            img={insp.signature}
            date={insp.signedDate || insp.date}
            caption={`${t("sig")} — ${t("signHint")}`}
            dateLabel={t("signedOn")}
          />
          <ThankYou>{t("thankyou")}</ThankYou>
        </>
      )}

      {/* ---- Work order: crew task list, no customer pricing ---- */}
      {doc === "workorder" && (
        <>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>
            {t("brand")}: {insp.snapshot.brand} {insp.snapshot.model} · {t("stations")}: {insp.snapshot.stations}
          </div>
          <SectionTitle>{t("workToPerform")}</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 12 }}>
                <th style={{ padding: "5px 0" }}>{t("name")}</th>
                <th style={{ width: 60, textAlign: "right" }}>{t("qty")}</th>
                <th style={{ width: 44, textAlign: "center" }}>{t("doneCol")}</th>
              </tr>
            </thead>
            <tbody>
              {onLines.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "8px 0" }}>
                    <b>{lineName(l, catalog, lang)}</b>
                    <span style={{ color: "var(--text-muted)" }}>{l.zone != null ? ` · ${zoneLabel(l.zone)}` : ""}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>{l.count}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ display: "inline-block", width: 15, height: 15, border: "1.5px solid var(--text-strong)", borderRadius: 3 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <SectionTitle>{t("crewNotes")}</SectionTitle>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", height: 26 }} />
          <div style={{ borderBottom: "1px solid var(--border-subtle)", height: 26 }} />

          {insp.signature && (
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
              ✓ {t("approvedRef")}{insp.signedDate ? ` · ${insp.signedDate}` : ""}
            </div>
          )}
        </>
      )}

      {/* ---- Completion certificate ---- */}
      {doc === "completion" && (
        <>
          <SectionTitle>{t("completedWorkH")}</SectionTitle>
          <ul style={{ margin: "4px 0 14px", paddingLeft: 18, fontSize: 13.5 }}>
            {onLines.map((l) => (
              <li key={l.id} style={{ padding: "2px 0" }}>
                {lineName(l, catalog, lang)}{l.count > 1 ? ` ×${l.count}` : ""}
                <span style={{ color: "var(--text-muted)" }}>{l.zone != null ? ` · ${zoneLabel(l.zone)}` : ""}</span>
              </li>
            ))}
          </ul>

          <SignatureBlock
            img={insp.completionSignature}
            date={insp.completedDate || insp.date}
            caption={t("custSignComplete")}
            dateLabel={t("completedOn")}
          />
          <ThankYou>{t("thankyou")}</ThankYou>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14.5, margin: "18px 0 6px", color: "var(--text-strong)" }}>{children}</h3>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "3px 0" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}: </span>
      <b>{children}</b>
    </div>
  );
}

function SignatureBlock({ img, date, caption, dateLabel }: { img?: string | null; date?: string; caption: string; dateLabel: string }) {
  return (
    <div style={{ marginTop: 28, borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="signature" style={{ height: 56, marginBottom: 4 }} />
      ) : (
        <div style={{ height: 42, borderBottom: "1px solid var(--text-strong)", marginBottom: 4 }} />
      )}
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {caption}{img && date ? ` · ${dateLabel} ${date}` : ""}
      </div>
    </div>
  );
}

function ThankYou({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}>{children}</div>;
}

function Photos({ lines, lineName }: { lines: Line[]; lineName: (l: Line) => string }) {
  const shots = lines.flatMap((l) => {
    const ps = [...(l.photos || []), ...(l.photo ? [l.photo] : [])];
    return ps.map((src) => ({ src, name: lineName(l) }));
  });
  if (!shots.length) return null;
  return (
    <>
      <SectionTitle>{shots.length} 📷</SectionTitle>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {shots.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={s.src} alt={s.name} title={s.name} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-subtle)" }} />
        ))}
      </div>
    </>
  );
}
