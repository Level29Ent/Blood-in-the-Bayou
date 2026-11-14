# Tire-shop reference interior

The existing converted `kind === 'tires'` business uses tall yellow steel racks stocked with treaded tire rings on three tiers, a gray work floor with oil marks, a metal workbench/pegboard, blue drawer cabinet, red tire changer and wheel balancer, an empty blue two-post lift, oil-drain stand, corrugated roof ribs, red beams, a static ceiling fan and self-lit fluorescent strips.

The dedicated builder runs inside the actual access/shelter shell before generic furniture is added. The old tire-pile overlay and generic furnishing/register/wall-finish/stock passes skip this room. Existing parcel, automatic door, terrain elevation, service point, closest parked-car selection and $150 earned-game-cash repair behavior remain unchanged. It still asks the player to park outside. No raised driveable vehicle, lift animation, new transaction or tire-change minigame is implemented.

Repeated tires/tread blocks and fixtures use instanced geometry/material batches; no new dynamic lights, shadows, downloaded models/textures or animation loops. The industrial look is procedural game art rather than a photographic reconstruction.

`/game/tire-shop-review.html` renders the production furnishings inside an isolated 128×128 room, with entrance, rack and service-equipment views. It does not verify full-city startup, a live repair transaction or physical-device performance.

Focused tests cover the actual converted-venue integration, unchanged door/service/terrain base, restricted matching, radius-ten route clearance in 64/96/128/160-wide rooms, finite room-bounded instances, tire density/draw budget/no lights, and the existing tire-service transaction regression.
