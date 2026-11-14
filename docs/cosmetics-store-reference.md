# Crescent Beauty reference cosmetics store

The existing mall COSMETICS STORE receives original procedural furnishings inspired by the supplied apothecary, makeup-aisle and beauty-bar references: warm timber cubbies, densely stocked pastel/amber bottles, pump packs, jars and cartons, pale makeup shelving, pink beauty counter, two round illuminated-rim vanity mirrors and upholstered stools. Ten lipstick testers, wood/white checkout, a small botanical planter and decorative pendant/chandelier geometry round out the room.

279 skincare/makeup products in the reference 102 × 70 tenant use original fictional Crescent labels. No commercial labels, advertising photos or copied beauty-brand logos. Products, makeup application and mirrors are decorative, not new shopping, character-customization or live-reflection features.

The original tenant footprint, upper-floor location, doorway and browse/service point remain unchanged. Both gallery directions are supported. Shelves, beauty bar, stools and checkout register collision footprints while leaving a radius-ten central service route. Default counter/merchandise and generic stock/finish overlays skip this tenant. Existing other shops and mall movement/services are retained.

Repeated stock is instanced, product-label atlas faces are merged into one draw, at most 32 material/geometry draws, two small original canvas textures and no external models/downloads or new real-time lights. Mirror faces are tinted metal-like disks, not render-target mirrors. Physical-device frame rate remains unprofiled.

`/game/cosmetics-store-review.html` uses the production builder in the existing room footprint, with store/apothecary/beauty-bar/makeup cameras, omitting mall shell, actors and service UI. Existing mall review loads the module too.

Checks: `node --test tests/cosmetics-store-interior.test.cjs tests/source-integrity.test.cjs tests/interior-realism-parade.test.cjs`. Covers entry/service routes around stools in both directions, finite transformed geometry, stock counts/UVs/batch bounds, actual display integration and module/overlay order. Expanded mall, build/broad-suite and preview evidence is recorded in PR/task summary.
