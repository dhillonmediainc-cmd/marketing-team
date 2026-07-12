import { describe, it, expect } from "vitest";
import { distanceMiles, hasCity } from "./geo";

// Real road-mile references (approx): allow ~15% tolerance since we estimate
// from great-circle distance x a circuity factor.
const within = (actual: number, expected: number, tolPct = 15) =>
  Math.abs(actual - expected) / expected <= tolPct / 100;

describe("distanceMiles", () => {
  it("LA -> Phoenix is ~370 mi", () => {
    const d = distanceMiles("Los Angeles", "CA", "Phoenix", "AZ")!;
    expect(d).not.toBeNull();
    expect(within(d, 370)).toBe(true);
  });

  it("New York -> Chicago is ~790 mi", () => {
    const d = distanceMiles("New York", "NY", "Chicago", "IL")!;
    expect(within(d, 790)).toBe(true);
  });

  it("Dallas -> Atlanta is ~780 mi", () => {
    const d = distanceMiles("Dallas", "TX", "Atlanta", "GA")!;
    expect(within(d, 780)).toBe(true);
  });

  it("is case- and whitespace-insensitive", () => {
    const a = distanceMiles("los angeles", "ca", "phoenix", "az");
    const b = distanceMiles("  Los Angeles ", " CA ", "Phoenix", "AZ");
    expect(a).toBe(b);
  });

  it("returns null for an unknown city", () => {
    expect(distanceMiles("Nowheresville", "ZZ", "Phoenix", "AZ")).toBeNull();
  });
});

describe("hasCity", () => {
  it("knows major metros", () => {
    expect(hasCity("Chicago", "IL")).toBe(true);
    expect(hasCity("Nowheresville", "ZZ")).toBe(false);
  });
});
