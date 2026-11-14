# Crescent Newsstand reference magazine store

The mall's existing MAGAZINE STORE now uses dense face-out stock inspired by the supplied magazine-shop photos. Its room, floor, doorway and browse/service behavior remain unchanged.

Five-tier rear/side wall shelves have visible retaining lips, stock depth and small category-strip accents. A four-tier freestanding rack and newspaper piles sit beside a compact checkout. Pale fixtures and wood-patterned flooring keep the covers prominent. Forty-eight original procedural cover illustrations depict fictional fashion, lifestyle, food, travel, home and children's titles; no copied magazine logos, celebrity photos or stock-image watermarks. The displays are decorative, not a new reading/purchasing feature.

The new builder replaces generic counter/merchandise only in this tenant. Its solids are registered into the existing mall-floor furniture list; the central entrance/service aisle stays clear. Both north/south orientations are supported. Generic business-stock and room-finish passes skip the authored magazine stock. Existing other shops, mall lifts/stairs/cafe and browsing remain unchanged.

One original 1024-square cover atlas is merged into one cover draw; other repeated shelves/stock use shared instanced geometry, fewer than 16 draws overall and no new lights or external downloads. Physical-device performance is not profiled.

`/game/magazine-store-review.html` uses the production builder in the actual 102 × 70 reference tenant footprint with store, wall, freestanding-rack and checkout cameras, omitting mall shell/staff/service UI. `/game/mall-review.html` also loads the new dependency.

Checks: `node --test tests/magazine-store-interior.test.cjs tests/mall-smith.test.cjs tests/source-integrity.test.cjs`. Covers player-radius access in both directions, stock counts, finite translated geometry/bounds/UVs, batch budget, production display integration, module order and mall service/threshold/lift/stair regressions. Build/broad-suite/preview findings recorded in PR/task summary.
