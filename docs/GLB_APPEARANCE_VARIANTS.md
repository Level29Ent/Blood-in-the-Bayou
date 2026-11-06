# GLB appearance variants

Ten existing model shapes support four material schemes each (40 combinations):

| Base model | Schemes |
| --- | --- |
| pickup, box-truck, wreck | original, burgundy-street, blue-fleet, olive-utility |
| apartment, abandoned, warehouse, modern-house, wooden-house, upload-2cd, upload-bf86 | original, warm-sandstone, cool-slate, sage-courtyard |

These are appearance variants of the supplied models, not new vehicle body designs, new physics classes, or recovered texture maps. The models retain original geometry, UVs, texture images, scale, entrances and colliders. Tint multiplies the original color and texture: a red brick source will not become white stucco. A single baked material cannot isolate painted panels from every window; named glass, tire, wheel and light materials and transparent materials are excluded from recoloring.

The imported building placements choose a stable scheme from their map coordinate. Pickup and truck instances choose from identity/spawn data; scrapyard wrecks use three different finishes. Detail and distant building models receive the same scheme. Original-source templates are immutable. Each instance shares geometry and textures but owns its cloned materials. Those clones are released on eviction, world teardown and detached traffic cleanup. Resident model budgets are unchanged.

## Review

Open `/game/upload-placement-review.html`. Choose a model, then an appearance variant. This isolated review is not proof that all in-world transitions run smoothly. Static source models remain static; vehicle colliders and handling are unchanged.

## Standalone GLB files

Run:

```sh
node scripts/assets/export-appearance-variants.cjs /path/to/output
```

This writes 40 standalone GLBs, a manifest and README for use in external editors. Each copy retains embedded image/binary data and carries its scheme in GLB extras. Source axes remain unchanged; use the existing `PLACEMENTS`/`fit` adapter in the game. Runtime does **not** load these duplicated copies; it applies equivalent material changes to the cached optimized base models.

The iOS source archive is refreshed with the same runtime logic. A signed app rebuild is still required. No frame-rate or crash-free guarantee is implied.
