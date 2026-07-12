import { useMemo, useState } from "react";
import { PageHead, Card } from "../components/ui";
import { getQuotes, getCarriers, assignLoad } from "../lib/storage";
import { loadStatus, isCovered, STATUS_LABELS, EQUIPMENT_LABELS, type Quote, type Carrier } from "../lib/types";
import { ratePerMile } from "../lib/pricingEngine";
import { usd, usd2 } from "../lib/format";

/**
 * Carrier-facing view. A carrier picks who they are, sees the open loads that
 * fit their equipment and lanes, and accepts one directly — the supply-side
 * counterpart to the broker's Load Matching screen.
 */
export default function CarrierBoard() {
  const carriers = useMemo(() => getCarriers(), []);
  const [carrierId, setCarrierId] = useState(carriers[0]?.id ?? "");
  const [quotes, setQuotes] = useState<Quote[]>(() => getQuotes());

  const carrier: Carrier | undefined = carriers.find((c) => c.id === carrierId);

  const openLoads = quotes.filter((q) => loadStatus(q) === "open");
  const myLoads = quotes.filter(
    (q) => isCovered(q) && q.assignedCarrierId === carrierId,
  );

  // Loads that fit this carrier's equipment, best lane-fit first.
  const fitting = useMemo(() => {
    if (!carrier) return [];
    return openLoads
      .map((q) => {
        const equipmentMatch = carrier.equipment.includes(q.equipment);
        const runsOrigin = carrier.homeStates.includes(q.originState);
        const runsDest = carrier.homeStates.includes(q.destState);
        const laneScore = (runsOrigin ? 2 : 0) + (runsDest ? 1 : 0);
        const rpm = ratePerMile(q.carrierPayout, q.miles);
        const paysWell = rpm >= carrier.minRatePerMile;
        return { q, equipmentMatch, laneScore, rpm, paysWell };
      })
      .filter((r) => r.equipmentMatch)
      .sort((a, b) => b.laneScore - a.laneScore || b.rpm - a.rpm);
  }, [openLoads, carrier]);

  const accept = (id: string) => {
    if (!carrier) return;
    setQuotes(assignLoad(id, carrier));
  };

  return (
    <>
      <PageHead title="Carrier Board">
        Carriers see open loads that fit them and book directly — no broker call, no
        dispatcher fee. This is the supply side of going direct.
      </PageHead>

      <Card title="Viewing as carrier">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select value={carrierId} onChange={(e) => setCarrierId(e.target.value)} style={{ maxWidth: 320 }}>
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.mcNumber}
              </option>
            ))}
          </select>
          {carrier && (
            <span className="muted" style={{ fontSize: 13 }}>
              Runs {carrier.homeStates.join(", ")} · {carrier.equipment.map((e) => EQUIPMENT_LABELS[e]).join(", ")} · min {usd2(carrier.minRatePerMile)}/mi
            </span>
          )}
        </div>
      </Card>

      <div className="grid grid-2">
        <Card title="Open loads that fit you" sub={`${fitting.length}`}>
          {fitting.length === 0 ? (
            <div className="empty">
              No open loads match your equipment right now. Loads appear here when the
              broker saves a quote in the Quoting Portal.
            </div>
          ) : (
            fitting.map(({ q, laneScore, rpm, paysWell }) => (
              <div className="match" key={q.id}>
                <div className={`score-ring${laneScore >= 2 ? " high" : ""}`}>
                  {usd2(rpm)}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {q.originCity}, {q.originState} → {q.destCity}, {q.destState}{" "}
                    {laneScore >= 2 && <span className="badge good">In your lane</span>}
                  </div>
                  <div className="reasons">
                    {EQUIPMENT_LABELS[q.equipment]} · {q.miles} mi · pays {usd(q.carrierPayout)}{" "}
                    {paysWell ? "· at/above your min rate" : "· below your min rate"}
                  </div>
                </div>
                <button className="btn" onClick={() => accept(q.id)}>Accept</button>
              </div>
            ))
          )}
        </Card>

        <Card title="Loads you've accepted" sub={`${myLoads.length}`}>
          {myLoads.length === 0 ? (
            <div className="empty">Accept a load and it shows up here.</div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Status</th>
                    <th className="num">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoads.map((q) => {
                    const s = loadStatus(q);
                    return (
                      <tr key={q.id}>
                        <td>
                          {q.originCity}, {q.originState} → {q.destCity}, {q.destState}
                          <div className="muted" style={{ fontSize: 12 }}>
                            {EQUIPMENT_LABELS[q.equipment]} · {q.miles} mi
                          </div>
                        </td>
                        <td><span className={`badge stage-${s}`}>{STATUS_LABELS[s]}</span></td>
                        <td className="num">{usd(q.carrierPayout)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
