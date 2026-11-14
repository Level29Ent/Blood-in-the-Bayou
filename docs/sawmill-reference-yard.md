# Blackwater Sawmill reference yard

The existing BLACKWATER SAWMILL & FISHERY business parcel now renders as an open-air timber yard inspired by the supplied mill photographs. It does not expand its 224 × 192 lot or consume adjacent roads/terrain.

Four dense stacks contain 60 tapered/stacked logs including loose foreground pieces. Original local canvas artwork supplies bark ridges/knots, pale end-grain growth rings/cracks and muddy ground with wheel ruts. Two timber-clad processing sheds have red pitched corrugated-style roofs, roller tables and sawn boards. A green edge conveyor, bundled lumber, steel overhead truss gantry with hoist cables and extraction tower/ladder complete the processing area. Machinery is static decor, not a new logging/production simulation.

The special builder replaces the generic enclosed business shell, rather than burying a log yard inside the old shop. A low industrial fence traces the existing collision perimeter and its 54-unit entrance. The existing service/door coordinates, business identity, Southern services, contracts and survival-site mapping are unchanged. A foreman stands in the rear aisle. Sheds, piles, conveyor, crane feet and bundles have conservative solid footprints; the central haul/service lane remains open. This is pedestrian service access, not new truck-driving entry or a relocated map district.

The override runs after frontage and before build-once; it applies the canonical-to-world rotation to the whole yard and furniture once while preserving live service coordinates. The later Southern detail pass skips legacy sawmill props. Generic room stock/clutter/finish passes skip referenceSawmill venues.

Geometry repeats through instanced batches (under 32 tested draws), four 256-square procedural textures and no external assets/lights/network downloads. No device memory/frame-rate guarantee. `/game/sawmill-review.html` uses the actual yard builder, without surrounding city terrain, foreman or contract UI.

Checks: `node --test tests/sawmill-yard.test.cjs tests/southern-noir.test.cjs tests/source-integrity.test.cjs`. Covers clear central lane, player service reachability, parcel bounds, log/end counts, finite translated matrices, draw budgets, all four frontage orientations, preserving station/door identity, no duplicate build and script/legacy-prop ordering. Build, broad-suite and preview findings are recorded in the PR/task summary.
