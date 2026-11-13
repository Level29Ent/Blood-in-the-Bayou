# Triple sidewalk audience and improved NPC appearance

## Sidewalk audience

The requested maximum rises from 128 to **384** spectators (3×), separate from the existing 330 marcher slots. Placement fills both sides along the route before adding up to three ranks, with a curb inset, 13-unit minimum separation, a spatial occupancy index, corner/footprint checks, and explicit sidewalk/plaza-only tiles. Roads, water, lawns, buildings and blocked points are rejected. A 1056-unit, 52-unit-deep sidewalk fixture fits exactly 384 versus the prior 128 requested cap; a short, narrow or obstructed route may safely fit fewer.

Spectators face the parade with varied waving, clapping, dancing and watching poses. Their reactions do not move their world position into the road. Nearby spectators receive up to 384 reserved render slots, then marchers up to 330, then up to 54 background residents: total bound 768. This prevents the prior 384 total crowd cap from silently discarding most of the new audience. No mission/enemy population, economy, saves, or collision rules change.

## More convincing NPCs

The shared close-up humanoid rig uses PBR skin/cloth roughness and subtle micro-surface shading; anatomical hands replace plain hand ellipsoids. Existing facial parts, named skin/outfit/hair colors, animation joints, zombie eyes, helmets, ragdolls, and Ronnie's GLB fallback hooks remain.

The batched civilian/parade renderer gets a modeled jaw/neck, ears, nose, eyes/brows/lips, hair variations, shaped clothing with pockets/hem, knees, hand forms and rounded shoes/soles. The added pieces are merged with vertex colors into the existing **nine instanced batches**, not hundreds of separate skeletal rigs. Small textures and hand/seam geometry are shared. Non-humanoid creatures and independently authored special models are not replaced.

There is no usable general crowd GLB in the repository: the characters folder has only the Ronnie model README, while portrait references are images. This is original procedural art moving toward the reference-model look, not a conversion of portraits into 3D, not scanned faces, and not a claim that every NPC is now a GLB. Existing six-batch distant zombie renderer is unchanged.

## Checks

44 focused tests pass, covering an exact 128→384 audience fixture, no overlap/road incursions, blocked-site rejection, reaction transforms, 714 actors within nine batches, finite matrices, PBR rig/color/eye preservation, shared hand resources, all prologue stages and source integrity. Full suite: 722/725 pass; the same three asset tests require the base repository's missing `public/game/models/characters/ronniebaby.glb`. Build/typecheck and browser evidence are recorded on the PR.

The existing `/game/interior-parade-review.html` now has the production 384-spectator formation and an NPC CLOSE-UP view. It is an isolated component viewer, not a phone performance benchmark or proof of every in-city placement. Installed iOS builds still need the normal signed-release process.
