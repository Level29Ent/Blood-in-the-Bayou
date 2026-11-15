# Night visitor appearance refresh

Use the supplied alien references as anatomical/material direction: oversized sloping skulls, dark inset eyes, brow ridges, cheek planes, nasal slits, narrow lips/chin, long necks/clavicles, thin bent limbs with joints, three fingers plus opposed thumb on each hand, and three-toed feet. Four existing friendly defenders now have slate, sand, sage, and dark ribbed appearances; sand/sage head proportions differ subtly. The dark original night-guardian interpretation adds an elongated rear dome, chest/back ribs, dorsal tubes and a short segmented tail. It is not a ripped film model or a claim of photographic quality.

## Runtime contract

The exact four existing UFO allies are restyled; no extra enemies, spawn waves or population. They remain friendly guards. Their existing root translation/rotation, landing, targeting/line-of-sight, fire cadence, damage/kill attribution, gun/muzzle anchors, flashes and two-vertex tracers remain. Right hand is posed around the existing gun. No new skeletal walk/facial animation, rig, tail animation, attacks, voice recordings, collision rules or story content. UFO craft and 21:00–midnight event timing remain unchanged.

## Resource policy

One shared sphere/cylinder/cube kit per encounter, seven instanced material/geometry groups per body, and one shared deterministic 64×64 mottled skin texture used across color/bump surfaces. Eye reflections are small colored meshes and standard material response, not new lights. Skin has subtle bump/roughness; dark guardian is glossier. Approximately 16,824–21,600 source triangles per body before runtime culling; this is not a measured FPS/GPU claim. No external assets, dependencies, network requests or new production timers. Model kit is recreated only with the existing encounter-model lifecycle, and its texture is disposed exactly once alongside geometry/materials on city reset. Global mutable geometry caches are avoided because the encounter's reset owns disposal.

## Review and checks

`/game/alien-review.html` uses the actual production `makeModels()` builder with lineup, each variant and profile views. Clearly labeled static scene; no full-city combat or device-performance claim.

Tests cover all four finite bounded variants, instancing/shared geometry/skin texture, no real lights, clear original gun/flash/tracer interface, nightly gate/horde budgets/exclusions and a VM encounter exercising landing, guard firing/kills, cleanup, and one-time shared-texture disposal on city reset. Daytime and multiplayer remain inactive. Existing source parsing/loader checks remain. Build/full-suite results and deployed-preview status are recorded in the PR; full-city rendered appearances and physical-mobile performance require preview/device verification.

No player/save data or account/deployment settings changed.
