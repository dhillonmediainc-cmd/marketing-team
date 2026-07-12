// Sample carriers and loads so the tools aren't empty on first run.
// In production these come from Astify's carrier network and real quotes.

import type { Carrier, Quote } from "./types";

export const SEED_CARRIERS: Carrier[] = [
  {
    id: "c-astify-001",
    name: "Sandhu Transport LLC",
    mcNumber: "MC-1184402",
    homeStates: ["CA", "AZ", "NV"],
    equipment: ["dry_van", "reefer"],
    minRatePerMile: 2.1,
    reliabilityScore: 94,
  },
  {
    id: "c-astify-002",
    name: "Great Plains Freight Inc",
    mcNumber: "MC-902551",
    homeStates: ["TX", "OK", "NM"],
    equipment: ["dry_van", "flatbed"],
    minRatePerMile: 1.95,
    reliabilityScore: 88,
  },
  {
    id: "c-astify-003",
    name: "Northwind Reefer Lines",
    mcNumber: "MC-771230",
    homeStates: ["IL", "WI", "IN", "OH"],
    equipment: ["reefer"],
    minRatePerMile: 2.55,
    reliabilityScore: 91,
  },
  {
    id: "c-astify-004",
    name: "Coastal Flatbed Co",
    mcNumber: "MC-663019",
    homeStates: ["GA", "FL", "SC", "NC"],
    equipment: ["flatbed", "power_only"],
    minRatePerMile: 2.4,
    reliabilityScore: 85,
  },
  {
    id: "c-astify-005",
    name: "Rocky Mountain Haulers",
    mcNumber: "MC-540988",
    homeStates: ["CO", "UT", "WY"],
    equipment: ["dry_van", "power_only"],
    minRatePerMile: 2.0,
    reliabilityScore: 90,
  },
  {
    id: "c-astify-006",
    name: "Midwest Van Express",
    mcNumber: "MC-1120774",
    homeStates: ["MO", "KS", "IA", "IL"],
    equipment: ["dry_van"],
    minRatePerMile: 1.9,
    reliabilityScore: 87,
  },
];

// Sample loads (some covered) so matching, the carrier board, and insights have
// content immediately. Prices follow the pricing engine (line haul by equipment
// + fuel + ~15% margin). Dates are staggered over the last couple of weeks.
const day = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

export const SEED_QUOTES: Quote[] = [
  {
    id: "seed-q1", createdAt: day(1),
    originCity: "Los Angeles", originState: "CA", destCity: "Phoenix", destState: "AZ",
    equipment: "dry_van", weightLbs: 28000, miles: 410,
    shipperPrice: 1156, carrierPayout: 1005, targetMarginPct: 15, status: "open",
  },
  {
    id: "seed-q2", createdAt: day(3),
    originCity: "Houston", originState: "TX", destCity: "Dallas", destState: "TX",
    equipment: "dry_van", weightLbs: 32000, miles: 240,
    shipperPrice: 676, carrierPayout: 588, targetMarginPct: 15,
    status: "accepted", assignedCarrierId: "c-astify-002", assignedCarrierName: "Great Plains Freight Inc",
  },
  {
    id: "seed-q3", createdAt: day(4),
    originCity: "Chicago", originState: "IL", destCity: "Indianapolis", destState: "IN",
    equipment: "reefer", weightLbs: 40000, miles: 200,
    shipperPrice: 679, carrierPayout: 590, targetMarginPct: 15,
    status: "accepted", assignedCarrierId: "c-astify-003", assignedCarrierName: "Northwind Reefer Lines",
  },
  {
    id: "seed-q4", createdAt: day(6),
    originCity: "Atlanta", originState: "GA", destCity: "Charlotte", destState: "NC",
    equipment: "flatbed", weightLbs: 46000, miles: 245,
    shipperPrice: 859, carrierPayout: 747, targetMarginPct: 15,
    status: "accepted", assignedCarrierId: "c-astify-004", assignedCarrierName: "Coastal Flatbed Co",
  },
  {
    id: "seed-q5", createdAt: day(8),
    originCity: "Denver", originState: "CO", destCity: "Salt Lake City", destState: "UT",
    equipment: "dry_van", weightLbs: 30000, miles: 525,
    shipperPrice: 1479, carrierPayout: 1286, targetMarginPct: 15, status: "open",
  },
  {
    id: "seed-q6", createdAt: day(11),
    originCity: "Seattle", originState: "WA", destCity: "Portland", destState: "OR",
    equipment: "dry_van", weightLbs: 22000, miles: 175,
    shipperPrice: 493, carrierPayout: 429, targetMarginPct: 15, status: "open",
  },
];
