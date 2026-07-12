# FreightDirect

Software for a **direct shipper-to-carrier brokerage** — one lean markup instead of
a broker spread stacked on a dispatcher fee. It's the working MVP for the model
described in [`transportation-brokerage-concept.md`](./transportation-brokerage-concept.md):
use an MC authority plus an existing dispatch operation (Astify) to be the *single*
paid layer between the shipper and the truck.

The whole app runs in the browser with no backend — data is seeded and persisted in
`localStorage` — so it opens and demos instantly, offline.

## The tools

| Tool | Route | What it does |
|------|-------|--------------|
| **Rate & Margin Calculator** | `/calculator` | Enter a shipper rate + carrier payout and see, for the same shipper rate, how much more reaches the truck under the direct model vs. the traditional broker→dispatcher chain. Also shows the lane's market rate/mile. |
| **Shipper Quoting Portal** | `/quote` | Instant direct quotes. Miles auto-calculate from the lane; every quote is checked against a market benchmark (below / at / above). Saved quotes become open loads. |
| **Load Matching** | `/loads` | Ranks the carrier network against each open load by equipment, lane, rate, and reliability. Book a carrier or release a covered load. |
| **Carrier Board** | `/carrier` | The carrier's view — see open loads that fit your equipment/lanes and book directly, no dispatcher fee. |
| **Insights** | `/insights` | Portfolio analytics: revenue and margin, load coverage, margin by lane, and how your rates sit against the market. |

## Architecture

Everything is built on one shared, unit-tested core so the money math lives in a
single place:

```
src/
  lib/
    pricingEngine.ts   # rate/mile, fuel, quoting, margin, chain comparison (the money math)
    laneRates.ts       # transparent market rate benchmark (anchored on pricingEngine)
    geo.ts             # offline distance from bundled US metro coords (haversine x circuity)
    matching.ts        # carrier <-> load fit scoring
    analytics.ts       # portfolio aggregations for Insights
    storage.ts         # localStorage persistence, seeded on first run
    seed.ts            # sample carriers + loads
    types.ts, format.ts, usStates.ts
  tools/               # MarginCalculator, QuotingPortal, LoadMatching, CarrierBoard, Insights
  pages/Dashboard.tsx
  components/          # Layout + shared UI
  styles.css           # theme-aware (light/dark) design system
```

**Stack:** Vite + React + TypeScript, React Router, Vitest. No UI framework
dependency — a small hand-rolled design system keeps the footprint minimal.

The pricing, benchmark, and distance models use clearly-labeled constants at the top
of each file. They're illustrative defaults meant to be tuned with real numbers (or
swapped for a real rate feed / distance API) — see the roadmap in the concept doc.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

Other commands:

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run test     # run the unit tests
```

## Testing

The money-critical logic is covered by Vitest unit tests:

- `pricingEngine.test.ts` — margin math and the traditional-vs-direct chain comparison.
- `geo.test.ts` — distance estimates within tolerance of known road miles.
- `laneRates.test.ts` — benchmark monotonicity and below/at/above bucketing.
- `analytics.test.ts` — coverage, margin-by-lane, and portfolio aggregations.

## Notes

- **No backend (v1).** Each browser keeps its own saved quotes/carriers. A backend is
  a later phase — see the concept doc's roadmap.
- **Data is illustrative.** Base rates, fuel, market multipliers, and city
  coordinates are reasonable defaults, not a live market feed.
