import { describe, it, expect } from "vitest";
import {
  coverageStats,
  marginByLane,
  rateVsMarket,
  portfolioSummary,
} from "./analytics";
import type { Quote } from "./types";

const q = (over: Partial<Quote>): Quote => ({
  id: Math.random().toString(),
  createdAt: new Date().toISOString(),
  originCity: "A", originState: "CA", destCity: "B", destState: "AZ",
  equipment: "dry_van", weightLbs: 20000, miles: 400,
  shipperPrice: 1150, carrierPayout: 1000, targetMarginPct: 15,
  ...over,
});

describe("coverageStats", () => {
  it("counts covered vs open and percent", () => {
    const s = coverageStats([
      q({ status: "accepted" }),
      q({ status: "open" }),
      q({}), // missing status -> open
    ]);
    expect(s.total).toBe(3);
    expect(s.covered).toBe(1);
    expect(s.open).toBe(2);
    expect(s.coveragePct).toBe(33);
  });

  it("is safe on an empty portfolio", () => {
    expect(coverageStats([]).coveragePct).toBe(0);
  });
});

describe("marginByLane", () => {
  it("aggregates by state lane and sorts by margin", () => {
    const rows = marginByLane([
      q({ originState: "CA", destState: "AZ", shipperPrice: 1150, carrierPayout: 1000 }), // 150
      q({ originState: "CA", destState: "AZ", shipperPrice: 1100, carrierPayout: 1000 }), // 100
      q({ originState: "TX", destState: "GA", shipperPrice: 2000, carrierPayout: 1500 }), // 500
    ]);
    expect(rows[0].lane).toBe("TX→GA");
    expect(rows[0].totalMargin).toBe(500);
    const caAz = rows.find((r) => r.lane === "CA→AZ")!;
    expect(caAz.count).toBe(2);
    expect(caAz.totalMargin).toBe(250);
  });
});

describe("rateVsMarket", () => {
  it("buckets each load into below/at/above", () => {
    const dist = rateVsMarket([q({}), q({})]);
    expect(dist.below + dist.at + dist.above).toBe(2);
  });
});

describe("portfolioSummary", () => {
  it("totals revenue and margin", () => {
    const s = portfolioSummary([
      q({ shipperPrice: 1150, carrierPayout: 1000 }),
      q({ shipperPrice: 2000, carrierPayout: 1500 }),
    ]);
    expect(s.totalRevenue).toBe(3150);
    expect(s.totalMargin).toBe(650);
    expect(s.loads).toBe(2);
  });
});
