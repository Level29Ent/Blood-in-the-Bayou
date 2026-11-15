# Lived-in neighborhood detail pass

## What changes

Build on the existing residential reference exteriors rather than replacing the city again:

- Ordinary Decatur and original-infill homes receive four deterministic yard styles: porch gardens, fenced cottages, working-household recycling bins, and courtyard-style planters. Some have a parked decorative bicycle, a porch chair or apartment bench. Narrow geometric address plaques are derived from the original world coordinates, including when the parent model builds in local coordinates.
- Ordinary home and apartment side elevations gain framed sash windows and sills so they read better from side streets.
- Tremé shotgun facades retain all six palettes, roofs, shutters, porch steps and identity. Only two porch-edge flower pots and a house-number plaque are added. The center approach remains clear even on a 48-unit-wide fixture.
- Bayou Oaks retains its eight homes, street geometry, side-facing doors, driveways, sidewalk routes, terrain support and map positions. Flower beds and sparse short fence sections occupy the existing inter-house gaps. Geometry has no added collision, and explicit detail rectangles are tested against all drives, walks, road cells and house footprints. Existing <=16-batch and <500-instance fixture budget remains unchanged and passes by reusing materials and reducing repeated posts/plants.

These are scenery improvements, not new furniture interactions, bike riding pickups, functioning recycling, new apartments, residents, live gardening or walkable balconies. Previously solid houses remain solid. No new gameplay or mission rules, NPC population, traffic, collision, map tiles, player/campaign progress or save data changed.

## Placement and rendering

Ordinary detail layouts stay within existing plot bounds and exclude a 32-unit central approach. Tremé pots occupy its existing raised porch footprint rather than public paths. New props do not add road-side blockers. Most models are inside the existing solid residential collision envelope; this is decorative detail rather than expanded yard navigation.

One small shared geometry/material kit with instanced batches and original seven-segment number glyphs. No per-house canvas textures, external assets, new actual lights, dependencies, fetches or production animation timers. Bayou garden props reuse the prior palette. Per-home additional geometry is not a measured FPS or memory improvement; physical-device benchmarks remain unverified.

`neighborhood-exteriors-review.html` and `original-city-review.html` now load the shared detail kit before the actual home builder and show the production model changes. Existing review rooms are not proof of full-city paths or mission performance.

## Regression evidence

Tests cover all four yard styles, small/normal/apartment and narrow Tremé plots, central approach rectangles, deterministic address variation, finite bounded shared instance geometry without lights/textures, one-time model integration, original home identity and entries, correct startup/review dependency order, and Bayou path/drive/building exclusion without layout mutation. Existing home/road/riverboat/mission tests retained. Full test/build and deployment results recorded in PR. No rendered full-city/mobile check is claimed unless separately documented.
