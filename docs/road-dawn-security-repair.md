# Road/mirror repair, bounded lighting, initial territory/security/property systems

## Screenshot defects fixed in source

The elevated road rotated local +Z onto the segment direction using a shortest
arc quaternion. For reverse-direction flat segments this can invert local +Y;
ramps acquire the wrong road normal/roll. Build an explicit right/up/forward
orthonormal basis with world-positive up and use it for every deck, including
negative X/Z directions. Existing physical road-height profiles remain intact.
New regression checks all four headings and rising/falling slopes. This fixes
a concrete geometry defect; exact photographed location still needs playtest.

Rearview reflection plane was at Z=-19, behind the original opaque decorative
mirror face at -17.7. Bring the actual render-target face forward to -17.3,
include chassis jump height in camera pose, populate on its first valid frame
and reduce later refreshes to every sixth simulation frame. The target remains
a real backwards scene render, not an image. Own-car and GPU-state restoration
from the previous implementation remain. No promise to fix all Safari GPU cases.

## Dawn/dusk overhead

Atmosphere searched the entire scene for weather clouds on EVERY frame when
no matching cloud nodes were found (`!clouds.length`), and re-traversed/recolored
cloud meshes even with unchanged palette. Cache empty results by scene/city and
recolor only when the cloud palette changes. A regression proves 20 camera calls
with no clouds perform one scan; a new city causes exactly one new scan.
This removes demonstrated overhead; **no measured Safari/phone frame-time profile
or claim that all dusk/dawn lag is eliminated**. High quality still costs shadows,
postprocess and mirror passes. No expensive advanced shader effects added while
fixing this performance issue.

## Street and highway lights / traffic lights

Add emissive fixture meshes on the interstate and eligible street junctions;
only two nearby pooled SpotLights cast illumination at a time, with shadows off.
Day/dusk/night transitions update fixture colors once per change. Nearby-light
selection runs once per 15 simulation frames, not every render. Existing lights
remain; no hundreds-of-shadow-lights implementation.

Up to 12 eligible intersections have NS/EW signal heads with exclusive green,
amber, and all-red clearance over a 36-active-second cycle. Ordinary ambient
AI brakes on red/amber before the intersection and can clear once inside.
Highway, player, pursuit and emergency vehicles aren't automatically stopped.
The signal phase uses active game time; no network-synchronized MP signal protocol
or player red-light fines. Tests cover timing and approaching/inside/off-axis cars.

## Territorial foot patrols / police vehicles

Three districts derive from existing unassigned business/nightclub/studio/cafe
sites. Each has a crew color/name sign and up to three uniformed patrolling human
NPCs. Entering turf warns the player; hostile foot NPCs follow street navigation,
check LOS and attack on cooldown outdoors. Aimed camera-ray shots with world
occlusion can remove them; one $150 game-cash bounty per defeated actor. These
are basic colored territorial foot patrols, **not a complete gang economy,
spoken warning recordings, drive-by combat or turf-capture/save system**.

Existing wanted state drives bounded police cruiser spawning: starts at two
stars, at most three. Cruisers use navigation targets, continuous steering and
road/chassis obstruction brakes, with capped speed escalation. Four/five stars
can place one stationary police-car roadblock near a forward target. Existing
vehicle collisions make it solid. Clearing wanted level removes spawned blockade;
map change cleans up owned entities. No fabricated world-Z overlap bypass.
Real pursuit cornering/roadblock placement/vehicle fights require longer driving
playtests; this is initial cruiser/blockade logic, not full tactical police AI.

## Property deed and rare-item lockers

F6 / on-foot safehouse PROPERTY button opens a vanilla modal. A $3000 fictional
cash deed unlocks a per-property collectible locker. Existing free rest/save
services are preserved for backward compatibility. Three once-only collectible
cache types (challenge coin, Blood in the Bayou poster, VIRAL poster) spawn at
safe exterior approaches to selected studio/cafe/club locations; blocked points
are skipped. Nearby pickup adds to carried inventory, persists collection flag
and plays a cue. Store/take transfers exactly one existing item, never creates
one. Locker content/deed/carried inventory persists under separate property key.
No real property purchase, arbitrary external inventory, rare firearm crafting
or inherited property economy implied. The prior ammo/cash stash remains separate.

## Evidence and outstanding requests

320 full Node tests pass before final minor pause/init adjustments; final results
in PR. New coverage: deck normals, signal states/braking, cloud-scan count,
mirror placement/jump pose, bounded turf and cruiser budgets, no-duplication item
transfers and deed funds/duplicate guards. Actual-launcher local scene harness
still completes Greenmart entrance/lift/checkout through full existing wrappers.
Production build, TypeScript no-emit, native source ZIP integrity/parity and
rendered preview checks are recorded in PR. These tests do not replace actual
police/gang/property playthroughs or a physical-device FPS profile.

**Still unfinished:** full drive-by/turf simulation, deeper police tactics,
recorded radio commercials/station IDs, volumetric god rays, advanced film-grain/
chromatic shaders, projected light shadows/brake spill, reactive water/ripple/
carwash/tire rendering and other previously listed stage details. No recordings
were generated or fake payment links added. Owner audio assets or a supported
production path are needed for recorded spots. Source changes are a PR, not an
agent merge/promotion or a native signed app release.
