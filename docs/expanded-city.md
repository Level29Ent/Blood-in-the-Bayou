# Expanded city boundary

The user approved a larger boundary rather than deleting existing city blocks.
This patch expands after existing core generation: **136×136 → 192×192 tiles**
(4352 → 6144 world units per side), about twice the ground area. Existing
business/home/mission landmark X/Z positions remain unchanged. Core generation
still uses the original size on each rebuild, then the extension is appended.
The copied grid preserves original cells except perimeter highway pavement and
explicit road tie-ins. No whole-world rescale, coordinate shift or save reset.

The source branch includes PR #44's bird aim, weapon wheel and snowball voice
fixes so those remain when reviewing this successor. Existing detailed interior,
airport, health pickup and mall work also remains.

## Added ground and neighborhood

South/east expansion land; bayou continues along western side of the southern
extension. Six residential blocks (three by two) near the southern mall end,
connected to a signed Decatur Street extension. Sixteen houses with pitched
roofs, windows, porches, yards/fences, plus two multi-story apartment-complex
exteriors. These homes are solid scenery, **not enterable apartments, purchased
safehouses or gear storage**. Existing store and safehouse services unchanged.

## Highway

A surrounding outer loop has two directional lanes per side of the median,
painted roads/bridges, guardrail meshes, light poles and signs. The western
segment bridges the bayou. Dedicated ground road links connect to the airport's
existing access spur, mall perimeter and new Decatur neighborhood. These are
at-grade connectors, **not modeled grade-separated interchange/overpass systems**.
No parcel is demolished to fit the expansion. Road planner avoids buildings,
mall/farm/cemetery/recreation and other protected amenity parcels.

Bounded highway AI spawns nearby (up to six), follows directional lane routes,
checks road/bridge chassis sweeps and traffic/player obstacles, and recycles
far-away cars. New highway paths are right-hand US-style travel; existing core
traffic rules are not rewritten here. Physical highway driving/traffic feel
needs live playtests; these are not verified autonomous lane-change behaviors.

Billboards display Level 29 Ent., Blood in the Bayou and VIRAL branding. Decorative
rails and poles do not add a new destruction/heat system. Ground texture density
is capped at 0.65 so the larger map doesn't allocate a full-resolution 6144²
texture. This is a memory bound, not a measured phone performance guarantee.

## Technical

Map getter/grid width and world bounds use the extended size; terrain padding
captures its original source-grid width so shoreline interpolation doesn't shift
when global dimensions increase. Existing airport/downtown/coastline world
identity checks accept the preserved core width. Homes are registered as solid
extension-residence footprints but skip default building rendering so custom
geometry is not drawn twice. Stairs/store entries and mission locations persist.

## Verification

265 Node tests pass, including copied coordinate/grid preservation, six blocks,
18 residences/two apartments, safe connector routing and separated right-hand
lane paths. Existing mission/stair/door/interior tests pass. Local actual-launcher
DOM/Three harness generates all seven chapters, traverses the twenty mall doors
and both stair flights, builds the expansion and verifies finite scene bounds,
192² dimensions, all six blocks, and road-painted points on all three links.
This is code/scene evidence, not rendered WebGL or a complete highway drive.

Production build/TypeScript and refreshed iOS source archive validation are
recorded in the PR. Installed native apps require a signed update. Existing
Next.js security advisory remains unresolved; upgrade recommended separately.

## Remaining larger request (not implemented here)

Wanted manager/police/crime escalation/roadblocks, emergency-service AI, purchased
safehouses/gear storage, live rear-view rendering, new studio/fight-club/plaza/
chop-shop gameplay, new side mission/heist chains and fuel/toll mechanics remain
outstanding as listed in docs/city-expansion-request.md. This map patch does not
claim completion of them. No production merge/promotion by this change.
