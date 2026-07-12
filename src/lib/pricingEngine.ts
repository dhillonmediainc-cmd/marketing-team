// ---------------------------------------------------------------------------
// FreightDirect pricing engine — the single source of truth for money math.
// All three tools (Margin Calculator, Quoting Portal, Load Matching) use this.
// Every tunable assumption lives at the top of the file, clearly labeled.
// ---------------------------------------------------------------------------

import type { EquipmentType } from "./types";

/**
 * Base line-haul rate per mile ($) by equipment type. These are illustrative
 * market-ish defaults for the MVP — edit to match real lane data.
 */
export const BASE_RATE_PER_MILE: Record<EquipmentType, number> = {
  dry_van: 2.0,
  reefer: 2.5,
  flatbed: 2.6,
  power_only: 1.6,
};

/** Default fuel surcharge added on top of line haul, per mile ($). */
export const DEFAULT_FUEL_RATE = 0.45;

/** Our single markup on top of carrier cost when quoting a shipper (%). */
export const DEFAULT_TARGET_MARGIN_PCT = 15;

/**
 * The "traditional chain" we are competing against, for the SAME shipper rate:
 *   1. Broker keeps a spread off the top.
 *   2. A dispatcher then takes a fee off what's left before it reaches the truck.
 * Defaults reflect the concept doc (broker 10-20%, dispatcher ~10%).
 */
export const TRADITIONAL_BROKER_PCT = 15;
export const TRADITIONAL_DISPATCHER_PCT = 10;

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Rate per mile for a given total rate and distance. Guards divide-by-zero. */
export function ratePerMile(rate: number, miles: number): number {
  if (miles <= 0) return 0;
  return round2(rate / miles);
}

/** Simple per-mile fuel surcharge. */
export function fuelSurcharge(miles: number, fuelRate: number = DEFAULT_FUEL_RATE): number {
  if (miles <= 0) return 0;
  return round2(miles * fuelRate);
}

export interface QuoteInput {
  miles: number;
  equipment: EquipmentType;
  /** Optional: heavy loads (>= 44,000 lbs) get a modest weight surcharge. */
  weightLbs?: number;
  targetMarginPct?: number;
  fuelRate?: number;
}

export interface QuoteResult {
  lineHaul: number;
  fuel: number;
  weightSurcharge: number;
  /** What we pay the carrier: line haul + fuel + weight surcharge. */
  carrierPayout: number;
  margin: number;
  /** What the shipper pays: carrier payout + our margin. */
  shipperPrice: number;
  ratePerMileShipper: number;
}

/** Heavy freight surcharge: 5% of line haul when at/above this weight. */
const HEAVY_WEIGHT_LBS = 44000;
const HEAVY_WEIGHT_SURCHARGE_PCT = 5;

/**
 * Build a shipper quote bottom-up: base line haul (by equipment) + fuel +
 * optional weight surcharge = carrier payout, then add our single markup.
 */
export function quoteShipperPrice(input: QuoteInput): QuoteResult {
  const {
    miles,
    equipment,
    weightLbs = 0,
    targetMarginPct = DEFAULT_TARGET_MARGIN_PCT,
    fuelRate = DEFAULT_FUEL_RATE,
  } = input;

  const lineHaul = round2(Math.max(0, miles) * BASE_RATE_PER_MILE[equipment]);
  const fuel = fuelSurcharge(miles, fuelRate);
  const weightSurcharge =
    weightLbs >= HEAVY_WEIGHT_LBS
      ? round2(lineHaul * (HEAVY_WEIGHT_SURCHARGE_PCT / 100))
      : 0;

  const carrierPayout = round2(lineHaul + fuel + weightSurcharge);
  const margin = round2(carrierPayout * (targetMarginPct / 100));
  const shipperPrice = round2(carrierPayout + margin);

  return {
    lineHaul,
    fuel,
    weightSurcharge,
    carrierPayout,
    margin,
    shipperPrice,
    ratePerMileShipper: ratePerMile(shipperPrice, miles),
  };
}

export interface MarginBreakdown {
  grossMargin: number;
  grossMarginPct: number;
}

/** Our margin given a shipper rate and what we pay the carrier. */
export function marginBreakdown(args: {
  shipperRate: number;
  carrierPayout: number;
}): MarginBreakdown {
  const { shipperRate, carrierPayout } = args;
  const grossMargin = round2(shipperRate - carrierPayout);
  const grossMarginPct =
    shipperRate > 0 ? round2((grossMargin / shipperRate) * 100) : 0;
  return { grossMargin, grossMarginPct };
}

export interface ChainComparison {
  shipperRate: number;
  /** Traditional chain: broker spread, then dispatcher fee on the remainder. */
  traditional: {
    brokerCut: number;
    dispatcherCut: number;
    carrierNet: number;
  };
  /** Our direct model: one markup, everything else goes to the carrier. */
  direct: {
    ourMargin: number;
    carrierNet: number;
  };
  /** Extra dollars the carrier keeps under our model vs. the traditional chain. */
  carrierGain: number;
  /** If instead passed to the shipper, the max the shipper could save. */
  shipperSavingsIfPassedThrough: number;
}

/**
 * Compare, for the SAME shipper rate, what the carrier nets under the
 * traditional broker+dispatcher chain vs. our single-markup direct model.
 * This is the concept doc's core thesis, made numeric.
 */
export function compareChains(args: {
  shipperRate: number;
  /** Our direct-model payout to the carrier (from quoteShipperPrice or manual). */
  carrierPayout: number;
  brokerPct?: number;
  dispatcherPct?: number;
}): ChainComparison {
  const {
    shipperRate,
    carrierPayout,
    brokerPct = TRADITIONAL_BROKER_PCT,
    dispatcherPct = TRADITIONAL_DISPATCHER_PCT,
  } = args;

  // Traditional: broker takes a spread off the shipper rate...
  const brokerCut = round2(shipperRate * (brokerPct / 100));
  const afterBroker = round2(shipperRate - brokerCut);
  // ...then a dispatcher takes a fee off what reaches the carrier.
  const dispatcherCut = round2(afterBroker * (dispatcherPct / 100));
  const traditionalCarrierNet = round2(afterBroker - dispatcherCut);

  // Direct: we keep one margin, the carrier gets the rest.
  const ourMargin = round2(shipperRate - carrierPayout);

  const carrierGain = round2(carrierPayout - traditionalCarrierNet);
  const shipperSavingsIfPassedThrough = round2(
    shipperRate - (carrierPayout + ourMargin),
  );

  return {
    shipperRate,
    traditional: {
      brokerCut,
      dispatcherCut,
      carrierNet: traditionalCarrierNet,
    },
    direct: {
      ourMargin,
      carrierNet: carrierPayout,
    },
    carrierGain,
    shipperSavingsIfPassedThrough,
  };
}
