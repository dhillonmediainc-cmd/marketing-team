import { describe, it, expect } from "vitest";
import {
  benchmarkRatePerMile,
  laneBenchmark,
  compareToBenchmark,
} from "./laneRates";

describe("benchmarkRatePerMile", () => {
  it("reefer benchmarks higher than dry van on the same lane", () => {
    const lane = { originState: "TX", destState: "GA", miles: 780 };
    const reefer = benchmarkRatePerMile({ ...lane, equipment: "reefer" });
    const dryVan = benchmarkRatePerMile({ ...lane, equipment: "dry_van" });
    expect(reefer).toBeGreaterThan(dryVan);
  });

  it("short hauls carry a higher $/mile than long hauls", () => {
    const short = benchmarkRatePerMile({ originState: "CA", destState: "AZ", equipment: "dry_van", miles: 150 });
    const long = benchmarkRatePerMile({ originState: "CA", destState: "AZ", equipment: "dry_van", miles: 1200 });
    expect(short).toBeGreaterThan(long);
  });

  it("west-coast lanes run hotter than midwest lanes", () => {
    const west = benchmarkRatePerMile({ originState: "CA", destState: "WA", equipment: "dry_van", miles: 800 });
    const midwest = benchmarkRatePerMile({ originState: "OH", destState: "IL", equipment: "dry_van", miles: 800 });
    expect(west).toBeGreaterThan(midwest);
  });
});

describe("laneBenchmark", () => {
  it("total is rate/mile times miles", () => {
    const b = laneBenchmark({ originState: "TX", destState: "GA", equipment: "dry_van", miles: 500 });
    expect(b.total).toBeCloseTo(b.ratePerMile * 500, 1);
  });
});

describe("compareToBenchmark", () => {
  it("buckets below / at / above around the tolerance", () => {
    expect(compareToBenchmark(2.0, 2.0).verdict).toBe("at");
    expect(compareToBenchmark(2.02, 2.0).verdict).toBe("at"); // 1% inside tolerance
    expect(compareToBenchmark(2.5, 2.0).verdict).toBe("above"); // +25%
    expect(compareToBenchmark(1.5, 2.0).verdict).toBe("below"); // -25%
  });

  it("reports a signed delta percent", () => {
    expect(compareToBenchmark(2.2, 2.0).deltaPct).toBeCloseTo(10, 1);
    expect(compareToBenchmark(1.8, 2.0).deltaPct).toBeCloseTo(-10, 1);
  });

  it("handles a zero benchmark safely", () => {
    expect(compareToBenchmark(2.0, 0).verdict).toBe("at");
  });
});
