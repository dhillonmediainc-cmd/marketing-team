// Load <-> carrier matching for the Load-Matching tool. Reuses the shared
// pricing engine for the money side; scoring here is purely about fit.

import type { Carrier, Quote } from "./types";
import { marginBreakdown } from "./pricingEngine";

export interface CarrierMatch {
  carrier: Carrier;
  /** 0-100 fit score. */
  score: number;
  reasons: string[];
  equipmentMatch: boolean;
  laneMatch: boolean;
  /** Our margin if this carrier hauls at the quote's carrier payout. */
  projectedMargin: number;
  projectedMarginPct: number;
}

/**
 * Rank carriers for a given open load (quote). Equipment is a hard-ish signal;
 * running the origin or destination state is a strong lane signal; reliability
 * and rate expectations are tie-breakers.
 */
export function matchCarriers(load: Quote, carriers: Carrier[]): CarrierMatch[] {
  const { grossMargin, grossMarginPct } = marginBreakdown({
    shipperRate: load.shipperPrice,
    carrierPayout: load.carrierPayout,
  });
  const loadRatePerMile =
    load.miles > 0 ? load.carrierPayout / load.miles : 0;

  return carriers
    .map<CarrierMatch>((carrier) => {
      const reasons: string[] = [];
      let score = 0;

      const equipmentMatch = carrier.equipment.includes(load.equipment);
      if (equipmentMatch) {
        score += 45;
        reasons.push("Equipment matches");
      } else {
        reasons.push("Equipment mismatch");
      }

      const runsOrigin = carrier.homeStates.includes(load.originState);
      const runsDest = carrier.homeStates.includes(load.destState);
      const laneMatch = runsOrigin || runsDest;
      if (runsOrigin && runsDest) {
        score += 30;
        reasons.push("Runs both endpoints");
      } else if (runsOrigin) {
        score += 22;
        reasons.push(`Based near origin (${load.originState})`);
      } else if (runsDest) {
        score += 15;
        reasons.push(`Runs into destination (${load.destState})`);
      } else {
        reasons.push("Outside home lanes");
      }

      // Rate fit: does the load pay at least the carrier's minimum rate/mile?
      if (loadRatePerMile >= carrier.minRatePerMile) {
        score += 15;
        reasons.push("Pays at/above their min rate");
      } else {
        reasons.push("Below their min rate");
      }

      // Reliability as a tie-breaker (up to 10 pts).
      score += Math.round((carrier.reliabilityScore / 100) * 10);

      return {
        carrier,
        score: Math.min(100, score),
        reasons,
        equipmentMatch,
        laneMatch,
        projectedMargin: grossMargin,
        projectedMarginPct: grossMarginPct,
      };
    })
    .sort((a, b) => b.score - a.score);
}
