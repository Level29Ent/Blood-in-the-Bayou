# Three-block Mardi Gras circuit and city celebration

The prologue previously marched out along one path and then retraced it. It also
stopped the festival at story checkpoint 7, even while the city was peaceful.

## Route and procession

`mardi-gras-city.js` examines the existing road grid for a rectangular perimeter
around three adjacent blocks (3×1 or 1×3). It samples every 32-unit edge against
both the actual road/bridge tiles and the shared walkable navigation mask.
Candidates with blocked segments are rejected; nearest valid circuit within
2,600 units of the original festival anchor wins. The returned path has four
turns, unique cells, and a cardinal final-to-first edge, not a duplicated return
leg. It starts at the nearest cell to the original festival area. No roads,
water, doors, collision or mission placements are repainted.

If a generated/custom map has no safe eligible circuit, the original validated
path is retained rather than crashing story startup or forcing actors through
buildings. The runtime exposes `level29Prologue.festivalRoute` with blocks,
closedLoop and length so this fallback is distinguishable; it must not be
reported as a guaranteed three-block circuit on every modified map.

Five existing floats and their marching units are spaced by one fifth of the
actual loop length instead of fixed 220-unit offsets. Existing cross-section
formation/floatClear checks still suppress ranks/floats in narrow or obstructed
street sections. Ahmad keeps using the same moving route/mission target, so
Find Ahmad and phone-return objectives follow him normally.

## Citywide celebration

- Spectator planning now supports a genuine loop rather than discarding its
  second half as though it were an out-and-back. Up to 640 sidewalk spectators
  are planned across all four sides; existing walkability, separation and
  clearance checks remain. Visible crowd stays bounded to the existing 768
  instanced actor capacity (nearest 384 spectators + up to 330 marchers + spare
  capacity for city residents), not 640 independent character meshes.
- Up to 180 elevated purple/green/gold balcony banners on ordinary scenery
  across the city, plus bounded overhead route pennants. No fixtures at ground
  level, new blockers, dynamic lights or transparent render targets. Uploaded
  models, enterable venues and special landmarks are excluded. Terrain height
  is applied once. Shared geometry/materials use at most six extra instance
  draws. Owned resources are removed by the existing prologue cleanup.
- Existing waiting civilians can wave, clap or dance during the celebration.
  Walkers retain their street movement; no forced teleport or crowd collision
  rewrite. The five distinct floats and bounded confetti are reused.
- Parade music proximity follows the route rather than only the old starting
  point. The original synthesized beat gains quiet brass harmony and drum accents; audio/mute ownership remains;
  no new licensed music or recorded crowd audio is claimed.
- Decorations, floats, parade crowd and confetti remain active throughout the
  peaceful prologue (including later errands), then stop at the outbreak.
  Escort, dialogue, saved stage, cutscenes and original campaign handoff remain.

## Verification and limits

Tests cover three-block dimensions, cardinal closure/no retrace, blocked-route
alternatives, disconnected-map fallback, spectators on every side, finite and
bounded decor/terrain transforms, unchanged map data, production director route
selection, later-story celebration and outbreak/rebuild cleanup. Existing full
prologue progression tests remain.

`/game/mardi-gras-review.html` renders the production route planner, formations,
float models, crowd and decor on a synthetic street grid, with overview/street
and outbreak controls. It is not full-city placement or performance evidence.
Exact preview/test results are recorded in the PR. Full generated-city route
acceptance and mobile endurance still need real gameplay verification. Existing
legacy standalone launcher/native archive are not regenerated.

Spectator animation updates existing records instead of cloning hundreds per
frame, and crowd posing reuses identity profiles already carried by actors.
