# General Hospital reference interior

The existing five-floor General Hospital now has original procedural furnishings inspired by the supplied hospital photographs. This is not a photoreal asset replacement or a redesign of the separate abandoned quarantine-hospital landmark.

- Lobby: lime/green pediatric-style feature walls, simple white botanical silhouettes, blue waiting-seat banks, planters, an L-return reception desk, clinical displays and suspended hexagonal luminaires.
- Imaging: glass-front treatment bays, open central entrances, wheeled beds, examination equipment, bedside displays and wall-mounted clinical service rails.
- Morgue: six cold-storage doors and four wheeled stretchers with opaque draped covers, a sink and soap dispenser. No exposed bodies or gore.
- Patient/recovery floors: blue-and-white bays with warm headwalls, window/blind-like wall panels, wheeled beds, pillows, rails and bedside displays; family-support recliner, side table and sink.
- Pale tiled flooring, a central wayfinding strip, white ceiling grid and luminous flat panels connect the departments. Canvas textures are generated locally for floor tiles, display waveforms and department signs, not remote imagery or patient data.

All five departments, elevator/landing coordinates, six original patients and two patrol nurses are retained. Medical services and jobs are unchanged. Nurse movement now follows a three-segment route through the center corridor and open bay entrances rather than passing straight through new partitions. The new bedside details and monitors are decorative, not new medical simulations or interactive sliding doors. Collision reservations match fixed glass and major furniture; bay entrances stay open.

Repeated fixtures are instanced in fewer than 42 draw batches per floor, with no new dynamic lights. Only the selected floor's decor is shown within 450 units; generic room-finishing overlays skip the reference hospital to avoid duplicate ceilings and clutter. The original city shell remains responsible for exterior walls, automatic front door and story elevations. Memory/frame rate on physical devices has not been profiled.

## Checks

`node --test tests/hospital-interior.test.cjs tests/city-detail.test.cjs tests/interior-realism-parade.test.cjs tests/source-integrity.test.cjs tests/storefronts.test.cjs`

Covers player-radius flood-fill routes to staff, beds and elevator on all floors; open center lanes; nurse movement around fixed glass; finite translated geometry; draw-batch limits; existing patients, staff, floor selection and distance hiding; script order; and related source/storefront regressions.

`/game/hospital-review.html` uses the production interior builder with reception, imaging, morgue, ward, bedside and recovery cameras. It omits the outer city shell and actors, and does not verify full-city loading, actual healing/job actions, elevator UI or mobile performance. Preview findings are recorded in the pull request/final task summary.
