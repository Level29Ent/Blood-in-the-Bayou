# Bayou Seafood & Bait reference interior

## Scope

Targets only the city-depth venue `depth: bait` named BAYOU SEAFOOD & BAIT. The supplied photographs inform a small, densely stocked fishing shop with a separate fresh-seafood case. It does not replace Gulf Fresh Fish Market, sporting goods, or Chief Jojo's restaurant. Existing site/parcel/frontage, automatic door, service marker and fishing supplies ($50 / +15 health) and smuggler-run services remain unchanged.

## Appearance

- Warm plank ceiling and fluorescent-style task strips; pegboard walls with 360 modeled carded lure/float/swivel-style packets at the canonical 160 × 128 parcel.
- Seventeen modeled fishing rods: twelve upright rods with reel/guide details and five suspended rod/reel displays.
- Bait buckets, glass-sided tackle counter with reels inside, register display, small packet headers and aisle-facing lure silhouettes.
- White fresh-seafood case with green dividers, ice chips, three whole fish with eyes/tails, three striped salmon-like fillets, twenty shrimp, lemons and small physical category/price cards.
- Labels/packaging are original geometric marks, not copied retailer brands. The small modeled price cards are not new readable price menus or purchases.

The named shop's old generic safe-style furniture and later aquarium/back-desk props are excluded, rather than hidden behind the new model. Generic stock, career clutter, categorized plans, legacy cover recovery/registers and finish recoloring skip `referenceBait`, so they cannot stack on top later.

## Collision and performance

Five footprint colliders reserve wall stock, rod stand, buckets and both counters. Radius-ten paths preserve doorway/service access and both browsing approaches at normal and rotated canonical dimensions. Overhead rods are above the walking volume. New goods, seafood, lights and ice are decorative, not collectibles, new live-bait simulation or dynamic lights. Repeated meshes are instanced into 22 tested batches without signs; no imported models, texture downloads, reflection passes, new dependencies or animation loops. Device frame rate is not measured.

## Verification

`node --test tests/seafood-bait.test.cjs tests/source-integrity.test.cjs tests/fish-market-interior.test.cjs tests/film-studio-interior.test.cjs tests/city-depth.test.cjs`

Includes target/exclusions, bounds and routes across canonical orientations, counts, finite/bounded translated instancing, exact production shell/furniture installation, unchanged pad/door/base, actual exclusion of aquarium props, actual legacy-runtime load and finish-runtime behavior. Broad tests, main-branch comparison, build and preview status are recorded in the PR.

`/game/seafood-bait-review.html` uses the production builder and offers shop-aisle, tackle/rod, seafood/ice and glass-counter inspection cameras. It omits the front shell and live services/NPCs for inspection, so it does not prove full-city interaction or gameplay appearance. Visual verification is reported separately from passing tests/build.

## Merge reconciliation

Merged main’s travel-center changes while retaining both referenceTruckStop and referenceBait guards and loader dependencies. The city-life wrapper now explicitly delegates Seafood & Bait to its authored expansion builder instead of substituting generic retail; a regression executes that actual wrapper. Aquarium/back-desk exclusion and original service routes are retained.

Passing source/build tests do not verify full-city rendering or mobile performance; deployment verification is reported separately.
