// ---------------------------------------------------------------------------
// Lane rate benchmark — a transparent market reference for a lane, so a quote
// can be shown as below / at / above market. Built from the pricing engine's
// BASE_RATE_PER_MILE adjusted by distance band and region; NOT an external feed.
// Every multiplier is a labeled constant here, swappable for a real rate index.
// ---------------------------------------------------------------------------

import { BASE_RATE_PER_MILE, DEFAULT_FUEL_RATE } from "./pricingEngine";
import type { EquipmentType } from "./types";

/**
 * Typical margin a broker/forwarder bakes into the shipper's all-in rate. Used
 * so the benchmark is an all-in market SHIPPER rate, comparable to our quote's
 * shipper price per mile (not just carrier line-haul cost).
 */
export const MARKET_MARGIN_PCT = 15;

/**
 * Per-mile rates run higher on short hauls (fixed costs spread over fewer miles)
 * and slightly lower on long hauls. Multiplier applied to the base $/mile.
 */
export const DISTANCE_BANDS: { maxMiles: number; multiplier: number }[] = [
  { maxMiles: 250, multiplier: 1.35 }, // short haul
  { maxMiles: 500, multiplier: 1.12 },
  { maxMiles: 1000, multiplier: 1.0 }, // reference band
  { maxMiles: Infinity, multiplier: 0.92 }, // long haul
];

/** Coarse census-style regions used for a light origin/destination multiplier. */
export type Region = "west" | "midwest" | "south" | "northeast";

export const STATE_REGION: Record<string, Region> = {
  WA: "west", OR: "west", CA: "west", NV: "west", ID: "west", MT: "west",
  WY: "west", UT: "west", CO: "west", AZ: "west", NM: "west", AK: "west", HI: "west",
  ND: "midwest", SD: "midwest", NE: "midwest", KS: "midwest", MN: "midwest",
  IA: "midwest", MO: "midwest", WI: "midwest", IL: "midwest", IN: "midwest",
  MI: "midwest", OH: "midwest",
  TX: "south", OK: "south", AR: "south", LA: "south", MS: "south", AL: "south",
  TN: "south", KY: "south", GA: "south", FL: "south", SC: "south", NC: "south",
  VA: "south", WV: "south", DC: "south", MD: "south", DE: "south",
  PA: "northeast", NJ: "northeast", NY: "northeast", CT: "northeast",
  RI: "northeast", MA: "northeast", VT: "northeast", NH: "northeast", ME: "northeast",
};

/** Regional demand multiplier — coastal/northeast lanes run a touch hotter. */
export const REGION_MULTIPLIER: Record<Region, number> = {
  west: 1.08,
  northeast: 1.06,
  south: 1.0,
  midwest: 0.96,
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

function distanceMultiplier(miles: number): number {
  return (DISTANCE_BANDS.find((b) => miles <= b.maxMiles) ?? DISTANCE_BANDS[DISTANCE_BANDS.length - 1]).multiplier;
}

function regionMultiplier(state: string): number {
  const region = STATE_REGION[state.trim().toUpperCase()];
  return region ? REGION_MULTIPLIER[region] : 1.0;
}

export interface LaneArgs {
  originState: string;
  destState: string;
  equipment: EquipmentType;
  miles: number;
}

/** All-in market SHIPPER $/mile for a lane (line-haul + fuel + market spread). */
export function benchmarkRatePerMile(args: LaneArgs): number {
  const base = BASE_RATE_PER_MILE[args.equipment];
  // Average the origin and destination region pull.
  const regionAvg =
    (regionMultiplier(args.originState) + regionMultiplier(args.destState)) / 2;
  const lineHaul = base * distanceMultiplier(args.miles) * regionAvg;
  return round2((lineHaul + DEFAULT_FUEL_RATE) * (1 + MARKET_MARGIN_PCT / 100));
}

export interface LaneBenchmark {
  ratePerMile: number;
  total: number;
}

/** Benchmark $/mile and total line-haul for a lane. */
export function laneBenchmark(args: LaneArgs): LaneBenchmark {
  const ratePerMile = benchmarkRatePerMile(args);
  return { ratePerMile, total: round2(ratePerMile * Math.max(0, args.miles)) };
}

export type BenchmarkVerdict = "below" | "at" | "above";

export interface BenchmarkComparison {
  verdict: BenchmarkVerdict;
  /** Signed % difference of quoted vs benchmark (positive = above market). */
  deltaPct: number;
}

/** Within this band of the benchmark counts as "at market". */
export const AT_MARKET_TOLERANCE_PCT = 5;

export function compareToBenchmark(
  quotedRatePerMile: number,
  benchmark: number,
): BenchmarkComparison {
  if (benchmark <= 0) return { verdict: "at", deltaPct: 0 };
  const deltaPct = round2(((quotedRatePerMile - benchmark) / benchmark) * 100);
  let verdict: BenchmarkVerdict = "at";
  if (deltaPct > AT_MARKET_TOLERANCE_PCT) verdict = "above";
  else if (deltaPct < -AT_MARKET_TOLERANCE_PCT) verdict = "below";
  return { verdict, deltaPct };
}
