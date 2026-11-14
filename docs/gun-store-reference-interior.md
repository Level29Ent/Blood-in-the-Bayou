# Reference-inspired gun-store interior

Gun stores retain their existing footprint, central entrance-to-dealer aisle, purchase menu, inventory and unlock rules. The nine featured displays still use the actual stripped first-person weapon clones from the arsenal factory, normalized to their case bounds.

The curated interior adds:
- Oak/slatboard wall galleries with horizontal detailed firearm models, mounting hooks and paper tags.
- Upright wooden long-gun racks with ammunition boxes below.
- Wood-base, metal-frame glass cases around the existing featured weapons, plus a rear handgun counter and register.
- Oak floorboards and self-lit fluorescent ceiling panels. At most two of the existing display spotlights activate on High while inside; none on Low, outside or paused.

Generic extra shelves/coolers and overlapping legacy back-wall placards are skipped for the curated armory only. All other shops retain their previous furnishing paths.

`/game/armory-review.html` is an isolated room using the production retail and showcase builders. Surrounding room services are fixtures and the featured case models fall back to simplified cosmetic stock silhouettes; the playable game continues to use its actual weapon models. This page is not evidence of full-city or phone performance.

Focused checks cover nine original model identities, glass cases, finite room-bounded geometry, a radius-ten central route and radius-thirteen dealer pad in 128×128, 192×160 and 256×224 stores, and visibility/quality/paused lighting limits. No weapon mechanics, ammunition quantities, prices or purchasing behavior are changed.


## Detailed firearm follow-up

`firearm-models.js` now replaces the box silhouettes with bevelled, material-batched gun templates: separate receivers/slides, recessed ejection ports and muzzle faces, open trigger guards, grip/stock profiles, vent slots, sight posts, magazine ribs, slide serrations, walnut furniture and scope lenses. Cosmetic dimensions are game art, not real-world manufacturing specifications.

The four previously basic held pistol/SMG/carbine/marksman models use these same templates, with the existing first-person-only arm rig attached separately. Existing M240 and held shotgun builders retain their established detailed appearance and animation hooks; the retail shotgun has a dedicated detailed pump-action template. Combat, muzzle/tracer coordinates, prices, inventory and unlocks are untouched.

Templates are created once per family and cloned with shared geometry/materials. Each has at most seven material meshes; focused checks enforce finite attributes and a 14,000-triangle ceiling per model. Static room batching remains responsible for store scenery. `/game/firearm-review.html` is a close-up of the actual shared templates and `/game/armory-review.html` checks them in the isolated shop. Neither verifies full-city gameplay or mobile performance. These are improved procedural models, not photogrammetry/scanned assets.
