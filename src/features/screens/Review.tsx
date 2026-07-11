"use client";
import { useState } from "react";
import { useStore } from "@/lib/data/store-context";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useNav } from "../nav";
import { useInspection } from "../useInspection";
import { Sheet } from "@/components/Sheet";
import { Signature } from "@/components/Signature";
import { priceLine, lineName, inspectionTotals, money } from "@/lib/money/engine";
import { exportWorkOrder } from "@/lib/integration/work-order";
import { uid } from "@/lib/data/id";
import type { Line, LineState } from "@/lib/data/types";

type SheetState =
  | { type: "lineMenu"; lineId: string }
  | { type: "addLine"; kind: Line["kind"] }
  | null;

export function Review() {
  const { insp, save, catalog } = useInspection();
  const { user } = useStore();
  const { t, nm, lang } = useI18n();
  const toast = useToast();
  const { navigate, back } = useNav();
  const [sheet, setSheet] = useState<SheetState>(null);

  if (!insp || !user) return null;

  const canSeePrice = user.permissions.seePrices;
  const canEdit = user.permissions.setPrice;
  const canApprove = user.permissions.approve;
  const isOffice = user.role === "office" || user.role === "admin";
  const approved = insp.status === "approved";
  const tot = inspectionTotals(insp, catalog);

  const setLineState = (lineId: string, state: LineState) => {
    save({ ...insp, lines: insp.lines.map((l) => (l.id === lineId ? { ...l, state } : l)) });
    setSheet(null);
  };
  const removeLine = (lineId: string) => {
    save({ ...insp, lines: insp.lines.filter((l) => l.id !== lineId) });
    setSheet(null);
  };
  const addLine = (line: Line) => {
    save({ ...insp, lines: [...insp.lines, line] });
    setSheet(null);
  };
  const setStatus = (status: typeof insp.status) => save({ ...insp, status });

  const exportWO = async () => {
    const payload = JSON.stringify(exportWorkOrder(insp, catalog), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      toast(t("exported"));
    } catch {
      toast(payload.slice(0, 40) + "…");
    }
  };

  const group = (state: LineState, title: string) => {
    const lines = insp.lines.filter((l) => l.state === state);
    if (!lines.length && state !== "on") return null;
    return (
      <>
        <h2>{title}</h2>
        <div className="card">
          {lines.length === 0 && (
            <div className="empty" style={{ padding: 16 }}>
              {t("noIssues")}
            </div>
          )}
          {lines.map((line) => {
            const r = priceLine(line, catalog, lang);
            const zlabel =
              line.zone != null
                ? line.zone === "system"
                  ? t("systemWide")
                  : `${t("zone")} ${line.zone}`
                : "";
            return (
              <div key={line.id} className={`qline ${state !== "on" ? "off" : ""}`}>
                <div className="g">
                  <div className="n">
                    {lineName(line, catalog, lang)}
                    {line.count > 1 ? ` ×${line.count}` : ""}
                  </div>
                  <div className="m">{[zlabel, r.detail].filter(Boolean).join(" · ")}</div>
                </div>
                {canSeePrice && <div className="p">{money(r.price)}</div>}
                {canEdit && (
                  <button className="dots noprint" onClick={() => setSheet({ type: "lineMenu", lineId: line.id })}>
                    ⋯
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div>
      <button className="backlink noprint" onClick={back}>
        ‹ {t("zonesHub")}
      </button>
      <h1>{isOffice ? t("review") : t("review")}</h1>
      <p className="sub">{[insp.customer, insp.address].filter(Boolean).join(" · ") || "—"}</p>

      {group("on", t("onQuote"))}

      {canEdit && (
        <div className="pillbar noprint" style={{ marginTop: 6 }}>
          <button className="chip" onClick={() => setSheet({ type: "addLine", kind: "part" })}>
            ＋ {t("addPart")}
          </button>
          <button className="chip" onClick={() => setSheet({ type: "addLine", kind: "labor" })}>
            ＋ {t("addLabor")}
          </button>
          <button className="chip" onClick={() => setSheet({ type: "addLine", kind: "assembly" })}>
            ＋ {t("addAssembly")}
          </button>
          <button className="chip" onClick={() => setSheet({ type: "addLine", kind: "local" })}>
            ＋ {t("addLocal")}
          </button>
        </div>
      )}

      {group("deferred", t("deferredH"))}
      {group("declined", t("declinedH"))}

      {canSeePrice && (
        <div className="card" style={{ marginTop: 14 }}>
          {(isOffice || canApprove) && (
            <>
              <div className="tot">
                <span>{t("parts")}</span>
                <span className="money">{money(tot.parts)}</span>
              </div>
              <div className="tot">
                <span>{t("laborL")}</span>
                <span className="money">{money(tot.labor)}</span>
              </div>
              <div className="tot">
                <span>{t("cost")}</span>
                <span className="money">{money(tot.cost)}</span>
              </div>
              <div className="tot">
                <span>{t("margin")}</span>
                <span className="money">{Math.round(tot.margin * 100)}%</span>
              </div>
            </>
          )}
          <div className="tot big">
            <span>{t("total")}</span>
            <span className="money">{money(tot.price)}</span>
          </div>
        </div>
      )}

      {/* Field close-out: signature + submit (design screen 7) */}
      {!isOffice && !approved && (
        <div className="card noprint">
          <label className="f" style={{ marginTop: 0 }}>
            {t("sig")}
          </label>
          <Signature value={insp.signature} onChange={(sig) => save({ ...insp, signature: sig })} />
        </div>
      )}

      {/* Actions */}
      {approved ? (
        <>
          <div className="card noprint" style={{ textAlign: "center", background: "#e3ede8", borderColor: "#c7ddd2" }}>
            <b style={{ color: "var(--pine)" }}>✓ {t("approved")}</b>
          </div>
          <button className="btn pri block noprint" onClick={() => navigate({ name: "print", inspId: insp.id })}>
            {t("printQuote")}
          </button>
          {canApprove && (
            <button className="btn block noprint" style={{ marginTop: 8 }} onClick={exportWO}>
              {t("export")}
            </button>
          )}
          {canApprove && (
            <button
              className="btn block ghost noprint"
              style={{ marginTop: 8, color: "var(--muted)" }}
              onClick={() => setStatus("draft")}
            >
              {t("sendBack")}
            </button>
          )}
        </>
      ) : (
        <>
          {canApprove && (
            <button className="btn pri block noprint" onClick={() => setStatus("approved")}>
              {t("approve")}
            </button>
          )}
          {!isOffice && (
            <button
              className="btn pri block noprint"
              onClick={() => {
                setStatus("submitted");
                toast(t("submitted"));
                navigate({ name: "home" });
              }}
            >
              {t("submit")}
            </button>
          )}
          <button
            className="btn block ghost noprint"
            style={{ marginTop: 8 }}
            onClick={() => navigate({ name: "print", inspId: insp.id })}
          >
            {t("printQuote")}
          </button>
        </>
      )}

      {sheet?.type === "lineMenu" && (
        <LineMenu
          onClose={() => setSheet(null)}
          onMove={(s) => setLineState(sheet.lineId, s)}
          onRemove={() => removeLine(sheet.lineId)}
          current={insp.lines.find((l) => l.id === sheet.lineId)?.state || "on"}
        />
      )}
      {sheet?.type === "addLine" && (
        <AddLineSheet
          kind={sheet.kind}
          onClose={() => setSheet(null)}
          onAdd={addLine}
          catalog={catalog}
          nm={nm}
          t={t}
        />
      )}
    </div>
  );
}

function LineMenu({
  onClose,
  onMove,
  onRemove,
  current,
}: {
  onClose: () => void;
  onMove: (s: LineState) => void;
  onRemove: () => void;
  current: LineState;
}) {
  const { t } = useI18n();
  return (
    <Sheet onClose={onClose}>
      {current !== "on" && <button onClick={() => onMove("on")}>{t("moveOnQuote")}</button>}
      {current !== "deferred" && <button onClick={() => onMove("deferred")}>{t("moveDefer")}</button>}
      {current !== "declined" && <button onClick={() => onMove("declined")}>{t("moveDecline")}</button>}
      <button className="dz" onClick={onRemove}>
        {t("remove")}
      </button>
      <button style={{ color: "var(--muted)" }} onClick={onClose}>
        {t("cancel")}
      </button>
    </Sheet>
  );
}

function AddLineSheet({
  kind,
  onClose,
  onAdd,
  catalog,
  nm,
  t,
}: {
  kind: Line["kind"];
  onClose: () => void;
  onAdd: (l: Line) => void;
  catalog: ReturnType<typeof useInspection>["catalog"];
  nm: (o: { en: string; es: string } | undefined) => string;
  t: (k: string) => string;
}) {
  const [refId, setRefId] = useState(
    kind === "part"
      ? catalog.parts[0]?.id
      : kind === "labor"
        ? catalog.labor[0]?.id
        : kind === "assembly"
          ? catalog.assemblies[0]?.id
          : ""
  );
  const [qty, setQty] = useState(1);
  const [localName, setLocalName] = useState("");
  const [localPrice, setLocalPrice] = useState(0);

  const add = () => {
    if (kind === "local") {
      onAdd({ id: uid(), kind: "local", state: "on", count: 1, name: localName || t("local"), price: localPrice, cost: localPrice });
    } else {
      onAdd({ id: uid(), kind, state: "on", count: qty, refId });
    }
  };

  const title = t(
    kind === "part" ? "addPart" : kind === "labor" ? "addLabor" : kind === "assembly" ? "addAssembly" : "addLocal"
  );

  return (
    <Sheet onClose={onClose} pad>
      <h2 style={{ marginTop: 0 }}>＋ {title}</h2>
      {kind === "local" ? (
        <>
          <label className="f">{t("name")}</label>
          <input className="t" value={localName} placeholder={t("local")} onChange={(e) => setLocalName(e.target.value)} />
          <label className="f">{t("priceEach")}</label>
          <input
            className="t"
            type="number"
            min={0}
            value={localPrice}
            onChange={(e) => setLocalPrice(parseFloat(e.target.value || "0"))}
          />
        </>
      ) : (
        <>
          <select className="t" value={refId} onChange={(e) => setRefId(e.target.value)}>
            {kind === "part" &&
              catalog.parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {nm(p.name)} — {money(p.price)}
                </option>
              ))}
            {kind === "labor" &&
              catalog.labor.map((l) => (
                <option key={l.id} value={l.id}>
                  {nm(l.name)} — {money(l.rate)}
                  {l.unit === "hour" ? "/hr" : ""}
                </option>
              ))}
            {kind === "assembly" &&
              catalog.assemblies.map((a) => (
                <option key={a.id} value={a.id}>
                  {nm(a.name)} — {money(a.price)}
                </option>
              ))}
          </select>
          <label className="f">{t("qty")}</label>
          <input
            className="t"
            type="number"
            min={kind === "labor" ? 0.25 : 1}
            step={kind === "labor" ? 0.25 : 1}
            value={qty}
            onChange={(e) => setQty(parseFloat(e.target.value || "1"))}
          />
        </>
      )}
      <button className="btn pri block" style={{ marginTop: 14 }} onClick={add}>
        {t("addLine")}
      </button>
      <button className="btn block ghost" style={{ marginTop: 8, color: "var(--muted)" }} onClick={onClose}>
        {t("cancel")}
      </button>
    </Sheet>
  );
}
