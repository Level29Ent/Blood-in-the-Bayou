# Perimeter Tactical Surplus reference interior

Only the `depth === 'surplus'` Perimeter Tactical Surplus venue receives this reference-inspired original procedural interior. The existing 128 × 128 lot, entrance, service point, attendant and armory shop UI are retained; unrelated armories keep their weapon showcases.

Six wall tiers carry 114 tan/black boots with shaft, toe, sole and lace details. The opposite slatwall displays 27 field bags/pouches with flaps, buckles, straps and webbing. Two racks carry 22 hanging camouflage/olive garments, folded gear and wooden storage bases. A surplus chest, packaged-accessory endcap, field-blanket stacks, helmet silhouettes and wood checkout round out the stocked shop. Pale tiled floor, steel roof members, exposed duct and fluorescent geometry follow the references without copying store branding or artwork.

The new model replaces the generic armory stands at this venue; the later city-depth prop pass skips its old hardware display/counter. Other generic estate/lived-in/stock/finish passes also skip authored stock. Major shelving/racks/counter have matching collision footprints and a radius-ten route from entrance to checkout, station and wall displays. Existing frontage wrapper rotates the authored room and collisions together. Gear is decorative stock, not a new inventory or purchase catalog.

Repeated stock is instanced in at most 32 batches, three original local canvas textures, no external models/downloads or new dynamic lights. Physical-device performance has not been profiled.

`/game/tactical-surplus-review.html` uses the production builder in the existing shop footprint, with store, boot-wall, field-gear, clothing/bin and accessory cameras. It omits city shell, attendant and live shopping UI; it is not a full-city performance/transaction test.

Focused checks: `node --test tests/tactical-surplus-interior.test.cjs tests/source-integrity.test.cjs tests/armory-display.test.cjs tests/interior-realism-parade.test.cjs`. Covers venue targeting, player-radius routes, finite translated geometry, stock counts/batch bounds, actual production-branch integration, unchanged armory service and dependency order. Build, broad suite and preview findings recorded in PR/task summary.
