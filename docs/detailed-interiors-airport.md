# Detailed mall/civic interiors and airport expansion

## Mall and shops

All twenty mall bays now use store-specific 3D merchandise/fixtures instead of
the old generic countertop stock blocks. Original meshes include upholstered
chairs/sofas, barber mirrors/tools, bicycle frame triangles/spokes/wheels,
mannequin outfits, layered shoes, book/magazine spines, toy cars/teddy figures,
coffee/food equipment, jewelry, balls, instruments and plant foliage. Shared
wood/fabric/metal/tile surface textures include normal and roughness maps through
the existing PBR helper. No new packages, downloaded art or second 3D engine.

Frame mullions, display glazing, cornices and directory kiosks distinguish
storefronts and add structural detail. Door gaps, side-stair routes, lifts and
upper-floor support remain intact. The existing food court and waterfall remain.
No new shopping inventory/ownership or mission reward mechanic is implied.

## Aquarium and live fish markets

Glowing-rim framed glass tanks include substrate and plants plus all five
requested species: spotted koi, goldfish with tail/fins, striped tall-finned
angelfish, segmented shrimp with legs/antennae, and snails with shell/feelers.
Fish swim/wag tails while shrimp/snails move slowly inside tank bounds. Dynamic
models are excluded from static batching, and nearby animations pause outside
play. Two tanks per fish-market gallery and two in the mall aquarium store.
No point-light-per-tank or extra bloom pass; illuminated rims remain readable.
These are original detailed stylized models, not photorealistic scanned assets.

## Bank

Replace the old box safe with a thick circular steel vault door, frame/body,
wheel/spokes, bolts/hinges and textured metal. Add sixteen deposit drawers and
teller monitors, keyboard, paperwork and dividers. Retain the counter/station
and robbery/operation mission data. The vault is decorative and solid, not a
new vault-opening or heist mechanic.

## Police

The rear secure holding room has solid walls and a locked iron bar front with
crossbars/lock. The full cell footprint blocks players. Exactly three animated
zombie figures pace inside: these are contained local captive actors, not the
combat `zombies` array. They cannot chase out, damage players, be cleared by
indoor spawn cleanup or produce kills/rewards. They use the same zombie rig.
This preserves police dispatch/staff and mission entry paths.

## Airport

Increase the reserved airstrip from 14×11 to 21×11 tiles (448×352 to 672×352
world units), exactly 1.5× **ground area**. This does not scale the whole city,
terminal building or flight durations, nor enlarge both axes by 1.5×. Allocation
reserves/grades the larger parcel before later zoning/amenity and road passes.

Keep the original parked jet and bomber; add two more parked Level 29 liveries,
Bayou Air and Gulf Express, with both-side branding, colored stripes and marked
apron stands. Total is four parked aircraft; the existing flying jet remains.
Plane meshes do not intersect one another or the terminal and stay clear of the
runway. New planes are scenery, not two new flyable vehicle types.

## Evidence

255 Node regressions pass. Coverage includes five distinct finite species,
bounded animation, textured/cached materials, props for all twenty stores,
three captive actors bounded inside cell, vault thickness/metal/station
preservation, four non-overlapping aircraft and both-side new-plane branding.
Existing stair/door/lift, mission, HUD and single-script tests remain passing.

Local actual-launcher DOM/Three checks traverse all twenty doors and both stairs
using the full collision wrapper stack, generate all seven chapters, find the
vault and all three captives behind a player-blocking cell (including a station
rotated 180 degrees), and verify fish-market gallery tank creation. These are
scene/source checks, not rendered WebGL screenshots or native-device benchmarks.
Production build and TypeScript no-emit pass. Native sync/archive, ZIP integrity
and exact updated-code parity pass. Installed iPhone apps need a signed update.
The existing Next.js security warning still recommends a separate upgrade.

Preview verification is recorded in the PR. No production merge/promotion by
this change, and no claim of verified photorealism or measured phone FPS.
