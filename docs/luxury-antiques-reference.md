# Luxury Collection antiques reference interior

The existing upper-floor LUXURY COLLECTION tenant is refitted as a Crescent Antiques boutique inspired by the supplied antique-mall photographs. Original procedural fixtures include warm timber shelving/wood-and-gold glass curio cabinets, dense vases/goblets/ceramics, aged-book stacks, framed botanical prints, table lamps, flower console, bird figurine, glass display vitrine, wood checkout and suspended birdcage-style candle lights beneath wood ceiling members.

Artwork is generated locally and does not reproduce photographed store names, commercial artwork or watermark imagery. Tinted cabinet glass and self-lit lamp/candle faces are material effects, not new point lights, live reflections or imported assets. The existing LUXURY COLLECTION storefront name is retained.

Room footprint, floor, entrance and browse/service behavior remain unchanged. Furniture has registered collision footprints and ten-unit player-radius access to rear displays/service point in both gallery orientations. Existing mall floor/distance visibility is reused. Generic counter, stock and finish passes skip the authored antiques tenant; the lived-in wrapper already preserves builders returning a root. Antiques are decorative merchandise, not a new purchase/inventory feature.

Repeated stock/artwork uses shared instanced geometry/materials with at most 42 tested draws and one small original four-panel botanical canvas atlas. No new dynamic lights or downloads. Physical-device memory/frame rate not profiled.

`/game/luxury-antiques-review.html` uses production furnishings in the actual 79.2 × 70 tenant footprint, omitting mall shell, staff and shopping UI. Existing mall review loads the dependency too.

Focused checks: `node --test tests/luxury-antiques-interior.test.cjs tests/mall-smith.test.cjs tests/redesigned-integrations.test.cjs tests/source-integrity.test.cjs`. Covers routes, both orientations, finite translated geometry/bounds, dense stock counts, batch budgets, actual tenant hook/dependencies and existing repaired mall integrations. Build, broad suite and preview status recorded in PR/task summary.
