# Lived-in room details and conservative rendering optimization

## Confirmed launcher defect
The merged launcher reintroduced multiple copies of core/game/graphics scripts,
including audio.js (global `actx` redeclaration), Three, wrapper-based builders,
and many late modules. Remove duplicate external scripts by canonical path,
retaining the newest numeric cache version at the first dependency position.
Preserve unique expansion modules and owner inline raycaster patch. Existing
single-load/dependency/source-integrity regressions now pass again. This is a
reproduced startup error and redundant-wrapper source, not an assumed FPS result.

## Fixtures
Reusable stocked shelving (boxed products and front labels), drink-cooler frames
with bottled stock, checkout counter/register/display/card-reader details,
counter display racks, taped delivery boxes, bookshelves, mugs/paper/desk clutter,
safehouse rugs/wall shelves and self-lit tube accents. Shared surface materials
and existing procedural detail textures; original stylized procedural props,
NOT photoreal purchased/scanned assets or a new asset library.

New floor fixture reservations test building bounds, existing furniture, doorway,
service station and entrance aisle. Crowded rooms skip extra floor fixtures;
safehouses also get wall/tabletop accents. 19 mall bays get small registers on
existing rear counters; aquarium bays keep their animated tanks untouched.
Specialized bank/police/hospital/fish/snowball/multilevel builders aren't replaced.
No new full-room PointLights or bloom. Whole city/new collision furniture remains
existing gameplay, not universally reauthored interiors.

## Static room islands
Eligible simple rooms extract only opaque static leaf meshes strictly inside the
building and below its ceiling. Floors, walls, roofs, doors, interaction pads,
staff, animated/noBatch hierarchies, transparent glass, shaders and special room
layouts stay out. Material-identity buckets retain bump/roughness/texture variants
rather than merging superficially similar materials. Proper inverse root/world
matrix and normal transforms; mesh and instanced-mesh inputs supported. Position,
normal,UV and bounding volumes preserved; per-room128-unit buckets; output uses
frustumCulled=true. Source geometries/materials may be shared and are NOT disposed
on merge. No claim of vertex-memory reduction: output is expanded triangles.

Mark managed island meshes noBatch so the older whole-city batch doesn't steal
room contents and defeat culling. Existing environment batching remains; this
is finer room-granularity ownership, not one giant city merge.

Actual-launcher controlled scene:46managed room/bay islands,924source submissions
→393batch submissions including new furnishings (~57% fewer within this subset).
This is not a whole-city GPU draw count or frame-rate result. Dedicated fixture
benchmark shows real renderer.info counters with identical materials/triangles
in unbatched/batched modes, at /game/expansion-demo/interior-performance.html.

## Visibility / hidden surfaces
Per-camera render hook tests island AABB against camera frustum. Opaque simple
rooms hide ground-floor contents from behind the closed rear/side wall or above
roof; preserve inside/near-threshold views and front doorway portal. Glass/open
showroom and mall counters use conservative distance/frustum visibility instead
of opaque-wall hiding. Restore each island's visibility after EVERY draw, also
on exceptions, so main/rearview/SSAO passes do not pollute each other's state.
No per-frame full-scene raycasts, GPU readbacks or blanket wall hide. Not universal
Hi-Z occlusion queries or a guarantee every unseen mesh is never submitted: custom
rooms, transparent windows, shell/environment and dynamic props are deliberately
conservative to avoid disappearing interiors. Vulkan/WebGPU pipeline not added.

## Frame loop
Hidden documents skip simulation/audio/render and discard catch-up debt. All
browsers skip redundant rendered frames with no60Hz simulation step, not just
phones; pointer look still updates at sim-rate. Retain at most3fixed steps,
and stop catch-up once update work consumed8ms, carry at most1step debt. This
doesn't interrupt a single slow update mid-function, rewrite multiplayer protocol
or promise to eliminate physics costs. Existing audio/controls/ad hooks preserved.

## Verification
Tests verify reduced mesh submissions,transformed bounds/material distinction,
actor/glass exclusion,inside/front/back/roof/off-frustum visibility,per-camera
state/exception restoration,fixture collision reservations,hidden-tab/no-catchup
behavior,plus existing launcher/game regressions. Local launcher scene retains
Greenmart collision/lift/checkout behavior and verifies global batching doesn't
remove managed islands. Browser benchmark and full-city preview evidence in PR.
Physical Safari/phone FPS measurements and every shop entrance remain unverified.
