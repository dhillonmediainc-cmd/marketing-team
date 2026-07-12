import { describe, it, expect } from "vitest";
import {
  ratePerMile,
  fuelSurcharge,
  quoteShipperPrice,
  marginBreakdown,
  compareChains,
  BASE_RATE_PER_MILE,
} from "./pricingEngine";

describe("ratePerMile", () => {
  it("divides rate by miles", () => {
    expect(ratePerMile(2000, 500)).toBe(4);
  });
  it("guards divide-by-zero", () => {
    expect(ratePerMile(2000, 0)).toBe(0);
  });
});

describe("fuelSurcharge", () => {
  it("is per-mile", () => {
    expect(fuelSurcharge(500, 0.45)).toBe(225);
  });
  it("is zero for zero miles", () => {
    expect(fuelSurcharge(0)).toBe(0);
  });
});

describe("marginBreakdown", () => {
  it("computes gross margin dollars and percent", () => {
    const b = marginBreakdown({ shipperRate: 2000, carrierPayout: 1500 });
    expect(b.grossMargin).toBe(500);
    expect(b.grossMarginPct).toBe(25);
  });
  it("handles zero shipper rate", () => {
    const b = marginBreakdown({ shipperRate: 0, carrierPayout: 0 });
    expect(b.grossMarginPct).toBe(0);
  });
});

describe("quoteShipperPrice", () => {
  it("builds line haul + fuel + margin", () => {
    const q = quoteShipperPrice({
      miles: 500,
      equipment: "dry_van",
      targetMarginPct: 15,
      fuelRate: 0.45,
    });
    // line haul: 500 * 2.0 = 1000, fuel: 500 * 0.45 = 225 => payout 1225
    expect(q.lineHaul).toBe(500 * BASE_RATE_PER_MILE.dry_van);
    expect(q.fuel).toBe(225);
    expect(q.carrierPayout).toBe(1225);
    // margin 15% of 1225 = 183.75 => shipper 1408.75
    expect(q.margin).toBe(183.75);
    expect(q.shipperPrice).toBe(1408.75);
  });

  it("adds a weight surcharge for heavy freight", () => {
    const light = quoteShipperPrice({ miles: 500, equipment: "dry_van", weightLbs: 20000 });
    const heavy = quoteShipperPrice({ miles: 500, equipment: "dry_van", weightLbs: 45000 });
    expect(light.weightSurcharge).toBe(0);
    expect(heavy.weightSurcharge).toBeGreaterThan(0);
    expect(heavy.carrierPayout).toBeGreaterThan(light.carrierPayout);
  });
});

describe("compareChains", () => {
  it("stacks broker then dispatcher on the traditional side", () => {
    const c = compareChains({ shipperRate: 2000, carrierPayout: 1700 });
    // broker 15% of 2000 = 300; remainder 1700; dispatcher 10% of 1700 = 170
    expect(c.traditional.brokerCut).toBe(300);
    expect(c.traditional.dispatcherCut).toBe(170);
    expect(c.traditional.carrierNet).toBe(1530);
  });

  it("shows the carrier keeping more under the direct model", () => {
    const c = compareChains({ shipperRate: 2000, carrierPayout: 1700 });
    expect(c.direct.carrierNet).toBe(1700);
    expect(c.carrierGain).toBe(170); // 1700 - 1530
    expect(c.carrierGain).toBeGreaterThan(0);
  });

  it("reports an honest negative gain when our margin exceeds the stacked cut", () => {
    // Paying the carrier only 1500 (we keep 25%) is worse for them than 23.5% stacked.
    const c = compareChains({ shipperRate: 2000, carrierPayout: 1500 });
    expect(c.direct.ourMargin).toBe(500);
    expect(c.carrierGain).toBe(-30); // 1500 - 1530
  });
});
