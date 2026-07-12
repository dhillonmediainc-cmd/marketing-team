import { describe, it, expect } from "vitest";
import { matchCarriers } from "./matching";
import type { Carrier, Quote } from "./types";

const load: Quote = {
  id: "l1", createdAt: new Date().toISOString(),
  originCity: "Los Angeles", originState: "CA", destCity: "Phoenix", destState: "AZ",
  equipment: "dry_van", weightLbs: 28000, miles: 400,
  shipperPrice: 1150, carrierPayout: 1000, targetMarginPct: 15,
};

const carrier = (over: Partial<Carrier>): Carrier => ({
  id: Math.random().toString(),
  name: "Test Carrier", mcNumber: "MC-000",
  homeStates: [], equipment: ["dry_van"],
  minRatePerMile: 2.0, reliabilityScore: 90,
  ...over,
});

describe("matchCarriers", () => {
  it("scores an equipment match above a mismatch", () => {
    const fit = carrier({ equipment: ["dry_van"] });
    const wrong = carrier({ equipment: ["reefer"] });
    const [first] = matchCarriers(load, [wrong, fit]);
    expect(first.carrier.id).toBe(fit.id);
    expect(first.equipmentMatch).toBe(true);
  });

  it("rewards running both endpoints over neither", () => {
    const both = carrier({ homeStates: ["CA", "AZ"] });
    const neither = carrier({ homeStates: ["NY"] });
    const results = matchCarriers(load, [neither, both]);
    const bothScore = results.find((r) => r.carrier.id === both.id)!.score;
    const neitherScore = results.find((r) => r.carrier.id === neither.id)!.score;
    expect(bothScore).toBeGreaterThan(neitherScore);
    expect(results.find((r) => r.carrier.id === both.id)!.laneMatch).toBe(true);
  });

  it("returns carriers sorted by descending score", () => {
    const strong = carrier({ equipment: ["dry_van"], homeStates: ["CA", "AZ"] });
    const weak = carrier({ equipment: ["reefer"], homeStates: ["NY"] });
    const scores = matchCarriers(load, [weak, strong]).map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("caps the score at 100", () => {
    const perfect = carrier({ equipment: ["dry_van"], homeStates: ["CA", "AZ"], reliabilityScore: 100, minRatePerMile: 1.0 });
    const [m] = matchCarriers(load, [perfect]);
    expect(m.score).toBeLessThanOrEqual(100);
  });

  it("projects the load's margin onto every match", () => {
    const [m] = matchCarriers(load, [carrier({})]);
    // 1150 shipper - 1000 payout = 150
    expect(m.projectedMargin).toBe(150);
    expect(m.projectedMarginPct).toBeCloseTo((150 / 1150) * 100, 1);
  });
});
