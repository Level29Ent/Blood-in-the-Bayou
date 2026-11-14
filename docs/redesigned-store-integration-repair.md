# Restored redesigned-interior integrations

## Causes and repairs

Several merged interiors existed as standalone builders but were not connected to the live mall. The launcher omitted toy, shoe, cosmetics, camera, pharmacy, homewares and book modules; the display router fell through to generic props; original wall-wide counters remained; authored-model solids/visibility were not registered. The bakery builder existed but was also absent from the display router.

- Restore exact tenant routes for TOY STORE, SHOE STORE, COSMETICS STORE, CAMERA SHOP, CRESCENT PHARMACY, HOMEWARES STORE, BOOK STORE and CRESCENT BAKERY.
- Load all redesigned mall dependencies exactly once before the display router in both production and mall-review launchers. Preserve existing furniture, plant, jewelry, sports, record, game, barber, bicycle and aquarium integrations.
- Remove obsolete default counters only in authored tenants. Register returned collider lists and roots into each tenant's actual floor; reuse existing floor/distance visibility.
- Generic business stock, finish decoration and lived-in countertop overlays skip all authored tenants, not just an incomplete subset. Returned production build results are retained through the wrapper. Smoke shop and university also skip incompatible generic stock/finish/legacy extraction passes.
- Fix room-register temporal-dead-zone crash: attachRegister read local `v` before its declaration. The early condition now uses `room.v.referenceTheater`, allowing ordinary rooms to load and registers to remain functional.
- Bump changed runtime URL versions in both launchers to avoid old router/overlay cache combinations.

No merchandise redesigns, prices, rewards, purchases, new inventory or mission changes are included. Existing product/service code is retained; original stock builders are reused.

## Build repair

The root Next config requested static export while retaining force-dynamic community config/status API routes. The first error was the manifest; declaring that deterministic metadata route force-static exposed the incompatible dynamic API export. Restore normal server-capable Next production output so live community routes remain dynamic, rather than turning environment/status responses into baked public snapshots. Static deployments may continue serving the separate `public/` site, whose standalone deployment config is unchanged; native packaging copies public/game directly. This does not convert the dynamic APIs into Cloudflare Pages Functions, nor publish a new deployment.

## Evidence and limitations

Targeted builder/display checks, room-entry regression, all 26 tenant thresholds, lifts/stairs/cafe, aquarium animation and restored-toy floor-visibility tests run against the live production builders. Added end-to-end mall-construction assertions cover all eight restored tenants, one model each, original floor visibility and no legacy counter, plus dependency order and no second generic countertop. Production build now compiles, typechecks, and completes page generation with server community endpoints.

Broad-suite results and preview status are recorded in the PR/task summary. Missing Ronniebaby GLB checks are separate from store integrations; that model is not fabricated or regenerated here. A passing test/build is not proof of full-city rendering or mobile frame rate. Vercel account deployment restrictions may still prevent browser verification.
