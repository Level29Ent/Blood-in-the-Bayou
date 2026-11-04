# Bomber routes and target readability
Six deterministic map-sized route layouts,random nonrepeating choice per ride,
random start phase.110-second circuit duration;regular29s/Powell60s duration
unchanged,so each flight visits part of circuit,not whole map in29seconds.
Waypoint legs connect through core/south/bayou/east districts;corners change
heading at waypoints,not banked spline flight. Roof/terrain clearance uses
current position and3-second lookahead,upward clearance immediate/downward eased.
Cannot claim all visual tree/building clipping eliminated without full flight.

Suppress business-entry title overlay while bomber ride active. Camera FOV58,
far plane2200;zombie horizontal cull1200 instead of470night/600day;extend fog
from camera hook. Existing gunnery exact mesh hit/cover/fog rules remain. Visible
markers for nearest up to12rendered/LOS-checked zombies,at most16candidate
raychecks per HUD render,none behind opaque world walls. Not aim snapping,
auto-hit/no-miss kills or ground-only birds. Skyline high altitude still makes
people small;markers aid visibility,not photoreal soldier model work.

The earlier UE5-inspired update was partial material/shading code on legacy map.
It was replaced during restored expanded-map integration by that world's existing
PBR/cinematic/water pipeline. Full-place photoreal assets weren't delivered;
RonniebabyGLB remains separate static/unrigged asset,not live animated replacement.
This patch doesn't pretend to finish that overhaul or include new native signing.

361Node tests pass including6distinct in-bounds closed routes,no-repeat choice,
roof clearance,preserved29active-second/pause behavior and missed/blocked-shot
no-kill regressions. Build/TypeScript pass after local platform binary refresh.
Native full archive regeneration blocked:tracked native source lacks ios platform;
patch existing ZIP's targeted www flight files and integrity check only. Browser
flight tests/terrain clearance long-session and physical Safari FPS unverified.
