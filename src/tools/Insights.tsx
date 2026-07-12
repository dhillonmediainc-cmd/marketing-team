import { useMemo } from "react";
import { PageHead, Card, Tile } from "../components/ui";
import { getQuotes } from "../lib/storage";
import {
  coverageStats,
  marginByLane,
  rateVsMarket,
  portfolioSummary,
  stageBreakdown,
} from "../lib/analytics";
import { STATUS_LABELS } from "../lib/types";
import { usd, pct, widthPct } from "../lib/format";

export default function Insights() {
  const quotes = useMemo(() => getQuotes(), []);
  const summary = portfolioSummary(quotes);
  const coverage = coverageStats(quotes);
  const lanes = marginByLane(quotes);
  const market = rateVsMarket(quotes);
  const stages = stageBreakdown(quotes);

  const maxLaneMargin = Math.max(1, ...lanes.map((l) => l.totalMargin));
  const marketTotal = market.below + market.at + market.above;

  if (quotes.length === 0) {
    return (
      <>
        <PageHead title="Insights">Portfolio analytics across your loads.</PageHead>
        <Card>
          <div className="empty">No loads yet — save a quote to see insights.</div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHead title="Insights">
        Where your margin comes from, how much freight you're covering, and how your
        direct rates stack up against the market — the data edge behind going direct.
      </PageHead>

      <div className="tiles">
        <Tile label="Revenue booked" value={usd(summary.totalRevenue)} hint={`${summary.loads} loads`} />
        <Tile label="Total margin" value={usd(summary.totalMargin)} good />
        <Tile label="Avg margin" value={pct(summary.avgMarginPct)} />
        <Tile label="Coverage" value={`${coverage.coveragePct}%`} hint={`${coverage.covered} of ${coverage.total} covered`} />
      </div>

      <div className="grid grid-2">
        <Card title="Load coverage" sub="covered vs. open">
          <div className="stack" role="img" aria-label={`${coverage.covered} covered, ${coverage.open} open`}>
            {coverage.covered > 0 && (
              <div className="seg carrier" style={{ width: widthPct(coverage.covered, coverage.total) }}>
                {coverage.covered}
              </div>
            )}
            {coverage.open > 0 && (
              <div className="seg" style={{ width: widthPct(coverage.open, coverage.total), background: "var(--text-muted)" }}>
                {coverage.open}
              </div>
            )}
          </div>
          <div className="legend">
            <span className="key"><span className="swatch carrier" />Covered ({coverage.covered})</span>
            <span className="key"><span className="swatch" style={{ background: "var(--text-muted)" }} />Open ({coverage.open})</span>
          </div>
        </Card>

        <Card title="Your rates vs. market" sub={`${marketTotal} quotes`}>
          <div className="stack" role="img" aria-label={`${market.below} below market, ${market.at} at market, ${market.above} above market`}>
            {market.below > 0 && (
              <div className="seg carrier" style={{ width: widthPct(market.below, marketTotal) }}>{market.below}</div>
            )}
            {market.at > 0 && (
              <div className="seg margin" style={{ width: widthPct(market.at, marketTotal) }}>{market.at}</div>
            )}
            {market.above > 0 && (
              <div className="seg dispatcher" style={{ width: widthPct(market.above, marketTotal) }}>{market.above}</div>
            )}
          </div>
          <div className="legend">
            <span className="key"><span className="swatch carrier" />Below market ({market.below})</span>
            <span className="key"><span className="swatch margin" />At market ({market.at})</span>
            <span className="key"><span className="swatch dispatcher" />Above market ({market.above})</span>
          </div>
          <div className="chart-note">Below/at market = competitive for winning shippers.</div>
        </Card>
      </div>

      <Card title="Shipment pipeline" sub="loads by stage">
        <div className="pipeline">
          {stages.map((s) => (
            <div key={s.stage} className={`pipe-stage${s.count > 0 ? " active" : ""}`}>
              <div className="count">{s.count}</div>
              <div className="name">{STATUS_LABELS[s.stage]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Margin by lane" sub="total margin booked per state-to-state lane">
        {lanes.map((l) => (
          <div className="hbar-row" key={l.lane}>
            <span className="hbar-label">{l.lane}</span>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: widthPct(l.totalMargin, maxLaneMargin) }} />
            </div>
            <span className="hbar-value">{usd(l.totalMargin)} · {l.count} load{l.count > 1 ? "s" : ""}</span>
          </div>
        ))}
      </Card>
    </>
  );
}
