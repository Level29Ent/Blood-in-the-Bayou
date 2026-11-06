# Uploaded model placement and optimization

## Runtime placement
- Apartment: two existing apartment exteriors, preserving saved coordinates,
  collision rectangles and streamed interior access. Facade hidden during streamed interior.
- Abandoned brick building / warehouse: two ordinary scenery building footprints (or two safely allocated industrial scenery parcels when no unused shells remain),
  never active business/mission/zoo/farm/airport/base parcels.
- Modern and traditional wooden houses: two existing residential scenery homes.
- Rusted car: scrap-yard container stacks (existing collision footprint).
- Pickup: existing pickup vehicle cosmetic body only. Driving/collision unchanged.
- Rifle: existing M240 view model and armory stand; ammo, aiming and damage unchanged. Although the upload is named assault rifle, its rendered mesh is belt-fed with a bipod, so it is matched to M240 rather than changing carbine identity.
- Tank: safe motor-pool courtyard location if clearance test succeeds. Static prop,
  not a new drivable combat vehicle.
- King / armor: studio costume displays if safe placement succeeds, not replacement
  characters or rigged animated enemies.
- Wooden table: diner point if free of authored furniture/door/road.

Imported templates stream sequentially with global Low2/Medium4/High6 resident
models. Distant templates/clones are evicted and owned resources disposed. Original
procedural visuals remain as fallback; model positions/scales fitted inside existing
footprints. No eager loading of all uploads. New static props have solid rectangles.
Original uploads are preserved; generated optimized files under public/game/models/optimized.

## Optimization
Reproduce: install tool-only @gltf-transform/core/functions/extensions4.2.1, sharp,
meshoptimizer, assimpjs0.0.10 in an isolated directory; set ASSET_TOOLS to its
node_modules. Run scripts/assets/optimize-uploads.cjs then convert-fbx.cjs.
Mesh simplification constrained by .02/.025 error; textures capped512,embeddedWebP.
WebP reduces file/download size, NOT GPU block compression; no VRAM/FPS guarantee.
No remote author-machine image URLs fetched. Matched local basecolor/normal/packed
RM used where present. Assets lacking texture sets retain supplied material colors.
Report.json records actual achieved triangle/file sizes, not assumed targets.

## Not automatically placed
- Unnamed root FBX (tripo_convert_9102...): conversion produced 390138 triangles /
  19.4 MB despite simplification. No reliable identity; excluded from runtime.
- Road-segment FBX: optimized and reviewable, but not used to replace navigable roads;
  irregular generated road geometry would invalidate tested widths/elevations/collisions.
- Workshop, military gear/helicopter/off-road/truck, female/gangster/stadium/pistol
  folders contain textures without corresponding mesh at this revision. Cannot
  place those texture sets alone. No invented matching mesh or generic texture swap.

No rigging/animation is invented. No all-world photorealism/crash-free/60fps claim.
Native ZIP is refreshed using only runtime model folders; raw source uploads are excluded from the app bundle, but retained in Git. Device/endurance and in-world playtests
required before production. Test and exact-preview findings are in the PR.
