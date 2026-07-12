// Sample carriers so the Load-Matching tool isn't empty on first run.
// In production these come from Astify's carrier network.

import type { Carrier } from "./types";

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
