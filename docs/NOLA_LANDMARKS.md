# New Orleans-inspired landmark generator

Adaptation of the supplied Tremé/university/City Park generator, not a scanned geographic replica. Active original procedural models remain; no GLBs, external textures, render loops or dynamic lights are added to normal gameplay.

## Shared generator

`createNewOrleansLandmarks(THREE, scene, placements, options)` in `nola-landmarks.js` builds three named regional sites using map coordinates supplied by the allocator. A browser adapter `createNewOrleansLandmarks(scene)` uses the generated map's chosen sites. Do not call that adapter repeatedly to create duplicate live geometry.

- Tremé:18 narrow cottages in six columns/three rows, six pastel finishes, gabled roofs, shutters, porches and five double-gallery examples with actual railing balusters. Homes are exterior scenery, not new player properties or animated interiors.
- Bayou State campus annex: administration with copper-green dome/columns, science laboratory, liberal-arts hall and library surrounding a landscaped cross-walk quad. All four ground-floor rooms have40-unit open doors, clear central aisles and wall furniture; science benches, desks and library shelving differ. No course selection or new mission state is added. Existing university/quiz and old Tremé district are preserved.
- City Park interpretation:12 broad oaks with moss strips, lagoon, pedestrian bridge and an eight-column peristyle on dry ground beside water. This retains the user's requested small park lagoon even though the prior update moved broad bayou/beach water to the map perimeter. Lagoon has collision and a dry bridge crossing; no new swimming or boating area is claimed.

The sample's negative scene offsets are replaced with dry, flat, clearance-checked parcels. An undeclared material assignment is removed; colors/geometry are shared and repeated props are instanced. Campus library uses opaque tinted window material to avoid an expensive transmission pass; it is not transparent all-glass geometry. Physical shells/trees/columns/furniture use matching collider footprints. Town homes use human-scale heights relative to the game's10units/meter rather than copying oversized example dimensions literally.

## Placement and saves

Existing building/attraction/waterfront/farm/base/dealership and public mission approaches are reserved. Parcel allocation caches stable sites and builds sidewalks to low public roads without moving existing world coordinates. New markers:TR,UNI,PARK. The source-world sample places Tremé(800,1472), campus(768,1984), park(608,2976). These are safe annex sites, not promised exact neighborhoods or replacements for working locations. Existing save keys and owned properties are unchanged.

## Verification

Focused tests cover finite instanced transforms,18 homes,4 unobstructed campus door/aisles, lagoon separation from pavilion and trunks, and bounded mesh batches. Full source-world check covers actual chosen sites/door samples/approach paths and connected roads. Isolated GPU review is `/game/nola-landmarks-review.html`, not a full-city gameplay screenshot. Xcode/iPhone performance and full-city walking playtests are separate; no stable60fps or crash-free claim. Native source ZIP is refreshed, not signed or compiled.
