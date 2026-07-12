# Direct Shipper-to-Carrier Brokerage: Concept Doc

## 1. The Problem: Where the Money Leaks

Today a shipment typically passes through four or five hands before a wheel turns:

```
Shipper  →  Freight forwarder / broker  →  Dispatcher  →  Carrier (truck/driver)
```

Each hop takes a cut for coordination, not for moving anything:

- **Shipper pays**: e.g. $10,000 for a load.
- **Broker/forwarder** takes a spread (industry norm: 10–20% gross margin) to match
  the shipper's freight to a carrier network.
- **Dispatcher** (paid by the carrier, not the shipper) takes a flat fee or a
  percentage of the load to find and book freight for a truck/owner-operator,
  because most carriers don't have the time or relationships to work brokers
  directly.
- **Carrier** is left with whatever remains after both cuts — in the scenario you
  described, as little as ~$7,000–7,500 of the original $10,000.

Neither the broker nor the dispatcher touches a truck or a container. They exist to
solve an information and trust problem: shippers don't know which carriers are
available and reliable, and carriers don't have the sales infrastructure to find
shippers directly. That information/trust gap is the entire reason the two extra
layers get paid.

## 2. Flexport as Reference Model

Flexport is the most credible existing attempt to "fix" this chain, so it's worth
being precise about what it actually did:

- **It did not eliminate the middlemen.** As a freight forwarder, Flexport still
  coordinates 5–20 other parties per international shipment (ocean/air carrier,
  customs broker, drayage, insurance, etc.). ~75% of its revenue is still the
  buy/sell spread on freight — the same economic position as a traditional
  forwarder.
- **What it actually built is a UI, not a shorter chain.** Its moat is a single
  cloud dashboard that gives the shipper visibility into tracking, documentation,
  and customs status across all those parties, so the complexity is hidden rather
  than removed. That convenience is what shippers are actually paying for.
- **Software is a minority of revenue (~18%)** — customs brokerage, cargo insurance,
  trade finance (Flexport Capital), and a subscription analytics tier. It's a
  real business line, but it doesn't replace the core freight spread.

**Takeaway:** the lesson from Flexport isn't "go build a dashboard." It's that
shippers will pay a premium for visibility and reduced coordination overhead — and
that premium is available to whoever removes a real layer of friction, not just
whoever adds a screen on top of the existing chain.

## 3. Your Structural Advantage

Most people who want to "cut out the middlemen" are starting from zero on both
sides of the transaction. You are not:

- **MC Authority** — gives you the legal standing to act as a carrier of record
  (or, with the appropriate broker authority/bond, as a broker of record) instead
  of relying on a separate licensed broker to originate freight.
- **Astify (dispatch company)** — already has live relationships with carriers,
  active load-board presence, and the operational muscle to fill trucks. This is
  normally the hardest, slowest part to build from scratch.

Combined, these two assets mean you can plausibly be the *single* paid layer between
shipper and carrier instead of two: one entity that sources the freight (today
broker's job) and books/executes it (today dispatcher's job), collecting one markup
instead of stacking a broker spread and a dispatcher fee.

## 4. Proposed Model

### Entity structure

Decide explicitly which role(s) your entity plays for a given load, since the
regulatory obligations differ:

- **Acting as broker** (introducing shipper freight to a carrier, including your
  own carriers via Astify): requires FMCSA broker authority, a $75,000 broker bond
  (BMC-84/85), and a process agent (BOC-3). Broker and dispatcher are legally
  distinct from carrier — don't blur them in contracts.
- **Acting as carrier** (hauling under your own MC authority): requires carrier
  insurance (cargo + auto liability), and you take on carrier liability for the
  freight, in exchange for keeping the full carrier-side rate rather than paying
  it out to a third-party carrier.
- **Acting as dispatcher for outside carriers**: Astify's existing role — paid a
  fee/percentage by the carrier, not the shipper.

A given piece of freight should be cleanly routed through one economic model —
know before you quote whether a specific shipper deal will be fulfilled by your own
trucks (carrier economics) or a partner carrier you dispatch to (broker/dispatcher
economics collapsed into one fee).

### Margin capture

Instead of the market stacking ~10–20% (broker) + a separate dispatcher fee, offer
a single markup in that range or slightly below. Split the savings two ways:
- **Shipper side**: a rate modestly below what a broker+forwarder chain would quote,
  so switching to you is an easy financial decision.
- **Carrier side**: a modestly better payout than they'd net after paying both a
  broker's rate and a dispatcher's cut, so carriers prefer taking loads from you
  directly over the open load board.

You don't need to be free of margin — you need to be the cheapest *legitimate*
path from shipper to carrier, which is achievable purely by removing one paid hop.

## 5. Go-to-Market: Shipper Acquisition

This is the actual hard part — sourcing freight directly from shippers is a sales
problem, not a software problem, and Flexport spent years building that trust
before software mattered. Two realistic paths, not mutually exclusive:

**Option A — Direct outreach/sales.** Astify's team (or a small new sales function)
cold-contacts shippers and manufacturers directly — the same target list a broker
would work, but you're going around the broker instead of through it. Fastest to
start, hardest to scale without a recognizable brand; works best if you pick one
lane/commodity where Astify already has carrier depth, so you can quote
confidently and deliver reliably from day one.

**Option B — Freight-forwarder positioning for a specific lane.** Position your
entity as the forwarder of record for a narrow trade lane (e.g., a specific
China→US import category), taking on the customs/documentation work a forwarder
normally does. This gives shippers a concrete reason to go direct to you instead
of a broker (you're offering a superset of services, not just a cheaper broker),
but it raises the operational bar — customs compliance, documentation, possibly a
customs broker partnership.

**Recommendation:** start narrow — one lane, one shipper vertical — before trying to
generalize. Prove the unit economics (real margin captured, real on-time
performance, real carrier satisfaction) on a small volume before investing in a
broader sales motion or a lane like international forwarding that adds regulatory
complexity.

## 6. Phased Roadmap

- **Phase 0 (this document).** Model and go-to-market laid out; no software yet.
- **Phase 1 — Manual pilot.** Run 2–3 lanes manually through Astify + your MC
  authority. Track actual margin captured per load, carrier payout vs. market,
  shipper retention. This validates the economics before any engineering investment.
- **Phase 2 — Software MVP (to be scoped separately once Phase 1 data exists).**
  Likely candidates, in rough order of leverage:
  - A shipper-facing quoting tool (fast, direct rate quotes without a broker call).
  - An internal margin/rate calculator (make sure every quoted load is priced
    correctly relative to carrier payout before it's sent).
  - A load-matching tool tying Astify's carrier network to inbound shipper demand.

## 7. Open Risks

- **Regulatory**: broker and carrier authority carry different legal obligations;
  operating as both under one entity requires care to avoid double-brokering
  violations (illegal re-brokering of a load without the shipper's knowledge) and
  to keep broker/carrier functions cleanly separated in contracts and paperwork.
- **Capacity/liability risk**: as a broker you transfer cargo risk to the carrier;
  as a carrier of record you hold it. Don't take on that shift without corresponding
  insurance.
- **Trust/credibility**: shippers already have relationships with established
  brokers and forwarders. A new, unbranded direct entity has to earn that trust —
  which is exactly why starting with one proven lane matters more than breadth.
