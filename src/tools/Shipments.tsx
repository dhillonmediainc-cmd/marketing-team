import { useState } from "react";
import { PageHead, Card } from "../components/ui";
import { getQuotes, advanceLoad, revertLoad } from "../lib/storage";
import {
  loadStatus,
  LOAD_STAGES,
  STATUS_LABELS,
  nextStage,
  prevStage,
  type LoadStatus,
  type Quote,
} from "../lib/types";
import { EQUIPMENT_LABELS } from "../lib/types";
import { usd } from "../lib/format";

/** Stages that represent covered, in-flight freight (everything past "open"). */
const ACTIVE_STAGES = LOAD_STAGES.filter((s) => s !== "open");

export default function Shipments() {
  const [quotes, setQuotes] = useState<Quote[]>(() => getQuotes());

  const byStage = (stage: LoadStatus) => quotes.filter((q) => loadStatus(q) === stage);
  const advance = (id: string) => setQuotes(advanceLoad(id));
  const revert = (id: string) => setQuotes(revertLoad(id));

  const openLoads = byStage("open");

  return (
    <>
      <PageHead title="Shipments">
        Track every covered load from booking to delivery. This is the visibility
        layer — the thing shippers pay forwarders for, built in.
      </PageHead>

      {/* Pipeline summary */}
      <div className="pipeline">
        {LOAD_STAGES.map((stage) => {
          const count = byStage(stage).length;
          return (
            <div key={stage} className={`pipe-stage${count > 0 ? " active" : ""}`}>
              <div className="count">{count}</div>
              <div className="name">{STATUS_LABELS[stage]}</div>
            </div>
          );
        })}
      </div>

      {/* Active pipeline stages */}
      {ACTIVE_STAGES.map((stage) => {
        const loads = byStage(stage);
        if (loads.length === 0) return null;
        return (
          <Card key={stage} title={STATUS_LABELS[stage]} sub={`${loads.length}`}>
            {loads.map((q) => {
              const status = loadStatus(q);
              const prev = prevStage(status);
              const next = nextStage(status);
              return (
                <div className="ship-row" key={q.id}>
                  <div>
                    <div className="ship-lane">
                      {q.originCity}, {q.originState} → {q.destCity}, {q.destState}
                    </div>
                    <div className="ship-meta">
                      {EQUIPMENT_LABELS[q.equipment]} · {q.miles} mi ·{" "}
                      {q.assignedCarrierName ?? "unassigned"} · pays {usd(q.carrierPayout)}
                    </div>
                  </div>
                  <div className="ship-actions">
                    {prev && (
                      <button className="btn ghost" onClick={() => revert(q.id)}>
                        ← {STATUS_LABELS[prev]}
                      </button>
                    )}
                    {next && (
                      <button className="btn secondary" onClick={() => advance(q.id)}>
                        {STATUS_LABELS[next]} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        );
      })}

      {/* Awaiting coverage */}
      <Card title="Awaiting coverage" sub={`${openLoads.length}`}>
        {openLoads.length === 0 ? (
          <div className="empty">Every load is covered. 🎉</div>
        ) : (
          openLoads.map((q) => (
            <div className="ship-row" key={q.id}>
              <div>
                <div className="ship-lane">
                  {q.originCity}, {q.originState} → {q.destCity}, {q.destState}
                </div>
                <div className="ship-meta">
                  {EQUIPMENT_LABELS[q.equipment]} · {q.miles} mi · not yet booked
                </div>
              </div>
              <div className="ship-actions">
                <span className="muted" style={{ fontSize: 12 }}>Book in Load Matching or Carrier Board</span>
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
