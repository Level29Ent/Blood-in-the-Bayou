# Dedicated cemetery, Natchez dock and bomber view

## Cemetery / dealership

The existing cemetery allocator protected only building footprints. A dealership
has a small showroom building and a much larger display lot; the old test could
therefore leave graves among cars. Reservation now includes complete downtown
activity lots, a 32-unit separation, roads/water and the Natchez pier. The whole
cemetery (graves, sign and new low perimeter fence) moves together. A front gap
remains open. Cemetery terrain is graded with the other foundations, and the
plot mesh uses the same elevation. Regular and pine trees are cleared.

This reuses the cemetery landmark rather than adding duplicate scattered tombs.
Plot allocation remains deterministic and reports an error if no dedicated plot
fits. Visual fencing is not a new navigation/collision system.

## Natchez waterfront

The previous dock builder rendered only posts, sign and a cylinder/head captain.
It now builds a continuous wooden deck and a full game-character captain, with
his feet at deck height. A dedicated pier parcel excludes building relocation,
cemetery placement, scenic-road detours and late vegetation; the final terrain
pass keeps its tiles walkable as bridge tiles at dock elevation. Existing
captain/boat job coordinates and interactions are retained.

## Airport .50-cal ride

The old bomber mesh used Y=150, but the player/camera still used the walking
camera. Tracers also started at a fixed Y=145 regardless of terrain.

A single flight altitude now clears the sampled orbit terrain and nearby
buildings (including hospital/residence height). Plane, gunner camera and tracer
origins use that altitude; tracer endpoints use the local ground height. The
late camera hook bypasses walking-height offsets only while the bomber is
active and looks down toward the ground ahead. Normal weapon fire is suppressed
while the .50-cal ride owns shooting; normal camera/weapon behavior resumes on
landing. Landing clears velocity/held fire and snaps the ground camera. The ride
is solo-only rather than sending ground-level passenger snapshots to a shared
multiplayer world. The existing cost/duration/bounty remain unchanged.

## Checks and limits

150 Node regressions, web production build, TypeScript no-emit and iOS staging/
archive generation pass. Focused tests cover whole-lot cemetery clearance,
blocked-tile relocation, dock/NPC deck geometry, late vegetation/grid cleanup,
terrain/building flight clearance, camera restore and tracer elevations.

These checks do not prove the exact screenshot view is visually correct. Native
Xcode compilation, physical-device performance and the complete in-game ride
remain unverified until exercised. The updated iOS source ZIP still needs a new
signed release to reach installed apps. The existing Next.js security advisory
is unrelated and still needs a separate upgrade.
