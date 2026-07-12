import { useEffect, useState } from "react";
import { PageHead, Card, Tile, Field } from "../components/ui";
import {
  quoteShipperPrice,
  DEFAULT_TARGET_MARGIN_PCT,
  type QuoteResult,
} from "../lib/pricingEngine";
import { EQUIPMENT_LABELS, EQUIPMENT_TYPES, type EquipmentType, type Quote } from "../lib/types";
import { US_STATES } from "../lib/usStates";
import { distanceMiles } from "../lib/geo";
import { laneBenchmark, compareToBenchmark } from "../lib/laneRates";
import { saveQuote, newId, getQuotes } from "../lib/storage";
import { usd, usd2 } from "../lib/format";

const verdictLabel: Record<string, string> = {
  below: "Below market",
  at: "At market",
  above: "Above market",
};

export default function QuotingPortal() {
  const [originCity, setOriginCity] = useState("Los Angeles");
  const [originState, setOriginState] = useState("CA");
  const [destCity, setDestCity] = useState("Phoenix");
  const [destState, setDestState] = useState("AZ");
  const [equipment, setEquipment] = useState<EquipmentType>("dry_van");
  const [weightLbs, setWeightLbs] = useState(28000);
  const [miles, setMiles] = useState(430);
  const [milesAuto, setMilesAuto] = useState(true);
  const [targetMarginPct, setTargetMarginPct] = useState(DEFAULT_TARGET_MARGIN_PCT);

  const [result, setResult] = useState<QuoteResult | null>(null);
  const [savedCount, setSavedCount] = useState(getQuotes().length);
  const [justSaved, setJustSaved] = useState(false);

  // Auto-fill miles from city coordinates whenever the lane changes (unless the
  // user has taken manual control of the miles field).
  useEffect(() => {
    if (!milesAuto) return;
    const d = distanceMiles(originCity, originState, destCity, destState);
    if (d !== null) setMiles(d);
  }, [originCity, originState, destCity, destState, milesAuto]);

  const recalcFromCities = () => {
    const d = distanceMiles(originCity, originState, destCity, destState);
    if (d !== null) {
      setMiles(d);
      setMilesAuto(true);
    }
  };

  const runQuote = () => {
    setResult(quoteShipperPrice({ miles, equipment, weightLbs, targetMarginPct }));
    setJustSaved(false);
  };

  const save = () => {
    if (!result) return;
    const quote: Quote = {
      id: newId("q"),
      createdAt: new Date().toISOString(),
      originCity,
      originState,
      destCity,
      destState,
      equipment,
      weightLbs,
      miles,
      shipperPrice: result.shipperPrice,
      carrierPayout: result.carrierPayout,
      targetMarginPct,
    };
    const all = saveQuote(quote);
    setSavedCount(all.length);
    setJustSaved(true);
  };

  const bench = laneBenchmark({ originState, destState, equipment, miles });
  const comparison = result
    ? compareToBenchmark(result.ratePerMileShipper, bench.ratePerMile)
    : null;

  return (
    <>
      <PageHead title="Shipper Quoting Portal">
        Give a shipper an instant, direct rate — no broker call. Miles auto-calculate
        from the lane, and every quote is checked against a market benchmark. Saved
        quotes become open loads in the matching tool.
      </PageHead>

      <div className="grid grid-2">
        <Card title="Shipment">
          <div className="row-2">
            <Field label="Origin city">
              <input value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
            </Field>
            <Field label="Origin state">
              <select value={originState} onChange={(e) => setOriginState(e.target.value)}>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="row-2">
            <Field label="Destination city">
              <input value={destCity} onChange={(e) => setDestCity(e.target.value)} />
            </Field>
            <Field label="Destination state">
              <select value={destState} onChange={(e) => setDestState(e.target.value)}>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Equipment">
            <select value={equipment} onChange={(e) => setEquipment(e.target.value as EquipmentType)}>
              {EQUIPMENT_TYPES.map((t) => <option key={t} value={t}>{EQUIPMENT_LABELS[t]}</option>)}
            </select>
          </Field>
          <div className="row-2">
            <Field label="Weight (lbs)">
              <input type="number" min={0} value={weightLbs} onChange={(e) => setWeightLbs(Number(e.target.value) || 0)} />
            </Field>
            <div className="field">
              <label>
                Miles{" "}
                <span className={`badge${milesAuto ? " good" : ""}`} style={{ marginLeft: 4 }}>
                  {milesAuto ? "Auto" : "Manual"}
                </span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min={0}
                  value={miles}
                  onChange={(e) => { setMiles(Number(e.target.value) || 0); setMilesAuto(false); }}
                />
                {!milesAuto && (
                  <button className="btn ghost" title="Recalculate from cities" onClick={recalcFromCities}>
                    Auto
                  </button>
                )}
              </div>
            </div>
          </div>
          <Field label="Target margin (%)">
            <input type="number" min={0} value={targetMarginPct} onChange={(e) => setTargetMarginPct(Number(e.target.value) || 0)} />
          </Field>
          <button className="btn" onClick={runQuote}>Get quote</button>
        </Card>

        <Card title="Quote">
          {!result ? (
            <div className="empty">Fill in the shipment and hit "Get quote".</div>
          ) : (
            <>
              <div className="tiles">
                <Tile label="Shipper price" value={usd(result.shipperPrice)} good hint={`${usd2(result.ratePerMileShipper)}/mi`} />
                <Tile label="Carrier payout" value={usd(result.carrierPayout)} />
                <Tile label="Your margin" value={usd(result.margin)} hint={`${targetMarginPct}%`} />
              </div>

              {comparison && (
                <div className={`callout${comparison.verdict === "above" ? " neutral" : ""} mt-16`}>
                  <strong>{verdictLabel[comparison.verdict]}</strong>{" "}
                  {comparison.verdict === "at"
                    ? `— your ${usd2(result.ratePerMileShipper)}/mi is in line with the ~${usd2(bench.ratePerMile)}/mi market rate for this lane.`
                    : `— your ${usd2(result.ratePerMileShipper)}/mi is ${Math.abs(comparison.deltaPct).toFixed(0)}% ${comparison.verdict} the ~${usd2(bench.ratePerMile)}/mi market rate for this lane (${usd(bench.total)} typical all-in).`}
                </div>
              )}

              <div className="table-scroll mt-16">
                <table>
                  <tbody>
                    <tr><td>Line haul ({EQUIPMENT_LABELS[equipment]})</td><td className="num">{usd(result.lineHaul)}</td></tr>
                    <tr><td>Fuel surcharge</td><td className="num">{usd(result.fuel)}</td></tr>
                    {result.weightSurcharge > 0 && (
                      <tr><td>Heavy-weight surcharge</td><td className="num">{usd(result.weightSurcharge)}</td></tr>
                    )}
                    <tr><td><strong>Carrier payout</strong></td><td className="num"><strong>{usd(result.carrierPayout)}</strong></td></tr>
                    <tr><td>Your margin ({targetMarginPct}%)</td><td className="num">{usd(result.margin)}</td></tr>
                    <tr><td><strong>Shipper price</strong></td><td className="num"><strong>{usd(result.shipperPrice)}</strong></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-16" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn secondary" onClick={save}>Save as open load</button>
                {justSaved && <span className="badge good">Saved ✓</span>}
                <span className="muted" style={{ fontSize: 13, marginLeft: "auto" }}>{savedCount} saved</span>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
