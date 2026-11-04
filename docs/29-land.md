# 29 Land — waterfront theme park

Replaces the old Santa Monica tourist-attraction pier, not the working Bayou
marina/fishing pier or Natchez docks. The old reserved rectangle is704×320 world
units. New park is704×640: exactly2× its reserved area (not2× both dimensions).
Because later buildings overlap the original tourist-pier parcel, choose the
nearest clear waterfront rectangle with no roads or protected buildings, and
build a three-tile-wide boardwalk to existing low-elevation road. Current seven
chapter starts place the park at(544,224), boardwalk14 center cells. No businesses
are removed. Fallback retains old pier if a safe plot/route cannot be found.

## Attractions
- Bayou Viper — red tubular steel thrill coaster, taller hills/twisting course,
  ~1535 world-unit track,38-second full loop after boarding.
- Timber Run — shorter wooden family coaster, timber support/brace language,
  ~1312 world-unit track,27-second loop.
- Golden Carousel —10 bobbing modeled horses, rotating platform/canopy,20seconds.
- Sky29 — observation wheel,12 upright moving gondolas,32seconds.
- Neon Teacups — rotating platform and5 cup meshes,18seconds.
- Bayou Drop — tower and lifting/dropping seat row,20seconds.

Themed Bayou Adventure, Neon Midway and Family Carnival signage; entry arch,
lighting fixtures, benches, colored facades and boardwalk/pilings. Bayou Bites
and Midway Arcade are display facades here, not new vendors/minigames. Original
procedural stylized art, NOT copied Six Flags branding/assets or photoreal scans.

## Play
Map marker29. Walk the boardwalk through the entrance and approach a labeled
ride platform. E/ENTER or touch ride button boards free in solo play. Coasters
reset to start a full circuit; other rides join a running cycle. E/ENTER/EXIT
RIDE or Escape returns to exact boarding position; auto-return at duration.
Gameplay/missions freeze during ride, while park animation and ride timer run.
Gun view/shooting hidden/blocked, player remains logically at safe boarding point;
camera follows actual ride seat. Not a physics coaster simulation/player avatar
strapped to a dynamic rigid body. Multiplayer boarding intentionally disabled;
scenery still animates. Pause stops attraction time. Park walking collisions
cover outer fencing, central coaster envelopes and other ride/prop footprints.
Platforms stay outside those bounds and paths remain clear. Static world meshes
batched in local space, dynamic ride objects/gondolas excluded. No new per-frame
scene scan or per-ride point/shadow lights.

## Verification
Focused geometry tests check two distinct closed/in-bounds tracks,6 ride types,
finite moving world-space seat anchors, clear platform footprints, translated
park geometry and bounded scene size. Local full-launcher scene harness checks
all seven chapters get exactly doubled area without building overlap,14-cell
boardwalk clearance, clear six boarding points and board/exit round trips after
actual park assembly. Existing Greenmart/launcher integration remains passing.
Full Node tests/build/TypeScript/native archive and actual preview evidence are
reported in PR. Synthetic park preview shares the exact builder/animation at
/game/expansion-demo/29-land.html; it is not proof of full-city FPS or in-world
access. iOS source ZIP updated; installed app requires separate signed release.
