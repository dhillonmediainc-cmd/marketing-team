// Thin localStorage persistence layer. No backend in v1 — everything lives in
// the browser, seeded on first run so the app is never empty.

import type { Carrier, Quote } from "./types";
import { SEED_CARRIERS } from "./seed";

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
  return read<Quote[]>(QUOTES_KEY, []);
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
