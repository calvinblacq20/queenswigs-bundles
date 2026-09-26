# PRD — Queens Wigs & Bundles storefront

## Goal

Give Queens Wigs & Bundles (Kasoa, Ghana) a fast, premium online storefront that turns TikTok and
WhatsApp traffic into orders and showroom visits. Success = customers can find a style, see the price
per length, and send a complete order to the shop's WhatsApp in under a minute on a mid-range Android
phone.

## Who

- **Retail buyers** in Kasoa, Accra and nationwide, mostly mobile, arriving from TikTok/WhatsApp.
- **Stylists, salons and resellers** looking for bundles and wholesale pricing.

## Core user action

Pick a wig → choose a length/option → add to bag → send the order to WhatsApp (pickup or delivery).

## Stage

MVP. No accounts, no online payment. The shop confirms stock, delivery fee and payment on WhatsApp,
which is how it already sells today.

## Screens

| Screen                           | Purpose                                                                                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home (`/`)                       | Announcement bar, hero slideshow, value props, shop by style, why Queens (tabs), signature collections, best sellers, showroom story, TikTok reel, services, newsletter → WhatsApp |
| Shop (`/shop.html`)              | Full catalogue with style/price filters, sort, grid, quick view                                                                                                                    |
| Product (`/product.html?p=slug`) | Gallery, length/option picker, price, details, add to bag / order on WhatsApp, related                                                                                             |
| Visit (`/visit.html`)            | Showroom, hours, map, services, FAQ, contact                                                                                                                                       |
| Policies (`/policies.html`)      | Ordering, delivery, returns/exchange, privacy                                                                                                                                      |
| 404                              | Friendly not-found                                                                                                                                                                 |

Global: header with mega-menu, mobile drawer, search, bag drawer, floating WhatsApp button, footer.

## Data model (static, `src/data`)

- `Category { slug, name, blurb, image }`
- `Product { slug, name, category, lace, hair, description, image, gallery?, video?, badge?, variants[] }`
- `Variant { label, price | null, compareAt? }` — `price: null` = "price on request".
- Bag (browser `localStorage`): `{ slug, variant, qty }[]`, validated against the catalogue on load.

## Edge cases (designed first)

- Price on request → no add-to-bag; "Ask on WhatsApp" with the product prefilled.
- Corrupt / stale bag in storage (deleted product, old variant) → dropped silently from the bag, logged to console.
- Storage blocked (private mode) → bag works for the session, never throws.
- Unknown `?p=` slug → product page shows a not-found state with links back to the shop.
- Empty bag / empty filter result → explicit empty states with a way forward.
- Qty bounds 1–10 per line; checkout form validates name + area before opening WhatsApp.
- Reduced-motion users → all scroll/reveal motion disabled, content visible immediately.
- No JS → navigation, contact details, categories and hours still render (catalogue grids need JS).
- Slow 3G → responsive WebP, lazy-loaded below-the-fold images, self-hosted font, no third-party trackers.

## Out of scope (MVP)

Online payment, customer accounts, stock counts, reviews, admin dashboard. The catalogue lives in
`src/data/products.ts`; the owner (or a developer) edits it and redeploys. A CMS can come later.
