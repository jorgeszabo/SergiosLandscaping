"use client";
import { useEffect, useState } from "react";
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
  const { user, removeInspection } = useStore();
  const { t, nm, lang } = useI18n();
  const toast = useToast();
  const { navigate, back } = useNav();
  const [sheet, setSheet] = useState<SheetState>(null);

  // When the office/admin opens a just-submitted inspection, move it to
  // "under review" so the status reflects that someone has picked it up.
  useEffect(() => {
    if (insp && (user?.role === "office" || user?.role === "admin") && insp.status === "submitted") {
      save({ ...insp, status: "under_review" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insp?.id]);

  if (!insp || !user) return null;
  const today = () => new Date().toISOString().slice(0, 10);

  const canSeePrice = user.permissions.seePrices;
  const canEdit = user.permissions.setPrice;
  const canApprove = user.permissions.approve;
  const isOffice = user.role === "office" || user.role === "admin";
  const isAdmin = !!user.permissions.editCatalog;
  const tot = inspectionTotals(insp, catalog);

  const deleteThis = async () => {
    if (!window.confirm(t("confirmDeleteInspection"))) return;
    await removeInspection(insp.id);
    toast(t("inspectionDeleted"));
    navigate({ name: isOffice ? "office" : "home" });
  };

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
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <h1 style={{ margin: 0 }}>{t("review")}</h1>
        <span
          className={`badge ${
            insp.status === "completed"
              ? "done"
              : insp.status === "approved" || insp.status === "in_progress"
                ? "navy"
                : insp.status === "returned"
                  ? "red"
                  : "new"
          }`}
          style={{ marginTop: 4 }}
        >
          {t("st_" + insp.status)}
        </span>
      </div>
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

      {(() => {
        const shots = insp.lines.flatMap((l) => {
          const ps = [...(l.photos || []), ...(l.photo ? [l.photo] : [])];
          return ps.map((src) => ({ src, name: lineName(l, catalog, lang) }));
        });
        if (!shots.length) return null;
        return (
          <>
            <h2>{t("photo")}</h2>
            <div className="card">
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {shots.map((s, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} className="thumb" src={s.src} alt={s.name} title={s.name} style={{ width: 74, height: 74 }} />
                ))}
              </div>
            </div>
          </>
        );
      })()}

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

      {/* ---- Lifecycle: signatures + status-driven actions ---- */}
      {(() => {
        const s = insp.status;
        const fieldEditable = !isOffice && (s === "draft" || s === "returned");
        const inReview = s === "submitted" || s === "under_review";
        const isWorkOrder = s === "approved" || s === "in_progress";
        return (
          <>
            {/* Field: customer signs to approve the estimate */}
            {fieldEditable && (
              <div className="card noprint">
                <label className="f" style={{ marginTop: 0 }}>{t("custSignEstimate")}</label>
                <p className="sub" style={{ marginTop: 0 }}>{t("signEstimateHint")}</p>
                <Signature value={insp.signature} onChange={(sig) => save({ ...insp, signature: sig })} />
              </div>
            )}

            {/* Read-only: show captured signatures + dates once signed. */}
            {((insp.signature && !fieldEditable) || (insp.completionSignature && !(isOffice && isWorkOrder))) && (
              <div className="card">
                {insp.signature && !fieldEditable && (
                  <div>
                    <div className="f" style={{ marginTop: 0 }}>{t("custSignEstimate")}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={insp.signature} alt="signature" style={{ height: 54, display: "block", marginTop: 4 }} />
                    <div className="sub" style={{ margin: "4px 0 0" }}>{t("signedOn")} · {insp.signedDate || insp.date}</div>
                  </div>
                )}
                {insp.completionSignature && !(isOffice && isWorkOrder) && (
                  <div style={{ marginTop: insp.signature && !fieldEditable ? 14 : 0 }}>
                    <div className="f" style={{ marginTop: 0 }}>{t("custSignComplete")}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={insp.completionSignature} alt="completion signature" style={{ height: 54, display: "block", marginTop: 4 }} />
                    <div className="sub" style={{ margin: "4px 0 0" }}>{t("completedOn")} · {insp.completedDate || insp.date}</div>
                  </div>
                )}
              </div>
            )}

            {/* Office/admin: customer signs to confirm completed work */}
            {isOffice && isWorkOrder && (
              <div className="card noprint">
                <label className="f" style={{ marginTop: 0 }}>{t("custSignComplete")}</label>
                <p className="sub" style={{ marginTop: 0 }}>{t("signCompleteHint")}</p>
                <Signature
                  value={insp.completionSignature}
                  onChange={(sig) => save({ ...insp, completionSignature: sig })}
                />
              </div>
            )}

            {/* Field submit for review */}
            {fieldEditable && (
              <button
                className="btn pri block noprint"
                onClick={() => {
                  save({ ...insp, status: "submitted", signedDate: insp.signedDate || today() });
                  toast(t("submitted"));
                  navigate({ name: "home" });
                }}
              >
                {t("submitForReview")}
              </button>
            )}

            {/* Office review → approve into a work order */}
            {isOffice && inReview && canApprove && (
              <>
                <button className="btn green block noprint" onClick={() => setStatus("approved")}>
                  {t("approveCreateWO")}
                </button>
                <button
                  className="btn block ghost noprint"
                  style={{ marginTop: 8, color: "var(--text-muted)" }}
                  onClick={() => setStatus("returned")}
                >
                  {t("sendBack")}
                </button>
              </>
            )}

            {/* Work order: start work / complete */}
            {isOffice && s === "approved" && (
              <button className="btn pri block noprint" onClick={() => setStatus("in_progress")}>
                {t("startWork")}
              </button>
            )}
            {isOffice && isWorkOrder && (
              <button
                className="btn green block noprint"
                style={{ marginTop: 8 }}
                onClick={() => {
                  save({ ...insp, status: "completed", completedDate: today() });
                  toast(t("jobCompleted"));
                }}
              >
                {t("completeJob")}
              </button>
            )}

            {isOffice && s === "completed" && (
              <div
                className="card noprint"
                style={{ textAlign: "center", background: "var(--success-soft)", borderColor: "#c7ddd2" }}
              >
                <b style={{ color: "var(--success)" }}>✓ {t("jobCompleted")}</b>
              </div>
            )}

            {/* Printable documents — contextual to the stage */}
            <div className="noprint" style={{ marginTop: 12 }}>
              <label className="f" style={{ marginTop: 0 }}>{t("proposal")}</label>
              <div className="pillbar">
                <button className="chip" onClick={() => navigate({ name: "print", inspId: insp.id, doc: "report" })}>{t("printReport")}</button>
                {canSeePrice && (
                  <button className="chip" onClick={() => navigate({ name: "print", inspId: insp.id, doc: "estimate" })}>{t("printEstimate")}</button>
                )}
                {(s === "approved" || s === "in_progress" || s === "completed") && (
                  <button className="chip" onClick={() => navigate({ name: "print", inspId: insp.id, doc: "workorder" })}>{t("printWorkOrder")}</button>
                )}
                {s === "completed" && (
                  <button className="chip" onClick={() => navigate({ name: "print", inspId: insp.id, doc: "completion" })}>{t("printCompletion")}</button>
                )}
              </div>
            </div>
            {canApprove && (s === "approved" || s === "in_progress" || s === "completed") && (
              <button className="btn block noprint" style={{ marginTop: 8 }} onClick={exportWO}>
                {t("export")}
              </button>
            )}
            {isAdmin && (
              <button className="btn danger block ghost noprint" style={{ marginTop: 8 }} onClick={deleteThis}>
                {t("deleteInspection")}
              </button>
            )}
          </>
        );
      })()}

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
      <button className="dz" onClick={() => { if (window.confirm(t("confirmRemoveLine"))) onRemove(); }}>
        {t("remove")}
      </button>
      <button style={{ color: "var(--text-muted)" }} onClick={onClose}>
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
      <button className="btn block ghost" style={{ marginTop: 8, color: "var(--text-muted)" }} onClick={onClose}>
        {t("cancel")}
      </button>
    </Sheet>
  );
}
