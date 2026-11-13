# Long-haired women and African American NPCs with locs

The authored civilian cast now includes long-haired women and African American men and women with loc hairstyles. Women retain bob, ponytail, bun and natural variants and gain flowing long hair, shoulder-length locs, long locs and tied-back locs. Men retain their earlier styles and gain short, shoulder-length, long and tied-back locs. The loc-character profiles intentionally represent African American residents with three varied skin tones and dark hair finishes; this is authored character data, not ethnicity inferred from a photo, name, or hair.

Profiles are deterministic and used by everyday prologue residents, parade marchers and the 384-slot sidewalk audience. They preserve the mixed cast, crowd capacity, reactions, navigation, story and save behavior. Hair does not change with camera distance or animation. Long hair drapes behind the head/shoulders; separated loc strands use the existing instanced hair batch with a bounded 24 hair instances per actor. The renderer remains nine batches.

Business customers use the same character profiles before their visual geometry is merged. Women have the existing rig styling; men and women with locs receive shared strand geometry, and their authored skin/hair colors survive reassignment to another shop. Special named NPCs, rescue scripts and zombies are not re-authored. No additional NPC population, missions, prices, dialogue or external downloads.

These are original stylized procedural models, not GLB scans or portrait-to-3D conversions. The dedicated LONG HAIR / LOCS component view at `/game/interior-parade-review.html` shows both men and women alongside the production mixed-crowd formation.

## Checks

21 focused checks pass, including representation and varied loc lengths/skin tones, all 768 actor transforms staying within nine batches and hair capacity, finite animation, preserved face visibility, shared customer resources/idempotence, earlier women profiles, audience placement and complete prologue progression. Broader checks, production build/typecheck and deployed browser evidence are recorded on the PR. Phone FPS and every in-city placement are not inferred from the component viewer. Installed iOS apps need a new signed build through the existing release workflow.
