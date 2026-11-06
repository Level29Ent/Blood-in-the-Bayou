# Airport, harbor, weapon and gameplay-stall repair

## Map

Original procedural models and existing saves remain. Add48columns on the east, preserving original cell coordinates; current generated world is240×208tiles. The airfield occupies(6208,2240),1376×1248. Terminal(6304,2976),544×288, has a72unit entrance, six check-in counters, security lanes, seating, baggage fixtures, planters and wayfinding under a rising segmented roof/central tinted skylight. It is an original **MSY-inspired** single-floor game terminal, not a geographic replica or a full airline simulator. Airport public/architect reference: https://flymsy.com/business/capital-improvements/the-new-msy/ and https://pcparch.com/work/louis-armstrong-new-orleans-international-airport-north-terminal . Existing terminal service ID/key is retained. Original airport visuals are skipped, planes relocated to a separate apron/runway; existing bomber ride logic remains.

The road from the outer highway descends into the new airfield without crossing aircraft pads. Original streets remain in place; the former apron becomes an open lot rather than deleting roads/businesses around it. Terminal interior is walk-in, not a menu-only teleport. The source-world checks must distinguish fixture clearance from a driven vehicle test.

Natchez and other non-park boats move to the large southeastern coastal basin; the park skiff stays in its small lagoon. Captain/dock/shift coordinates move together, and the old pier becomes a four-story condominium with four streamed floors (two resident maximum) and preserved original-model rig. The pier itself uses pedestrian tile classification, not a detached vehicle-road component. The harbor approach grades over the outer highway, landing back at dock level. Small river loading crates were shifted off the new center aisle. Condo is a new accessible building, not a retroactive player deed or Ronniebaby replacement.

## Rendering and freeze work

A stable weapon view-model hierarchy was traversed every render despite already-prepared mesh records. Cache root shape and only revisit after root children change. Regression600render calls now perform1hierarchy scan. Periodic PBR binding likewise skips stable roots while retaining shared texture ownership and cached original maps.

Interior legacy conversion previously processed every candidate mesh in a fixture in a single update. It now handles one candidate mesh per update and assembles the same destructible result afterward. This reduces a confirmed source of burst work; large individual meshes can still cost time. These checks do **not** prove the reported screenshot freeze is resolved, nor establish a mobile FPS gain. Existing restart diagnostics/saves remain; no swallowed error/reload loop or storage clearing is added.

## Weapons

M240 belt rounds are no longer baked into the static body. Retained cartridge/link groups advance on real emitted shots; side ejection uses a fixed12case instance pool with gravity/spin and bounded0.7second lifetime. First-shot initialization is tested. Case effects do not become damage projectiles, new inventory or unbounded scene objects. Existing recoil/ammo/damage cadence unchanged.

First-person Standard/Physical materials retain original albedo, wood grain and machined maps, with shared metal/fabric/wood normal/roughness details applied to eligible finishes. This is a readability/material/animation pass—not scanned meshes or true firearm simulation for every gun. Federal outpost gains sandbag-style barriers, perimeter post/wire detail and communications mast; free-roam guards remain non-hostile.

## Validation

Focused tests cover terminal entry/corridor and matching solid fixtures, original-tile copy, first-shot belt/case lifecycle, and hierarchy scan counts. Existing airport-fixture test receives its missing city context; its original4plane checks remain. Source-world audit covers terminal walking samples,harbor approaches,four condo floors,boat water tiles,case/belt emission and connected-road count. Review page `/game/airport-weapon-review.html` uses actual terminal/M240 builders; it is not full-city appearance proof. Native source ZIP refreshed,not compiled/signed. Long Safari gameplay and actual plane/boat mission runs remain separate and no “all issues fixed”/locked60fps guarantee is made.
