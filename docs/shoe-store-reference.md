# Crescent Sole reference shoe store

The existing mall SHOE STORE gets original procedural footwear inspired by the supplied running-shoe walls, red boutique displays and dense shoe aisles. The tenant footprint, floor, storefront sign, entrance and browse/service behavior are retained.

Five-tier rear/side shelves carry multicolored sneakers with shaped uppers, soles, collars, tongues, laces and side panels. The women's wall mixes heels and casual sneakers. Two red fitting benches, shoebox stacks/lids, sock packets and a compact checkout complete the shop. Pale slatwall, red display bays, wood floor and track-light geometry blend the reference cues. Original Crescent Sole category artwork avoids commercial shoe logos and copied advertising.

Matching solids reserve shelves, benches and checkout while the center browsing/service aisle remains clear for a ten-unit player radius in both north/south orientations. Existing mall furniture registration, floor/distance visibility and frontage handling are reused. Generic counter/stock/finish passes skip the authored shoe tenant. Shoes are decorative, not a new inventory, fitting or purchase feature.

Repeated parts are instanced in at most 32 draw batches, with one small local canvas sign map, no external assets/downloads and no new lights. Physical-device performance remains unprofiled.

`/game/shoe-store-review.html` renders the production stock in the actual 79.2 × 70 reference room, with store, sneaker-wall, women's-footwear and fitting-bench cameras. It omits surrounding mall, actors and live services. The existing mall review also loads the dependency.

Checks: `node --test tests/shoe-store-interior.test.cjs tests/source-integrity.test.cjs tests/interior-realism-parade.test.cjs`. Covers aisle/service access, original tenant targeting, geometry/stock counts, finite transformed instances, batch/ceiling bounds and module/overlay integration. Mall regression suite additionally exercises thresholds, lifts, stairs and cafe; existing unrelated failures are recorded in the PR. Build/broad-suite and preview findings recorded there and in task summary.
