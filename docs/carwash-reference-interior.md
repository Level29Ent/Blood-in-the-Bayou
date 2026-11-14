# Crescent Shine reference wash tunnel

All existing `spray` carwash venues now use an original procedural automated-tunnel interior inspired by the supplied wash photographs: four blue/black vertical cloth brushes, an overhead cloth roller, white/blue/red gantries, utility cabinets, wash signage, spray nozzles and water jets, rear soap curtain, overhead rails, bright panels, tiled side walls, drains, yellow hazard stripes and conveyor-style guide rails. The floor has a low-roughness wet-look material, not real-time reflections.

The existing vehicle entrance, door, parcel, service point, wash attendant and `$250` explicit-consent service remain authoritative. The original 180-tick wash still performs repair/respray/heat clearing. Brushes use the existing animation path and water jets show only while `v.wash` is active. This is visual equipment only: the car is not automatically transported by a conveyor, there is no new rear exit, and the player still stops in the bay and requests the service.

Support posts/cabinets have physical collision rectangles. The central 52-unit driving envelope and station radius stay clear in narrow, wide and rotated canonical parcel plans. Brush cloth and water intentionally are not hard driving obstacles. The existing frontage wrapper rotates the entire interior and furniture collision together, once. Generic estate/clutter/room-stock/finish passes skip the new equipment so vehicle lanes remain free.

Repeated parts and cloth strips are instanced, with fewer than 48 equipment mesh draws, two small local canvas textures, no external models/images or new lights. Movable brush groups and spray are marked noBatch. Physical-device frame rate is unprofiled.

`/game/carwash-review.html` uses the actual production builder in the 192 × 160 carwash footprint. Its review-cycle toggle rotates the same brushes and shows jets without charging fictional cash or modifying gameplay. It has no real vehicle, city shell or payment simulation and is not full-city wash-service verification.

Checks: `node --test tests/carwash-interior.test.cjs tests/source-integrity.test.cjs tests/storefronts.test.cjs tests/interior-realism-parade.test.cjs`. Covers vehicle-lane/service clearance, rotated solids, finite translated geometry, instance/draw budgets, overhead brush rotation, jet on/off behavior, production builder integration, module order and existing paid-cycle source invariants. Build/broad-suite/preview results are recorded in the PR/task summary.
