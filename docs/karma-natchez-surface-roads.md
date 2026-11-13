# Karma, Natchez and surface roads

These changes target **Blood in the Bayou**, not Crescent City Kingpin.

## Karma

A new free public Karma dispensary is placed on a clear, flat parcel with a walkable street approach. It does not replace Elevated Melanin. Its map blip is K. Walk through the central doorway; U at the rear counter displays a welcome. There is no new drug inventory, purchase economy or property fee.

The stylized interior follows the reference photographs: black walls/ceiling, pale veined tile, black-framed glass display cabinets, wall shelves, timber product cubbies and rear slat wall, green Karma mats, ceiling panels and skeleton decorations. The rear panel door is decorative. Cabinet and wall collision leave a continuous centre aisle; the roof remains independently hideable. Models and textures are locally generated, not embedded photos.

## Natchez cause and repair

The casino exterior has a translated, half-turned root. `batchStatic` bakes world-space matrices into geometry, then attaches that geometry under the same root. This applied the boat transform twice to hull, galleries and chimneys, but not the excluded animated paddlewheel, leaving the body displaced from the wheel and boarding landing. The exterior now neutralizes its root while baking and restores it afterward. A regression invokes the actual production batcher and verifies identical world bounds and wheel position before/after batching, plus a downward hull raycast.

## Roads

The former interstate loop and links are now at ground level, with centre/edge paint and roadside destination signs. Elevated highway barriers, pillars, overhead gantries and interstate exit signs are removed. Existing loop connectivity, exit routes and water-crossing road tiles remain. Ambient loop traffic uses a lower street target speed. Existing height-provider names remain for compatibility with other modules and saved world coordinates. Existing saves regenerate scenery; old elevated vehicle positions are not explicitly migrated.

## Checks

25 focused tests pass for Karma geometry/registration/clear aisle, production Natchez batching, road support and source integrity. The broader suite passes 712 of 715 tests; the other three require `public/game/models/characters/ronniebaby.glb`, which is absent from the base repository. Production Next build succeeds. Browser evidence is recorded on the PR.

`/game/karma-waterfront-review.html` uses the production Karma and Natchez models and road height provider in an isolated component viewer. It is not full-game walking/driving/boarding acceptance. The existing iOS packaging script copies current public/game; installed iOS apps still require a new signed build.
