// ---------------------------------------------------------------------------
// Analytics — pure aggregations over saved loads for the Insights page. Reuses
// the pricing and lane-rate engines so numbers stay consistent across the app.
// ---------------------------------------------------------------------------

import { marginBreakdown, ratePerMile } from "./pricingEngine";
import { benchmarkRatePerMile, compareToBenchmark, type BenchmarkVerdict } from "./laneRates";
import { isCovered, LOAD_STAGES, loadStatus, type LoadStatus, type Quote } from "./types";

const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface CoverageStats {
  total: number;
  covered: number;
  open: number;
  coveragePct: number;
}

export function coverageStats(quotes: Quote[]): CoverageStats {
  const total = quotes.length;
  const covered = quotes.filter(isCovered).length;
  const open = total - covered;
  return {
    total,
    covered,
    open,
    coveragePct: total > 0 ? Math.round((covered / total) * 100) : 0,
  };
}

/** Count of loads at each pipeline stage, in order. */
export function stageBreakdown(quotes: Quote[]): { stage: LoadStatus; count: number }[] {
  return LOAD_STAGES.map((stage) => ({
    stage,
    count: quotes.filter((q) => loadStatus(q) === stage).length,
  }));
}

export interface LaneMargin {
  lane: string; // "CA→AZ"
  count: number;
  totalMargin: number;
  totalRevenue: number;
}

/** Aggregate margin and revenue by state-to-state lane, biggest margin first. */
export function marginByLane(quotes: Quote[]): LaneMargin[] {
  const byLane = new Map<string, LaneMargin>();
  for (const q of quotes) {
    const lane = `${q.originState}→${q.destState}`;
    const { grossMargin } = marginBreakdown({
      shipperRate: q.shipperPrice,
      carrierPayout: q.carrierPayout,
    });
    const entry = byLane.get(lane) ?? { lane, count: 0, totalMargin: 0, totalRevenue: 0 };
    entry.count += 1;
    entry.totalMargin = round2(entry.totalMargin + grossMargin);
    entry.totalRevenue = round2(entry.totalRevenue + q.shipperPrice);
    byLane.set(lane, entry);
  }
  return [...byLane.values()].sort((a, b) => b.totalMargin - a.totalMargin);
}

export type RateVsMarket = Record<BenchmarkVerdict, number>;

/** How our shipper quotes sit against the lane market benchmark. */
export function rateVsMarket(quotes: Quote[]): RateVsMarket {
  const out: RateVsMarket = { below: 0, at: 0, above: 0 };
  for (const q of quotes) {
    const bench = benchmarkRatePerMile({
      originState: q.originState,
      destState: q.destState,
      equipment: q.equipment,
      miles: q.miles,
    });
    const { verdict } = compareToBenchmark(ratePerMile(q.shipperPrice, q.miles), bench);
    out[verdict] += 1;
  }
  return out;
}

export interface PortfolioSummary {
  totalRevenue: number;
  totalMargin: number;
  avgMarginPct: number;
  loads: number;
}

export function portfolioSummary(quotes: Quote[]): PortfolioSummary {
  let totalRevenue = 0;
  let totalMargin = 0;
  let marginPctSum = 0;
  for (const q of quotes) {
    const { grossMargin, grossMarginPct } = marginBreakdown({
      shipperRate: q.shipperPrice,
      carrierPayout: q.carrierPayout,
    });
    totalRevenue += q.shipperPrice;
    totalMargin += grossMargin;
    marginPctSum += grossMarginPct;
  }
  return {
    totalRevenue: round2(totalRevenue),
    totalMargin: round2(totalMargin),
    avgMarginPct: quotes.length > 0 ? round2(marginPctSum / quotes.length) : 0,
    loads: quotes.length,
  };
}
