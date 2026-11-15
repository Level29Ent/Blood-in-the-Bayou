# Seafood & Bait startup staff crash

Safari reported `undefined is not an object (evaluating 'job[1]')` while the city attempted to draw its first frame.

The reference bait-shop integration routes a `retail` venue through the existing expansion → world → places delegation chain from city-life. The world worker factory's `jobs` table previously covered safe/garage/armory/spray/business only. Building Seafood & Bait reached `jobs.retail[1]` before the city finished constructing, stopping startup. The individual shop-model test did not exercise the later world decorator.

Add the missing explicit RETAIL CLERK role, preserving all existing worker roles, shop/service identity and save data. No generic fallback that would hide unrelated unknown venue IDs. The game launcher requests a new world-script version so an older cached script is not deliberately reused by URL.

`tests/bait-startup-worker.test.cjs` builds the production bait model through the real expansion, world decorator, places delegation and city-life routing functions. It failed at the reported `job[1]` dereference before the fix and passes afterward, verifies the clerk/label and clear original service point, and exercises all five pre-existing job roles. Uses Three.js geometry with small character/rendering stubs; not a GPU/full-city launch or Safari-device test. No storage is provided or cleared by the test or fix.
