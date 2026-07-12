// Thin localStorage persistence layer. No backend in v1 — everything lives in
// the browser, seeded on first run so the app is never empty.

import type { Carrier, Quote } from "./types";
import { loadStatus, nextStage, prevStage } from "./types";
import { SEED_CARRIERS, SEED_QUOTES } from "./seed";

const QUOTES_KEY = "freightdirect.quotes.v1";
const CARRIERS_KEY = "freightdirect.carriers.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — non-fatal for an MVP demo.
  }
}

/** Simple id generator that works without external deps. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// --- Quotes (also serve as open loads for the matching tool) ----------------

export function getQuotes(): Quote[] {
  const existing = read<Quote[] | null>(QUOTES_KEY, null);
  if (existing === null) {
    write(QUOTES_KEY, SEED_QUOTES);
    return SEED_QUOTES;
  }
  return existing;
}

export function saveQuote(quote: Quote): Quote[] {
  const quotes = [quote, ...getQuotes()];
  write(QUOTES_KEY, quotes);
  return quotes;
}

export function deleteQuote(id: string): Quote[] {
  const quotes = getQuotes().filter((q) => q.id !== id);
  write(QUOTES_KEY, quotes);
  return quotes;
}

/** Assign a load to a carrier — moves it from open into the "booked" stage. */
export function assignLoad(id: string, carrier: Carrier): Quote[] {
  const quotes = getQuotes().map((q) =>
    q.id === id
      ? { ...q, status: "booked" as const, assignedCarrierId: carrier.id, assignedCarrierName: carrier.name }
      : q,
  );
  write(QUOTES_KEY, quotes);
  return quotes;
}

/** Return a load to the open pool, clearing its carrier. */
export function unassignLoad(id: string): Quote[] {
  const quotes = getQuotes().map((q) =>
    q.id === id
      ? { ...q, status: "open" as const, assignedCarrierId: undefined, assignedCarrierName: undefined }
      : q,
  );
  write(QUOTES_KEY, quotes);
  return quotes;
}

/** Advance a load one stage down the pipeline (booked → … → delivered). */
export function advanceLoad(id: string): Quote[] {
  const quotes = getQuotes().map((q) => {
    if (q.id !== id) return q;
    const next = nextStage(loadStatus(q));
    return next ? { ...q, status: next } : q;
  });
  write(QUOTES_KEY, quotes);
  return quotes;
}

/** Move a load back one stage; reverting to "open" also clears its carrier. */
export function revertLoad(id: string): Quote[] {
  const quotes = getQuotes().map((q) => {
    if (q.id !== id) return q;
    const prev = prevStage(loadStatus(q));
    if (!prev) return q;
    if (prev === "open") {
      return { ...q, status: "open" as const, assignedCarrierId: undefined, assignedCarrierName: undefined };
    }
    return { ...q, status: prev };
  });
  write(QUOTES_KEY, quotes);
  return quotes;
}

// --- Carriers ---------------------------------------------------------------

/** Returns carriers, seeding the store from SEED_CARRIERS on first ever run. */
export function getCarriers(): Carrier[] {
  const existing = read<Carrier[] | null>(CARRIERS_KEY, null);
  if (existing === null) {
    write(CARRIERS_KEY, SEED_CARRIERS);
    return SEED_CARRIERS;
  }
  return existing;
}

export function saveCarrier(carrier: Carrier): Carrier[] {
  const carriers = [carrier, ...getCarriers()];
  write(CARRIERS_KEY, carriers);
  return carriers;
}

export function deleteCarrier(id: string): Carrier[] {
  const carriers = getCarriers().filter((c) => c.id !== id);
  write(CARRIERS_KEY, carriers);
  return carriers;
}
