# Ronniebaby — original stylized character

`ronniebaby.glb` is an original static character asset, not a photoreal scan.
Y-up, +Z-forward, meters; feet at approximately Y0. Modeled loc strands,
separate fingers, facial features, olive shirt, dark denim, boots, shoulder bag,
strap and brass accessories. Embedded procedural skin/cotton/denim albedo plus
fine normal map. 53,528 triangles,10 material groups,~5.2MB uncompressed GLB.
Geometry batched by material; this expands vertex data to reduce draw submissions.

**Not rigged. No animations. Not connected to live NPC or mission logic.**
Do not attach it to every zombie/mobile crowd; start with one named NPC and test
performance/scale. Existing portraits and voice are unchanged. Textures are
original procedural surfaces, not photo-derived skin or a likeness guarantee.

Asset created for the Level29 owner. Original mesh/textures may be used/modified
for this project; no third-party character asset attribution required.

Reproduce with Python standard library:run `scripts/character-assets/create-ronnie.py`
then `scripts/character-assets/batch-ronnie.py`. Scripts stage files under
`/tmp/ronnie-asset`;copy output GLB here after validation.
