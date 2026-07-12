import { useMemo, useState } from "react";
import { PageHead, Card } from "../components/ui";
import { getQuotes, getCarriers, deleteQuote } from "../lib/storage";
import { matchCarriers } from "../lib/matching";
import { EQUIPMENT_LABELS, type Quote } from "../lib/types";
import { usd, pct } from "../lib/format";

export default function LoadMatching() {
  const [quotes, setQuotes] = useState<Quote[]>(() => getQuotes());
  const carriers = useMemo(() => getCarriers(), []);
  const [selectedId, setSelectedId] = useState<string | null>(quotes[0]?.id ?? null);

  const selected = quotes.find((q) => q.id === selectedId) ?? null;
  const matches = useMemo(
    () => (selected ? matchCarriers(selected, carriers) : []),
    [selected, carriers],
  );

  const removeLoad = (id: string) => {
    const next = deleteQuote(id);
    setQuotes(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  return (
    <>
      <PageHead title="Load Matching">
        Open loads (saved from the quoting portal) matched to carriers in Astify's
        network by lane and equipment. Pick a load to see ranked carriers.
      </PageHead>

      {quotes.length === 0 ? (
        <Card>
          <div className="empty">
            No open loads yet. Create one in the <strong>Quoting Portal</strong> and
            save it as an open load.
          </div>
        </Card>
      ) : (
        <div className="grid grid-2">
          <Card title="Open loads" sub={`${quotes.length}`}>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Equip</th>
                    <th className="num">Shipper</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedId(q.id)}
                      style={{
                        cursor: "pointer",
                        background: q.id === selectedId ? "var(--surface-2)" : undefined,
                      }}
                    >
                      <td>
                        {q.originCity}, {q.originState} → {q.destCity}, {q.destState}
                        <div className="muted" style={{ fontSize: 12 }}>{q.miles} mi</div>
                      </td>
                      <td>{EQUIPMENT_LABELS[q.equipment]}</td>
                      <td className="num">{usd(q.shipperPrice)}</td>
                      <td>
                        <button
                          className="btn danger"
                          onClick={(e) => { e.stopPropagation(); removeLoad(q.id); }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            title="Matched carriers"
            sub={selected ? `${selected.originState} → ${selected.destState} · ${EQUIPMENT_LABELS[selected.equipment]}` : undefined}
          >
            {!selected ? (
              <div className="empty">Select a load to see matches.</div>
            ) : (
              <>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Projected margin on this load:{" "}
                  <strong style={{ color: "var(--good-text)" }}>
                    {usd(matches[0]?.projectedMargin ?? 0)} ({pct(matches[0]?.projectedMarginPct ?? 0)})
                  </strong>
                </div>
                {matches.map((m) => (
                  <div className="match" key={m.carrier.id}>
                    <div className={`score-ring${m.score >= 70 ? " high" : ""}`}>{m.score}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {m.carrier.name}{" "}
                        {m.equipmentMatch && m.laneMatch && (
                          <span className="badge good">Strong fit</span>
                        )}
                      </div>
                      <div className="reasons">
                        {m.carrier.mcNumber} · {m.reasons.join(" · ")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12 }} className="muted">
                      <div>Min ${m.carrier.minRatePerMile.toFixed(2)}/mi</div>
                      <div>Rel. {m.carrier.reliabilityScore}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
