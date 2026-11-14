# Bayou frontage, Bayou Oaks subdivision and input interruptions

## Screenshot evidence

The uploaded runtime JSON records `undefined is not an object (evaluating 'f.born')` at 2026-11-14 00:33:59 UTC, before the merged #157 water-effect initialization fix. Current source retains that fix: Low allocates no volumetric/wake/foam resources and effects do not update partially initialized foam. Tests still cover updates before geometry, Low and high→low→high transitions. This report alone does not prove a new failure in the deployed fix.

The other screenshot shows an input handler error around `e.target.matches`. Jobs, estate lift and prologue keyboard handlers used `e.target?.matches(...)`, which only guards the target, not whether its method exists. Window/non-Element targets can throw. These now use optional callable matching. Real-handler tests send Window-like, missing and text-input targets while retaining ordinary key behavior. The repeated-error safety pause is not disabled; crash exports now include stack, buildProfile and recent startup phases instead of only a short message.

## Roads and new neighborhood

Bayou Oaks is a bounded eight-home subdivision planned near the Bayou Seafood & Bait waterfront business frontage visible in the supplied area. The exact camera/player coordinates are not present in screenshots; the anchor is the named Bayou Seafood/Bait frontage, falling back to Bayou Pawn if absent. A bounded nearest-vacant search with cached terrain samples and a pre-rasterized protected-site mask stays within 1800 units of that anchor and rejects protected buildings, water, existing facilities/mission parcels, roads through lots and steep land. It safely skips if no suitable site exists instead of replacing existing content.

The subdivision has a two-way spine, turning area, connected street approach, sidewalks, eight driveways/door paths, streetlights, mailboxes and eight varied exterior homes. Homes have collision footprints but are not new enterable/purchasable interiors. Existing public buildings and missions are not moved. The OAKS map blip and entrance sign identify it.

The nearby existing road cells and the new approach receive a shared-vertex pavement overlay. Simulation uses the same triangular height interpolation as rendered pavement, avoiding disconnected slabs/height seams. Routes do not fill water or cross protected footprints. Tree/rock/parked obstructions are removed only from the new road/subdivision footprint; no new moving traffic/NPC population is added. Rendering uses a bounded set of shared instanced house/prop materials plus one road surface. This is not a map-wide road replacement or a claim that every road has been inspected.

## Validation

Focused tests cover safe/blocked/water/grade parcel planning, eight non-overlapping homes, access-road connectivity to the established network, tile rasterization, road raycasts/support-height agreement, bounded instances, actual keyboard handlers, prior water fix, startup/Continue, runtime crash guard, source integrity and waterfront geometry. Full suite: 750/753 pass; the same three old reference-model tests require the absent `models/characters/ronniebaby.glb`. Production build and standalone TypeScript pass.

`/game/bayou-oaks-review.html` uses the production planner/renderer on a synthetic flat parcel (not the live city). `?neighborhoodReview=1` on the game shows read-only actual world placement status after city construction; normal play has no debug panel. Browser evidence is recorded on the PR. Physical Safari/device refresh, every road junction and driving over the full live approach remain separate acceptance checks. Existing downloadable iOS source archive is refreshed, not compiled/signed.
