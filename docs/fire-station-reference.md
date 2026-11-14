# Fire station reference interior

The existing fire station is refitted around the supplied gear-room and apparatus-bay references. Ten red open-mesh cubbies carry original procedural turnout coats/pants with yellow/silver bands, helmets, boots and air-cylinder/harness silhouettes. Two slatted wood benches, dispatch counter/monitors, floor drain and exposed white trusses/fluorescent panels connect the spaces. Gray floor, red apparatus lanes and yellow safety lines echo the bay reference.

A multipart red engine display includes cab glazing, wheels, compartment/shutter detail, hose bundles, roof ladder and colored light-bar geometry. Three red glazed bay-door panels are scenery on the existing rear wall, not new driving exits. The engine is a fixed display collider, not an added drivable vehicle. Existing career/job vehicles remain unchanged.

Original fire-captain staff coordinates, station/service point, paid jobs, equipment actions and existing front entrance/door are retained. Generic estate/lived-in/room-stock/finish passes skip the authored station so they cannot clutter access. Matching locker/bench/desk/engine solids leave a ten-unit-radius route to captain, service point, gear area and apparatus viewing lane. No new gear inventory, locker interactions or emergency simulation is added.

Repeated wire mesh, garments and fixtures are instanced in at most 32 tested draws, no new textures, external downloads, dynamic lights or timers. Physical-device frame rate is unprofiled.

`/game/fire-station-review.html` renders production furnishings in the original 256 × 224 reference parcel with hall/gear/engine/bench cameras, omitting city shell, captain and live jobs UI. It does not verify full-city career actions.

Checks: `node --test tests/fire-station-interior.test.cjs tests/source-integrity.test.cjs tests/interior-realism-parade.test.cjs`. Covers route clearance, stock/engine counts, finite translated geometry, lot/ceiling/batch limits, actual production furnishing, captain coordinates and dependency/exclusion order. Build, broad suite and preview evidence recorded in the PR/task summary.
