import { describe, it, expect } from "vitest";
import {
  loadStatus,
  isCovered,
  nextStage,
  prevStage,
  LOAD_STAGES,
  type Quote,
} from "./types";

const q = (status?: unknown): Quote => ({
  id: "x", createdAt: "", originCity: "", originState: "CA", destCity: "", destState: "AZ",
  equipment: "dry_van", weightLbs: 0, miles: 100,
  shipperPrice: 100, carrierPayout: 90, targetMarginPct: 10,
  status: status as Quote["status"],
});

describe("loadStatus", () => {
  it("defaults missing status to open", () => {
    expect(loadStatus(q(undefined))).toBe("open");
  });
  it("normalizes the legacy 'accepted' to 'booked'", () => {
    expect(loadStatus(q("accepted"))).toBe("booked");
  });
  it("passes through a valid pipeline status", () => {
    expect(loadStatus(q("in_transit"))).toBe("in_transit");
  });
});

describe("isCovered", () => {
  it("is false only for open", () => {
    expect(isCovered(q("open"))).toBe(false);
    expect(isCovered(q(undefined))).toBe(false);
    expect(isCovered(q("booked"))).toBe(true);
    expect(isCovered(q("delivered"))).toBe(true);
  });
});

describe("nextStage / prevStage", () => {
  it("walks the pipeline in order", () => {
    expect(nextStage("open")).toBe("booked");
    expect(nextStage("booked")).toBe("dispatched");
    expect(prevStage("dispatched")).toBe("booked");
  });
  it("returns null at the ends", () => {
    expect(prevStage("open")).toBeNull();
    expect(nextStage("delivered")).toBeNull();
  });
  it("every non-terminal stage advances and reverts consistently", () => {
    for (let i = 0; i < LOAD_STAGES.length - 1; i++) {
      const s = LOAD_STAGES[i];
      const n = nextStage(s)!;
      expect(prevStage(n)).toBe(s);
    }
  });
});
