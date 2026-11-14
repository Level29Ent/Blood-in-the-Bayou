# Cathedral district, power station, stocked businesses and Mardi Gras detail

## Placement

The existing St. Louis Cathedral / Jackson Square grouping is moved toward
Ronniebaby's penthouse. The church, spires, fence, vendor stalls and crypt identity
move together; there is no second church left at its former site. The cathedral
building retains its authored dimensions. Where a full 320-unit square will not
fit among existing roads and protected destinations, a 256-unit square preserves
the same church, gate and surrounding stalls instead of shrinking the church or
cutting a public road.

The nuclear station is placed at **the exact former cathedral parcel**, not by
replacing Ronniebaby's home or choosing an unrelated industrial site. The procedural
fictional facility includes two cooling towers, turbine hall, domed reactor building,
pipes, transformers, service markings, fence and a clear front gate. It is an
exterior landmark, not a technical simulation or a new mission.

Planning snaps parcels to the 32-unit grid, rejects water/roads/bridges and protected
buildings, and requires a real public walking approach. Empty pedestrian landscaping
may become the new square; replaceable anonymous scenery is cleared if necessary.
The beach, zoo, mall, military base, civic sites and other existing landmarks remain
reserved. The new plots are grounded at one height and cleared of trees/parked props.
The crypt key, vault entrance and return target now use the moved square's center,
so the original cathedral operation follows the relocation.

The generated-map check relocates the square from `(608, 3488)` to `(512, 1472)`,
roughly halving its straight-line distance to the penthouse. The old 320×320 site
is used unchanged by the plant. All 26 mall doorways and original prologue pickup
locations remain clear in the built-map check.

## Business and store detail

Businesses receive merchandise appropriate to their function, using reusable
stocked-fixture templates rather than another identical blank countertop:

- cafés/food: cups, plates, food trays, appliances and prep stock;
- technology: screens, devices and packaged equipment;
- garages/hardware: tires, tool boxes and tools;
- pharmacies/markets: bottles, labeled containers and boxed goods;
- clothing: folded garments and footwear;
- furniture/homewares: upholstered display pieces;
- toys: colorful miniature vehicles;
- sports: balls and sporting displays;
- music: instruments;
- books, plants, armories and offices: their respective stock.

Additional floor fixtures respect existing wall/furniture collisions, the central
walking corridor, doorway approach and service-pad radius. Existing countertop
surfaces are also dressed without introducing a new floor obstruction. Merchandising
uses the game's existing textured material library. Shared templates, static
batching, distance visibility and floor visibility limit the rendering cost.

The built-map check covers 91 business/floor records: 123 additional floor shelves,
existing stocked countertops, and five fallback wall cabinets. Every mall shop
receives counter stock without adding new floor obstructions.

Both Greenmart floors gain department-specific stock. Downstairs has round produce,
bottles and tins instead of exclusively rectangular packages; upstairs varies folded
clothing, electronics and boxed goods. New fixtures remain on the appropriate floor.
The original checkout and prologue Science Kit pickup retain their behavior.

## Parade presentation

Five original stylized float designs replace the repeated small crown carts:
**Crescent King**, **Bayou Dragon**, **Jester's Court**, **Magnolia Garden**, and
**Brass & Beads**. Each has a larger skirted platform, sculpted centerpiece, purple /
green / gold trim, riders with raised hands, rails, wheels and an aligned towing
tractor. Their widths remain below 30 game units, and repeated geometry/materials
are instanced. This is an interpretation inspired by the supplied Mardi Gras photo,
not a photorealistic reproduction or a copy of its specific float artwork.

More safe sidewalk positions can hold multiple spectator rows. Nearby residents,
marchers and cheering spectators share the same nine crowd batches, capped at 132
visible people. Confetti is a fixed 96-piece, three-batch local effect; no per-frame
mesh allocation or unbounded particle emitter is added. The existing longer route,
Ahmad's moving target and saved prologue order are retained.

## Verification and acceptance

`tests/district-detail.test.cjs` covers parcel snapping/protection, coordinated venue
translation, exact old-site reuse, preserved public roads, plant/gate bounds,
store-specific fixture geometry, safe shelving setbacks, Greenmart product shapes,
distinct float themes/widths/batch counts, bounded confetti and relocated crypt
coordinates. Existing prologue, mall, road and save tests remain in the full suite.

`/game/district-detail-review.html` is an isolated shared-model review for the parade,
plant and stocked fixture types. It is not the full generated map or a real-device
performance benchmark. Device acceptance should visit the new cathedral and former
site, complete the crypt interaction, walk the mall doors and business service pads,
collect the Science Kit, and traverse the moving festival on desktop and a phone.

The maintained iOS source archive includes the same runtime changes. Publishing an
installed iOS app still requires a newly signed native build; updating the website
alone does not update an old native bundle.

## Twin-tower reference update

The same existing power-station parcel now uses smooth, curved cooling shells with
an open annular top lip and dark inset inner throat, rather than solid cylinder
caps. Each shell starts above a modeled air-intake/support gap and has construction
seam rings that follow its changing radius. Two white steam plumes use 32 shared
low-poly transparent sphere instances, separate from opaque batches with depth
writes off; they are **static decorative scenery**, not particle/fluid/weather
simulation or a claim of moving steam.

The site gains a paved perimeter loop, central gate approach, lawn panels, low
service/intake houses, an annex and rooftop machinery while keeping the turbine
hall, domed building, transformers, fence, map marker and original site identity.
It remains a fictional exterior landmark, not a technical nuclear-plant simulation.
No new lights, shadows, textures, downloads or animation loops were added. The
photo is an architectural/palette reference, not a copied texture or scanned asset.

`/game/power-plant-review.html` renders the production landmark on isolated ground
with campus, tower and aerial cameras. It does not verify full-city streaming,
aircraft travel or device frame rate. Focused tests check two open shells, narrow
waists, no top cap cylinders, finite instance transforms, separate steam/no lights,
batch limits and the clear front gate approach.
