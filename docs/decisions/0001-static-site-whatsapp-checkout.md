# 0001 — Static site with WhatsApp checkout

- **Status:** accepted
- **Date:** 2026-09-26

## Context

Queens Wigs & Bundles sells through TikTok, WhatsApp and a new showroom in Kasoa. Orders are
confirmed person-to-person on WhatsApp (stock, colour, delivery fee, payment). Customers are mostly
on Android over mobile data. The existing WordPress/WooCommerce site is unfinished (placeholder
products, Euro currency, spinner-only hero).

## Decision

Build a static multi-page site (Vite + TypeScript, no backend). The bag lives in `localStorage` and
checkout composes a structured order message to the shop's WhatsApp Business number
(+233 24 164 8058). The catalogue is a typed data file. Deploy to a static host (Vercel) with
security headers.

## Consequences

- No server, database, auth or payment surface to secure or pay for; near-zero hosting cost.
- Fast on 3G: pre-optimised WebP images, one self-hosted font family, small JS bundle.
- Prices/stock are updated by editing `src/data/products.ts` and redeploying.
- When the shop wants online payment (Paystack/MoMo) or self-serve stock updates, add a headless
  backend (e.g. Supabase) behind the same data interface; this ADR is then superseded.
