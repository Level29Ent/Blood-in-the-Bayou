# Interstate, library, neighborhood detail and underground station

## Interstate I-29

Keep the existing outer loop and directional lane traffic; add two modeled
raised spans: Bayou Memorial Bridge on the western water crossing and East City
Viaduct. Both have 64-unit-high decks, continuous 200-unit approach/departure
ramps, concrete support piers and guardrails. Scene deck and terrain provider
share the same height function so cars/cameras do not remain at water/street
height. Bridge edge collision prevents driving sideways off the raised span.
Existing loop markings, rail and pole heights follow the deck.

Numbered signed exits connect to actual ground road paths:
1. Decatur Street / Bayou neighborhood
2. Airport / existing terminal access road
3. Mall / Garden Boulevard approach
4. East Gate Road / Depot Road commercial junction (new city-core connection)

These remain ground exit links from the loop, not a complete cloverleaf or
multi-layer underpass simulation. Raised spans are driveable ramps/bridges;
the east span is a viaduct, not a second simultaneous traffic layer below it.
No new toll/fuel/police mechanics are implied.

## Civic destinations

Greentown Public Library is an enterable single-floor building on added land,
with solid outer walls, a 48-unit door gap, textured shelving/books, reading
tables and signage. L on the map marks the entrance. No new unlock, book
inventory or mission payout system is attached.

Decatur Underground has a signed U / USE surface entrance, a modeled platform
96 units below ground, room walls/ceiling, columns, benches, a yellow platform
edge, rails and a stationary Level 29 Metro carriage with windows. U at the
entrance transfers the on-foot player into the lower layer; U at the marked
station return point restores the exact surface entrance position. Clear
velocity/snap camera on both transitions. Vehicles cannot enter. Platform/track
limits are solid. Street-level damage and automatic mission triggers do not
apply while occupying the underground layer. The carriage is **stationary**;
this does not implement a train timetable, moving ride or fast travel network.
U on the map identifies the surface entrance. This is a below-street space,
not a poster labeling an above-ground shop as underground.

## Neighborhood

Retain six residential blocks and two apartment exteriors; add colored porch
canopies/support posts, shrubbery, mailboxes and individual house-number signs
inside the existing yards. Existing street, house and base coordinates remain.
This improves the lightweight stylized neighborhood; homes remain exterior
scenery, not newly enterable apartments or purchased safehouses.

## Checks

277 regressions pass, including bridge ramp endpoints and smooth elevation
across all four directional lanes, new-parcel separation from military/housing,
underground room bounds, actual station entry/exit roundtrip and library doorway/
shelf collision. Existing road, troop, mission, interior, wheel and audio checks
retained. Local actual-launcher DOM/Three harness generates seven chapters,
traverses the library entry, enters/exits metro at -96 with solid room limits,
checks both bridge deck heights/ramp endpoints, and builds finite bridge/civic
geometry. It is scene/source evidence, not a rendered driving/walking playtest.

Production build, no-emit TypeScript and refreshed iOS archive validation are
reported in the PR. Installed native apps need a signed update. Existing Next.js
security advisory is still unresolved and needs a separate upgrade. Exact
appearance, phone FPS and real highway driving feel remain unverified until
preview/device playtesting. No production merge or promotion by this patch.
