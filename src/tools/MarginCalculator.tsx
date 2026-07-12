import { useState } from "react";
import { PageHead, Card, Tile, Field } from "../components/ui";
import {
  marginBreakdown,
  compareChains,
  ratePerMile,
  TRADITIONAL_BROKER_PCT,
  TRADITIONAL_DISPATCHER_PCT,
} from "../lib/pricingEngine";
import { usd, pct, usd2 } from "../lib/format";

/** Width % of a value within a stacked bar (guards zero total). */
const widthPct = (part: number, total: number) =>
  total > 0 ? `${(part / total) * 100}%` : "0%";

export default function MarginCalculator() {
  const [shipperRate, setShipperRate] = useState(2000);
  const [carrierPayout, setCarrierPayout] = useState(1700);
  const [miles, setMiles] = useState(500);

  const margin = marginBreakdown({ shipperRate, carrierPayout });
  const comparison = compareChains({ shipperRate, carrierPayout });
  const t = comparison.traditional;
  const carrierWins = comparison.carrierGain >= 0;

  return (
    <>
      <PageHead title="Rate & Margin Calculator">
        Enter a shipper rate and what you'd pay the carrier. See your margin, and
        how much more reaches the truck when you replace the broker + dispatcher
        chain with a single direct markup.
      </PageHead>

      <div className="grid grid-2">
        <Card title="Inputs">
          <Field label="Shipper rate ($)">
            <input
              type="number"
              min={0}
              value={shipperRate}
              onChange={(e) => setShipperRate(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Carrier payout — your direct model ($)">
            <input
              type="number"
              min={0}
              value={carrierPayout}
              onChange={(e) => setCarrierPayout(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Miles">
            <input
              type="number"
              min={0}
              value={miles}
              onChange={(e) => setMiles(Number(e.target.value) || 0)}
            />
          </Field>
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>
            Comparison assumes a traditional broker spread of {TRADITIONAL_BROKER_PCT}%
            and a dispatcher fee of {TRADITIONAL_DISPATCHER_PCT}% on the remainder.
          </p>
        </Card>

        <Card title="Your numbers">
          <div className="tiles">
            <Tile label="Your margin" value={usd(margin.grossMargin)} hint={pct(margin.grossMarginPct)} />
            <Tile label="Carrier take-home" value={usd(carrierPayout)} good />
            <Tile label="Shipper rate / mile" value={usd2(ratePerMile(shipperRate, miles))} />
            <Tile label="Carrier rate / mile" value={usd2(ratePerMile(carrierPayout, miles))} />
          </div>
        </Card>
      </div>

      <Card title="Traditional chain vs. your direct model" sub="same shipper rate">
        <div className="compare">
          {/* Traditional chain */}
          <div className="chain">
            <div className="chain-head">
              <span>Traditional: shipper → broker → dispatcher → carrier</span>
              <span className="net">Carrier nets {usd(t.carrierNet)}</span>
            </div>
            <div className="stack" role="img" aria-label={`Traditional chain: broker cut ${usd(t.brokerCut)}, dispatcher cut ${usd(t.dispatcherCut)}, carrier nets ${usd(t.carrierNet)}`}>
              <div className="seg broker" style={{ width: widthPct(t.brokerCut, shipperRate) }}>
                {usd(t.brokerCut)}
              </div>
              <div className="seg dispatcher" style={{ width: widthPct(t.dispatcherCut, shipperRate) }}>
                {usd(t.dispatcherCut)}
              </div>
              <div className="seg carrier" style={{ width: widthPct(t.carrierNet, shipperRate) }}>
                {usd(t.carrierNet)}
              </div>
            </div>
          </div>

          {/* Direct model */}
          <div className="chain">
            <div className="chain-head">
              <span>Direct: shipper → you → carrier</span>
              <span className="net">Carrier nets {usd(comparison.direct.carrierNet)}</span>
            </div>
            <div className="stack" role="img" aria-label={`Direct model: your margin ${usd(comparison.direct.ourMargin)}, carrier nets ${usd(comparison.direct.carrierNet)}`}>
              <div className="seg margin" style={{ width: widthPct(comparison.direct.ourMargin, shipperRate) }}>
                {usd(comparison.direct.ourMargin)}
              </div>
              <div className="seg carrier" style={{ width: widthPct(comparison.direct.carrierNet, shipperRate) }}>
                {usd(comparison.direct.carrierNet)}
              </div>
            </div>
          </div>

          <div className="legend">
            <span className="key"><span className="swatch broker" />Broker cut</span>
            <span className="key"><span className="swatch dispatcher" />Dispatcher cut</span>
            <span className="key"><span className="swatch margin" />Your margin</span>
            <span className="key"><span className="swatch carrier" />Carrier take-home</span>
          </div>

          {carrierWins ? (
            <div className="callout">
              Going direct puts <strong>{usd(comparison.carrierGain)} more</strong> in the
              carrier's pocket for the same shipper rate — leverage to win capacity, or
              savings you can share with the shipper.
            </div>
          ) : (
            <div className="callout neutral">
              At this payout you're keeping more than the traditional broker + dispatcher
              stack ({usd(-comparison.carrierGain)} less to the carrier than the traditional
              chain). Lower the carrier payout only as far as the market bears — the win is
              being the single, leaner layer.
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
