# Bayou Game Exchange reference interior

Greentown Mall's existing third-floor GAME STORE is refitted around the supplied retro game-shop references. The room, exterior sign, doorway, upper-floor walking surface and existing mall browse/services behavior are retained.

- Dense face-out game cases on six-tier side slatwall racks and red/blue/green console bays. Covers and cabinet artwork are original procedural illustrations with fictional titles, not copied commercial cover images.
- Glass checkout case with console/controller silhouettes, a register display, gray carpet, pastel geometric frieze, white ceiling grid and fluorescent panels.
- Two upright joystick arcade cabinets, one pinball table with bumpers/ball/backbox and one steering-wheel racing cabinet. These are decorative, not newly playable games or console purchases.
- Major fixtures and shelf bodies have collision reservations. The central doorway/service pad, checkout approach and approaches to all four machines admit a ten-unit player radius in both room orientations. Existing lifts, all 26 shop thresholds, stairs, cafe service and mall waterfall are regression-tested.
- The module uses local coordinates transformed for north/south rooms; its world-space solids match the same transform. Instanced repeated fixtures plus one merged game-cover atlas draw keep the new interior to 32 mesh batches. Five local canvas textures, no new models, remote image requests, real-time lights or postprocessing.
- Generic retail displays, stocked-business additions and room-finish decorations skip this shop; material upgrades preserve its root. Decor is hidden on other mall floors and at distance. This is not a physical-device frame-rate or full-city memory benchmark.
- `/game/game-store-review.html` renders the production furnishings in the actual 102 × 70 reference room footprint with store, shelves, console, arcade and pinball/racer cameras. It omits the surrounding mall, actors and gameplay. `/game/mall-review.html` also loads the new module to keep its production mall builder functional.

The broader suite caught the hospital interior module missing from the main launcher after the recent hospital merge. The required `hospital-interior.js` entry is restored ahead of `hospital-departments.js`; without it, building the city hospital would also prevent reaching the mall. No hospital furniture/services are changed here.

Checks and preview evidence are recorded in the pull request. Relevant checks: `node --test tests/game-store-interior.test.cjs tests/mall-smith.test.cjs tests/mall-atmosphere.test.cjs tests/interior-expansion.test.cjs tests/interior-realism-parade.test.cjs tests/source-integrity.test.cjs tests/hospital-interior.test.cjs`.
