"use client";
import { useI18n } from "@/lib/i18n";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { priceLine, lineName, inspectionTotals, money } from "@/lib/money/engine";

export function Print() {
  const { insp, catalog } = useInspection();
  const { t, lang } = useI18n();
  const { back } = useNav();
  if (!insp) return null;

  const tot = inspectionTotals(insp, catalog);
  const onLines = insp.lines.filter((l) => l.state === "on");
  const defLines = insp.lines.filter((l) => l.state === "deferred");

  return (
    <div>
      <div className="noprint" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="btn ghost" onClick={back}>
          ‹ {t("back")}
        </button>
        <button className="btn pri" style={{ flex: 1 }} onClick={() => window.print()}>
          {t("printQuote")}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--pine)" }}>💧 Sergio&apos;s Landscaping</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Commercial &amp; Residential · Conroe, TX · 936-788-1219
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          margin: "14px 0",
          borderTop: "2px solid var(--ink)",
          borderBottom: "1px solid var(--line)",
          padding: "10px 0",
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

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12 }}>
            <th style={{ padding: "6px 0" }}>{t("name")}</th>
            <th style={{ textAlign: "right" }}>{t("priceEach")}</th>
          </tr>
        </thead>
        <tbody>
          {onLines.map((line) => {
            const r = priceLine(line, catalog, lang);
            const z =
              line.zone != null
                ? line.zone === "system"
                  ? t("systemWide")
                  : `${t("zone")} ${line.zone}`
                : "";
            return (
              <tr key={line.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "9px 0" }}>
                  <b>{lineName(line, catalog, lang)}</b>
                  {line.count > 1 ? ` ×${line.count}` : ""}
                  <br />
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>
                    {[z, r.detail].filter(Boolean).join(" · ")}
                  </span>
                </td>
                <td style={{ textAlign: "right" }} className="money">
                  {money(r.price)}
                </td>
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
          <ul style={{ margin: "6px 0", paddingLeft: 18, color: "var(--muted)" }}>
            {defLines.map((l) => (
              <li key={l.id}>
                {lineName(l, catalog, lang)}
                {l.count > 1 ? ` ×${l.count}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 30, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
        {insp.signature ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={insp.signature} alt="signature" style={{ height: 60, marginBottom: 6 }} />
        ) : (
          <div style={{ height: 44, borderBottom: "1px solid var(--ink)", marginBottom: 6 }} />
        )}
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {t("sig")} — {t("signHint")}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--muted)" }}>{t("thankyou")}</div>
    </div>
  );
}
