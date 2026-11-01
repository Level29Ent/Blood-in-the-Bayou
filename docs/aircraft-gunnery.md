# B-29 gunner ride: aimed shots, 29 seconds, wider orbit

## Corrected cause

The previous fire loop chose the closest alive zombie within 460 ground units
and called killZombie directly. It did not use the camera, crosshair, visibility
or line of sight. The previous camera also ignored mouse/touch/stick aim changes.

## New behavior

- A **29-second** ride (not 13) on a **900-unit radius** orbit (formerly 440).
  Center clamping keeps the wider path within map bounds. Altitude is calculated
  over the wider orbit. Time/progress use elapsed time, with non-play pauses
  excluded, rather than shortening/lengthening with simulation frame rate.
- Mouse look, touch dragging and controller right stick steer the gunner's
  crosshair relative to the moving aircraft. Aim stays downward within safe
  pitch limits. The exact same camera pose is used before shots and rendering.
- A Three.js ray through the center crosshair must intersect a currently
  rendered, visible, alive zombie mesh within culling/fog limits. No mesh under
  the ray means a miss: nearby/offscreen/hidden zombies are not selected.
- Terrain and conservative world-space bounds for buildings, trees, rocks and
  vehicles stop the shot. A hit behind an obstacle cannot damage a zombie.
  These bounds deliberately do not implement shooting through windows/doors.
- Tracers end at the first obstacle or actual mesh hit, with a small camera-local
  muzzle offset for visibility. No random tracer to a nearby enemy.
- Hits apply 35 damage through existing HP/armor behavior. Kill/bounty count only
  increments after the hit actually kills the zombie. No automatic proximity
  kill, reward for a miss or duplicate reward for a dead target.
- Mouse/Space/FIRE/controller trigger all use this path. The ordinary held gun
  and car dashboard are hidden only during the ride; normal aiming/model/weapon
  behavior resumes on landing. The ride remains solo-only and costs $2,900 game
  cash with the existing $15 bounty per confirmed kill.

Airport sign and terminal description now say 29 seconds. The local dock-safe
zone no longer pushes ground targets away merely because the aircraft crosses
that area. Existing spawn population caps are retained.

## Verification

190 Node tests pass. New tests cover misses, off-ray/hidden/dead targets, nearest
ray hit, building/terrain obstruction, finite range, wider bounded orbit, aim
input, exact active duration, pause handling and controller fire. Integration
checks construct a real Three.js zombie mesh and verify damage/death/bounty only
on its visible center-ray intersection.

A separate local DOM/game-script harness started the actual ride on the real
map: 29 seconds, radius 900, flight altitude 480, camera altitude 470, unchanged
$2,900 cost. Aim input moved the camera direction and a point on its shot ray
projected to the exact center of the screen. This is not a rendered screenshot.

Web production build, no-emit types and iOS archive/sync are checked. Native
Xcode/device behavior, visual readability and physical-phone FPS still require
in-game verification. The existing Next.js security advisory remains unresolved.
The updated iOS source ZIP requires a new signed app release for installed apps.
