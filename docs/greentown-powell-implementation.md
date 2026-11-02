# Greentown Mall, Sgt. Powell and world/HUD fixes

## Greentown Mall

The approved city-sized alternative replaces the earlier metric/local-origin
proposal. On the generated map the redevelopment parcel is 640×512 game units,
with a 576×416 building (roughly four ordinary business footprints). Placement
first seeks clear space, then allows redevelopment of ordinary non-business
filler blocks/road tiles while protecting named businesses, civic/activity lots,
water, farm, cemetery, airport and pier. Scenic roads detour around its reservation;
AI traffic respects blocked/replaced grid lanes instead of crossing the mall.

All signage/directions use **GREENTOWN MALL**. Three walkable levels use heights
0/56/112 game units with glass lift hubs at both ends; U cycles floors. An open
atrium has a synthetic-ice-style rink, ring mezzanines, glass safety rails, an
arched transparent skylight with steel ribs, larger glass side facades and an
upper skybridge across the atrium. Escalator modules are scenery; the paired U
lifts are the supported vertical transport. These are original stylized modules,
not a licensed copy of The Galleria or a photorealistic reconstruction.

Retail displays: fashion, tech/gifts, home/living, cafe, luxury collection and
executive talent. The cafe retains its functional $60 fictional-cash meal;
other counters are browse/display spaces, not new inventory/paid purchases.
Existing Damion's mission office stays in its original location. The third-tier bridge connects to compact elevated side parking decks. These
are walkable parking terraces, not a drive-in garage simulation. Skating physics
is not implemented.

## Sgt. Powell

POWELL in the HUD marks his base location. The NPC uses the supplied portrait on
his board, a stylized Marine-style cap/camouflage human avatar, and a name sign.
The generated map places him near an existing military-zone service site; the
P marker is the authoritative route. U near him opens 15 ordered operations.

Implemented operation chains follow the script's names and rewards:

1. Four Shadows — four sequential armored boss hunts.
2. Bring Them Home — three distinct survivor escorts back to base.
3. Eyes in the Sky — 60-second gunner flight, at least 12 confirmed kills.
4. Medical Lifeline — three medical pickups.
5. Broken Signal — battery/radio pickups and three relay interactions.
6. Last Truck Out — recover the exact assigned truck; at least 25% health.
7. Hold the Gate — three infected waves at marked defense checkpoints.
8. Missing Patrol — two survivor escorts.
9. Black Box — two searches followed by recorder recovery.
10. Safe Passage — four clearance checkpoints.
11. Fuel for the Fleet — three fuel pickups.
12. Overwatch Rescue — 60-second gunner flight, at least 18 confirmed kills.
13. The Heavy Response — two boss hunts plus their supply cases.
14. Night Watch — four patrol interactions followed by a survivor escort.
15. Level 29 United — two medical pickups, two escorts and a boss.

These reuse tested stage primitives. They do not add fifteen bespoke cinematic
levels. Overwatch uses a confirmed-kill target rather than a simulated ground
convoy; defense waves require defeating their spawned targets at checkpoints,
not a new timed siege mode. Pickup/relay/search/patrol steps use proximity plus
U, not hidden automatic awards. Targets are placed near current-map service
routes with a safe-road search. Resources are visible cases. Every stage has a
P waypoint, and every operation requires a return/debrief for its listed reward.
Completed operations persist locally, unlock in order and cannot pay twice;
in-progress operations restart after reload. Death/abort permits retry. Solo
only; recordings are not connected and no synthetic voice has been generated.
Regular paid bomber flights remain 29 seconds; Powell mission flights are free
60-second runs only during an active airborne operation and keep aimed-hit rules.

## Collision, boats and roof fixes

- Oriented vehicle footprints block player/NPC/zombie movement and other chassis
  instead of letting them walk through doors or the car center. Own occupied
  vehicles are excluded. Removed vehicles are ignored; wrecks remain solid.
- Parked and ambient boats validate water across their footprint and search a
  nearby safe mooring. Boats with no safe site are omitted rather than left on
  the airport/road. Boat render height follows the waterline, not land terrain.
- Venue roofs stay out of static batches and hide while the player is inside;
  they are not permanently baked into an obstructing overhead sheet.

## Guidance, HUD and business NPCs

Mission guidance lists remaining race checkpoints, rescue/extraction points,
resource pickups/deliveries and other mission targets with distance and projected
labels; wrapped story/job/Powell target providers retain priority.

The top-right status is now a DOM flex stack and the action controls are one
responsive grid. Cash/health/armor/heat/weapon/vehicle/upgrades are in the same
scrollable container as map, daily spin/challenges, city stories, mall and Powell.
The old canvas status stack is disabled only when the new HUD is installed.
The daily challenge and daily log-in dialogs now use distinct IDs/selectors,
so their fixed-position CSS can no longer collide.

Humans get a shared 256px original cloth-weave bump texture and stitching. Named
business actors also get a cached subtle skin bump texture and small per-identity
jaw/head refinements (rather than a photo stretched onto a head). Named
business actors receive subtle breathing/head motion and nearby talking hand
gestures in the existing sync pass. These are procedural polish, not new
photographic faces or skeletal/motion-capture animation. No gameplay audio lines
are connected without the owner's recordings.

## Verification

209 Node tests pass, including all 15 operation chains reaching debrief and paying
once, locked progression, real boss-stage gates, failed/successful airborne kill
targets, exact-truck recovery, resource proximity, rotated vehicle overlaps,
water-only mooring search and mission resource/race waypoint generation.

A local DOM/source harness loaded actual game scripts, generated all seven
chapters and built the three-level mall. It measured a skylight top around 192
units, exercised lift cycles/boundaries, created Powell at the military-zone
route, started Four Shadows and spawned its first boss. This is not a rendered
visual/physical-device test. Deployed end-to-end play, all screen sizes,
multiplayer presentation and physical-phone FPS still need validation.

The refreshed iOS source ZIP includes the new code and portrait. A new signed
app release remains required for installed apps. The existing Next.js security
advisory is unrelated and remains outstanding.
