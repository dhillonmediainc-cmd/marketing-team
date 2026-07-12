// Shared domain types for the FreightDirect MVP.

/** Trailer / equipment categories we quote and match on. */
export type EquipmentType = "dry_van" | "reefer" | "flatbed" | "power_only";

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dry_van: "Dry Van",
  reefer: "Reefer",
  flatbed: "Flatbed",
  power_only: "Power Only",
};

export const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_LABELS) as EquipmentType[];

/** A US state abbreviation is enough of a "region" for v1 lane matching. */
export interface Lane {
  originState: string;
  destState: string;
}

/** A saved shipper quote — produced by the Quoting Portal, consumed as an open load. */
export interface Quote {
  id: string;
  createdAt: string; // ISO timestamp
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipment: EquipmentType;
  weightLbs: number;
  miles: number;
  /** Price presented to the shipper. */
  shipperPrice: number;
  /** What we intend to pay the carrier (line haul + fuel, before our margin). */
  carrierPayout: number;
  targetMarginPct: number;
}

/** A carrier in Astify's network available to haul freight. */
export interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  /** States this carrier prefers to run in / out of. */
  homeStates: string[];
  equipment: EquipmentType[];
  /** Their preferred minimum rate per mile ($). */
  minRatePerMile: number;
  reliabilityScore: number; // 0-100
}
