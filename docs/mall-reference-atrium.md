# Greentown Mall reference-inspired atrium

The existing three-level / 26-shop mall now takes its architectural palette from the supplied indoor-mall references: cream balcony fascias, silver posts and handrails, clear shop windows, dark/wood storefront sign bands, warm light strips, a tiled stone court, indoor planters, directories, and a wood-clad guest-services desk. A pitched clerestory skylight replaces the barrel-vault canopy.

The two existing stair ramps now have silver treads, black nosings and sloped black handrails for an escalator-like appearance. They remain **walkable stairs**, not automatic moving escalators. Lifts, floor elevations, doorway widths, shop identities, 29 Cuisine purchases, waterfall animation, and the third-floor parking skybridge are preserved. No real-world retailer logos or additional dynamic lights were added. This is procedural game architecture, not a photorealistic asset replacement.

`/game/mall-review.html` renders the actual mall and retail-prop builders in an isolated fixture scene, with atrium, upper gallery, escalator and overview cameras. It does not test the whole city, live NPC traffic, or phone performance. The playable launcher loads the same updated builder with a new cache key.

## Local checks

- `node --test tests/mall-*.test.cjs tests/source-integrity.test.cjs`: validates shop entrances, stairs, lifts, cafe purchase, waterfall animation, finite geometry, window fronts, skylight peak, clear landings and no grout spanning atrium voids.
- `pnpm build`: production build passes (repository configuration skips type validation).
- Broad regression run before the final seam regression: 753/756 pass. The three failures all require `public/game/models/characters/ronniebaby.glb`, which is absent from the base commit as well; no character assets are changed here.
