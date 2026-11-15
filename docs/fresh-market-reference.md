# Fresh Market reference interior

The existing `grocery` venues built by `places.js` now use a shared authored market interior instead of the old four generic racks. Greenmart, seafood/bait shops and other businesses keep their own designs.

Inspired by the supplied supermarket references:
- three wooden produce islands with red/green/yellow fruit rows and leafy vegetables;
- side-wall refrigerated produce in glazed cases;
- a four-tier prepared-meal case with divided food trays and clear lids;
- milk/dairy/freezer cases and a stocked cereal/pantry gondola plus jars, cans and packages along the opposite wall;
- department fascia, price tags, a checkout register, warm brown floor, exposed ceiling trusses and long retail light strips.

The main 256 × 224 room contains 375 produce pieces, 84 meal trays and 294 pantry/dairy items. Stock and fixtures use shared instanced batches; two generated textures supply original package labels and department lettering. No copied photos, store-brand art, external models, dependencies, realtime lights or new update loops.

Compact converted shelter-groceries retain the refrigerated produce, meals, dairy, wall groceries and checkout but omit freestanding islands/gondola when space is insufficient. Swapped canonical room dimensions are supported. Original building footprints, doors, service coordinates, venue IDs, grocery interactions and mission targets are unchanged; clerk remains at the back. Existing frontage transforms move stock, clerk and collision rectangles together. Existing generic furniture/stock, cover extraction and finish passes skip these authored rooms to avoid duplication or recoloring. Grocery shell's old ceiling/lighting is replaced by the authored ceiling; other shells are unchanged. Native bundles and the legacy root-level launcher are not regenerated.

`/game/fresh-market-review.html` uses the production builder at the real main parcel size with entrance, produce, refrigerated produce, meal-case and grocery-aisle cameras. It isolates the art; not full-city gameplay, a new shopping simulation or a phone-performance benchmark.

Tests exercise radius-ten reachability to original 0.35/0.65 service depths and browsing approaches at 256×224, 224×256, 192×160 and 160×192; finite translated/elevated geometry, stock counts and draw batches; actual grocery furnishing and frontage wrappers; runtime no-duplication gates and canvas textures. Existing Greenmart/boxing/fire checks cover neighboring integrations.
