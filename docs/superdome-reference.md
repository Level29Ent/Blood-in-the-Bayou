# Superdome reference exterior

Original procedural art based on the supplied exterior photographs: a shallow ivory roof, continuous bronze/gold aluminum crown, inward-sloping skirt, fine vertical panel seams, thin coping, dark recessed entrance ribbon and four stepped entrances. Mounted SUPERDOME lettering replaces the floating duplicate. Existing unsponsored place name retained; no photograph textures or official logo assets copied.

The shared builder is used by both web launchers. It scales within the existing 256 × 256 downtown parcel; no map, collision, story pickup, route, stadium-interior or event/crowd changes. The dome remains non-enterable. Native bundles are not regenerated.

Purple/green/gold architectural washes use one emissive texture, switched by the existing renderer's night mode. They are surface art, not additional scene lights or animated projections. Instanced entrance details, four canvas textures (at most 1024 × 512), no new dependencies, render loop or per-frame allocations.

`/game/superdome-review.html` shows the exact production builder at parcel size with elevated/street cameras and day/night lighting. This isolates exterior rendering; it does not prove full-city traversal, mission completion or mobile performance.

Focused checks: `node --test tests/superdome-reference.test.cjs tests/treme-landmarks.test.cjs tests/anthony-story.test.cjs tests/boxing-gym-interior.test.cjs` cover silhouette, bounds, draw batches, no extra lights, reversible lighting, launcher integration, texture setup and existing placement/story/boxing behavior.
