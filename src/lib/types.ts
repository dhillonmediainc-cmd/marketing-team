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
  /** Coverage state. Absent on older saved quotes — treat as "open". */
  status?: LoadStatus;
  assignedCarrierId?: string;
  assignedCarrierName?: string;
}

/** Full shipment lifecycle, in order. "open" = not yet covered. */
export type LoadStatus = "open" | "booked" | "dispatched" | "in_transit" | "delivered";

/** Pipeline order — index defines advance/revert direction. */
export const LOAD_STAGES: LoadStatus[] = ["open", "booked", "dispatched", "in_transit", "delivered"];

export const STATUS_LABELS: Record<LoadStatus, string> = {
  open: "Open",
  booked: "Booked",
  dispatched: "Dispatched",
  in_transit: "In transit",
  delivered: "Delivered",
};

/**
 * Coverage state of a load. Older records used "accepted" (now "booked") or had
 * no status at all (treat as "open").
 */
export function loadStatus(q: Quote): LoadStatus {
  const s = q.status as string | undefined;
  if (!s) return "open";
  if (s === "accepted") return "booked"; // legacy value
  return s as LoadStatus;
}

/** A load is "covered" once it has moved past the open pool. */
export function isCovered(q: Quote): boolean {
  return loadStatus(q) !== "open";
}

/** Next stage in the pipeline, or null at the final stage. */
export function nextStage(s: LoadStatus): LoadStatus | null {
  const i = LOAD_STAGES.indexOf(s);
  return i >= 0 && i < LOAD_STAGES.length - 1 ? LOAD_STAGES[i + 1] : null;
}

/** Previous stage in the pipeline, or null at "open". */
export function prevStage(s: LoadStatus): LoadStatus | null {
  const i = LOAD_STAGES.indexOf(s);
  return i > 0 ? LOAD_STAGES[i - 1] : null;
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
