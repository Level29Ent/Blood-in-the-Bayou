# Road support repair / 29 Zoo / subway / Sunset Beach

## Confirmed source defects fixed
- Car terrain pitch previously sampled across a40-unit elevated-deck boundary.
  Center on deck but one axle outside it could produce a steep tilt on a flat
  surface. Reject height samples differing by more than12 from center rather
  than treating that different level as a ramp. Whole-chassis support validation
  checks9 rotated hull points after boat/interstate movement; rollback/cancel
  speed if a corner is unsupported. Ordinary street vehicles skip this extra
  sampling. Unsafe restored/spawned elevated AI cars are retired without reward.
- Boat-water checks now include rotated hull corners AND center at final build
  and periodically for all boat sources, not ambient boats only. Invalid boats
  relocate to actual clear water or disappear if none available. Driven boats
  retain last safe water position and stop instead of landing on roads. Existing
  waterSpot uses axis-aligned clearance when relocating and sets angle0 to match.
  No removal of real moored boats simply to hide them.
- Weather low-quality check used obsolete l29_gfx_quality key while menu/default
  uses level29Graphics.quality / level29.graphics.stage1. Align that lookup.
- Volumetric and ripple shaders precompile once per scene after quality selection,
  before dawn makes them visible. Low still bypasses. Test proves repeated update
  does not repeat compile. This shifts first-use shader work off the first
  twilight visibility; it is NOT a Safari FPS profile or promise every lag fixed.
- Park ride uses real pause state while simulation wrapper runs; previous custom
  state did not fully stop base AI simulation. Other ride behavior unchanged.

## Zoo
704×640 world units, same area as29 Land. Selected building/road-clear added-land
parcel at3584,5248. North gate avoids elevated interstate edge; continuous low-level
walking approach to existing road. Original stylized procedural animal models:
elephants,giraffes,zebras,lions,bears,penguins,flamingos,alligators (two each),
three uniformed keepers. Eight labeled solid enclosures and a safe central aisle,
fences and entrance signage. Animals move inside bounded displays; not full
animal ecology or feeding/minigame system. No zombie spawns anywhere in entire
zoo footprint, padded movement rejection even through human gate, existing
intruders removed WITHOUT kill reward. No edits to network-authoritative remote
players. Not a universal gunfire immunity bubble or NPC restaurant economy.

## Metro
Three new connected entry points:Decatur Central,Greentown Mall,29 Zoo/Beach.
U/touch enters an underground platform; E/touch opens destination menu. Free
18-active-second journey: camera inside modeled carriage with windows/seats,
passing tunnel markers; arrival leaves player on destination platform, U at exit
returns to that destination's street entrance. Actual inter-location transport,
not just a destination text teleport: moving journey is shown before arrival.
The station interior is reused, not continuous world-spanning track/tunnel or
physical train rigidbody. Previous Decatur static station remains independently
available. Single-player travel; multiplayer boarding disabled.

Walking is possible on safe underground platform; boundary and track edge solid.
Gun hidden/fire blocked, ambient spawning/mission progression suppressed below;
base water damage excludes subway. Journey freezes regular simulation while own
clock runs; pause suspends trip. UI events stopPropagation; no real fare/payment.

## Opposite-coast beach
29 Sunset Beach at4608,5600,south of north-coast29 Land. Sand704×320 with designated
swimmable coastal-water strip (bounded, not whole ocean),10 umbrellas/towels,
two lifeguard huts, five animated foam/surf bands, four visible modeled sharks.
Hut/pole collision, warning sign/map marker. Swimmers can enter AND return to
shore; bobbed lowered camera. Existing per-frame base water injury is disabled
only in this designated swim zone, not elsewhere. Shark proximity can inflict18
health every2active seconds, clear warning. Sharks aren't a player-kill reward,
full hunting AI or rescue-service simulation. Waves are lightweight animated
surf meshes, not full ocean fluid simulation. Beach and zoo avoid existing
businesses/base; access paths clear props and keep roads intact.

## Evidence / limits
Focused tests:deck/ramp support,rotated water hull/center,8animal silhouettes,
padded safe bounds,18s timer precision. Full-launcher local scene checks all7
chapter starts,area equality,player gate pass/zombie block and spawn rejection,
all3station entry/platform/return elevations,35path-cell clearance and actual
walk from sand into water and back. No claim every road or every game bug fixed.
Full suite/build/TypeScript/native ZIP plus deployed preview evidence recorded
in PR. GPU showroom uses exact destination/transit modules with small fixture
world; keeper rig replaced by empty group there, so NOT keeper visual proof.
Full-city and physical-device frame/encounter/swim playtesting still required.
