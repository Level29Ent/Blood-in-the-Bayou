# Road surface seams and zoo–farm access

## Cause and repair
The submitted screenshot shows alternating jagged gray/black triangles across asphalt. The actual boulevard builder emitted its deck/corner top at exactly height zero with no depth bias, matching the underlying zero-height terrain. A focused execution of that builder reproduced top `0` / polygonOffset `false`; after this repair it produces top `0.08` with asphalt-only negative polygon offset, below its existing paint at `0.2`. This addresses the evidenced coplanar-depth cause; the exact screenshot location and deployed result still require visual verification.

Short-link pavement previously emitted at height minus `0.02` (below terrain); it now sits at height plus `0.04` with depth bias. Main road/car support heights and traffic rules are unchanged—there is no new ramp, cliff, global render-order/depth-test override or terrain flattening.

## Zoo–farm road
A late generation pass, after relocation and final parcel placement, searches between the existing zoo entrance and farm entrance approaches. Grid-corner centers reserve four adjoining cells for a full 64-unit-wide route, including bends, and it also joins an existing public road. Routing rejects water, building tiles, protected footprints plus margin, steep edges and non-lowland ground. It does not bulldoze the zoo, farm, buildings, other activity parcels or add arbitrary bridges. If no legal road exists the pass reports a reason on `city.zooFarmRoad` without changing tiles or failing world startup. Protected placement and full-world generated outcomes require deployment validation; synthetic fixture success is not proof of the player's particular map.

On success, all route cells become drivable road tiles (existing bridge tiles remain bridge); only route-cell trees, rocks and parked vehicles are cleared and tree indexing refreshed. One merged asphalt mesh follows the existing height provider plus a tiny visual offset. No new collisions close the lane. The original farm feeding/fields, zoo wildlife/keeper services, mission points and entrances remain unchanged. Zoo destination walkway slabs are emitted as unique tile patches excluding road/bridge cells, rather than 96-unit overlapping slabs that could conceal asphalt.

## Checks and limitations
Tests execute the real boulevard build and production static batcher; route continuity and full-width protected-cell preservation; multiple farm/zoo orientations; public-street connection; water/steep-ground no-op rejection; route-only obstruction clearing; finite support-aligned mesh geometry; late script order; and walkway clipping. Existing road/waterfront/support tests remain active. Full-suite failures unrelated to these roads remain unchanged.

`/game/road-seams-review.html` renders the actual boulevard builder and zoo–farm planner on a clearly labeled **synthetic** flat-map fixture for street-level/junction/route review. It is not the production city's zoo/farm layout, a driving test or a mobile-GPU test. Full-city generated connector placement, actual-site driving/entry clearance and exact screenshot-location appearance remain unverified until a preview can be checked.
