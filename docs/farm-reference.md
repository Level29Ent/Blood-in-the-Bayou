# Bayou Farm reference redesign

The existing farm parcel now has two red timber barns with pale pitched roofs/white trim, open-looking central doors, visible hay-loft/feed-rack props, two silos, red tractor with cab and tread details, white three-rail perimeter/paddock fences, compact crop strips and a 24-pumpkin headland patch. Geometry is original and procedural, inspired by the supplied farm photos, not copied textures or photoreal licensed assets.

The former box barn, farmhouse and green tractor are replaced rather than duplicated. Existing farm allocation, size, entrance/GPS, animal exhibit coordinates, feeding charge/health reward and jobs are unchanged. Barn/tractor/silo collision footprints stay above the animal rows; the broad center entrance and existing animal movement remain available. Barn interior detail is visible scenery, not newly traversable rooms; the whole barn footprints stay solid. Crops, pumpkins and tractor are decorative, not new harvest/driving mechanics. Fence rails are visual, as the prior farm fence was; this does not add animal pathfinding or gates.

Sheep and goats now have separate compact ruminant anatomy instead of cow-derived skins/udders: four animated legs/hooves, slender faces, ears, horns/beard for goats and wool clumps for sheep. Existing cow/pig/chicken/duck models, counts, exhibit placement and animal movement are retained.

Repeated farm scenery uses instanced batches (under 40 draws in tests); no new dynamic lights, external assets, texture downloads or timers. The original animal-animation path remains. Full-city memory/device frame rate unprofiled.

`/game/farm-reference-review.html` uses actual scenery and animal builders in the 384 × 224 reference parcel, with overview, barns/tractor, sheep/goats and pumpkin cameras. It omits city terrain, jobs and feeding UI; it is not full-game verification.

Checks: `node --test tests/farm-reference.test.cjs tests/wardrobe-farm.test.cjs tests/source-integrity.test.cjs`. Covers parcel/collision bounds, animal-row and entrance clearance, finite/batched scenery, standalone sheep/goat features, actual upgrade integration, preserved entrance/feeding and script order. Build/broad-suite/preview evidence recorded in PR/task summary.
