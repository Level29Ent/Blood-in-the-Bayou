# Character materials and third-person recovery

## Materials

The current `/game/index.html` launcher loads a single shared character finish
module after the existing factories. It wraps human/zombie construction, remote
jesters, named business actors, wardrobe attachments, instanced Tremé crowds,
uploaded static NPCs and the recovered animated player. Named identity/outfit
color setters retain their material color references. No per-frame city scan,
new renderer, light or render target is added.

- Human skin: MeshPhysicalMaterial, roughness .45, clearcoat .12, thickness .4,
  warm amber attenuation metadata and a restrained warm-wrap shader.
- Infected skin: muted olive attenuation, shared procedural vein/blemish bump
  texture, wet patches near .3 and dry patches .85, normal-detail crevice shading
  and dark socket geometry on the procedural infected rig.
- Fabric: nonmetallic physical material (a Standard extension), .85–.95 final
  roughness, shared micro-weave bump/roughness detail, sheen .35. Existing normal
  and authored bump maps are retained. Metallic named accessories/buckles/brass
  use .85 metalness/.25 roughness; leather is not arbitrarily made metallic.
- The bounded cubic Fresnel rim follows the existing sun/moon color. Authored
  unlit eyes/signs and transparent hair remain authored rather than being made
  opaque or lit. Material arrays and previous compile hooks/cache keys survive.
- All upgraded mesh parts cast/receive shadows; rendering still respects the
  game's quality/mobile shadow budget. This does not force shadow-map allocation
  on Low/mobile. Skinned meshes are not incorrectly culled at their bind origin.

**Scattering limit:** Three r149 thickness/attenuation only affect volume
transmission, not opaque skin SSS by themselves. Transmission stays zero to
avoid glass skin/extra screen targets. The visible approximation is a small
warm light-wrap contribution, not true volumetric/path-traced subsurface
scattering. Existing mapped static uploads without semantic surface names or
bones keep their baked PBR texture/scalars and gain the rim; their skin and
clothing cannot be reliably separated from a single atlas without authored
masks. The animated player uses a bone-weight skin mask for head/neck/hands/
forearms, with cloth elsewhere; this is an approximation at sleeve boundaries.
Skinning/morph/project vertex chunks and skeletons remain intact.

## Third person

Recovered `models/Ronniebaby_character.glb` unchanged from PR #298 (19 clips).
Actual hip translations demonstrate that `shoot` crouches to approximately
0.152, while `fire` stays above 0.508 (walk around 0.480–0.500). The new driver
uses `fire`, with idle/walk/run actions, cloned in-place clips and a normalised
23-unit model. It preserves vertical clip motion rather than falsifying the
kneel by moving the whole character upward.

The existing `third-person.js` remains the sole toggle/collision-camera owner:
no second key listener, camera override or persistent hiding of viewmodel
children. The animated model loads only when third person becomes active;
the wardrobe avatar stays until loading succeeds, and remains the failure
fallback. Scene changes, pause, respawn, jumping and special-camera fallback
retain their owners. A cosmetic held-weapon clone attaches to the right hand;
weapon grip alignment needs visual checking across the full arsenal. Wardrobe
clothing changes still apply to the procedural fallback, not the baked GLB
texture. Combat projectile origins/damage/ammo are unchanged.

## Merge scope and validation

PR #298 diverged from main at `6518b941`. A read-only merge analysis found 113
conflicts, including dependencies, gameplay and the downloadable iOS archive.
This focused recovery is based on current main and does not discard or overwrite
that branch. The full #298 merge still needs a choice about reconciling its
other features versus prioritising main. It is not safe to claim those unrelated
conflicts have been resolved by this recovery.

Node tests exercise actual clip hip data, in-place motion, factory coverage,
material fields, cache/hook chaining, skeleton/morph preservation, attribute
masks, asynchronous fallback, camera ownership and scene/respawn lifecycle.
The `/game/character-materials-review.html` fixture exercises the real shaders
and actual animated GLB with dusk/moon controls; it is not a full-city benchmark.
Final check and preview results are recorded in the PR. The old standalone
`public/index.html` and existing native download ZIP remain unchanged. The
native staging script includes the recovered model for the next explicit
native sync/build; no signed iOS release is produced here.
