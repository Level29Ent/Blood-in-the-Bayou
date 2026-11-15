# First-frame `job[1]` crash

## Reproduction and cause

The reported iPhone startup screen says `undefined is not an object (evaluating 'job[1]')`, followed by `THE CITY COULD NOT DRAW ITS FIRST FRAME`. Reproduced the corresponding Node error (`Cannot read properties of undefined (reading '1')`) with the actual composed `city-life.js` → `world.js` → `expansion.js` builder path for `{id:'retail',depth:'bait'}`.

The authored seafood/bait store intentionally delegates past the generic city-life retail builder to its authored base-shell implementation. The intermediate legacy world decorator always invoked `worker(v)`. Its `jobs` registry only defines safe/garage/armory/spray/business, so reading the retail job's shirt color fails. Earlier model-only and base-builder-only tests missed this wrapper composition. The symptom matches the screenshot; without a browser stack trace, this does not prove there cannot be another startup failure after it is fixed.

## Fix

Resolve an own registered job before allocating a figure or reading its tuple; when the venue has no legacy staff role, leave its authored staff/furnishings alone. Do not invent a default worker or suppress the entire build exception. All five original role colors/labels and staff collisions remain. Use `Object.prototype.hasOwnProperty.call` for older browser compatibility and to avoid treating inherited keys as jobs. Cache-bust the game launcher's world-script URL.

No save storage, campaign progress, money, inventory, input, map, gameplay or billing changes. No new dependencies. Online reload after the fixed deployment is available should obtain the new script; do not clear browser data. Offline/native embedded builds still require an updated asset deployment/package.

## Regression evidence

New tests first fail on the original composed bait-store build with the same missing tuple index, then pass with the fix. Tests use actual production base/world/city-life builder code, actual bait model, and small rendering/figure helpers, without WebGL. They verify the authored root/roof/pad and exact collider layout survive, unsupported/prototype-named IDs allocate no actor, known legacy roles retain uniforms/labels/collisions, and ordinary retail continues through its original city-life builder. Existing bait/strength-gym/source integrity checks remain.

Passing VM tests/build do not prove a phone can render the entire generated city. Full iPhone startup and first-frame verification still needs a reachable preview or deployment serving this commit. Deployment outcome and test totals are recorded in the PR.

## Latest-main conflict resolution

PR #272 already added the explicit RETAIL CLERK tuple on main. Preserve that tuple and its staff, label, service-clearance and wrapper-chain regressions; retain #273’s own-property guard for genuinely unsupported types. Update this PR’s tests to require the new clerk rather than treating retail as unsupported. All six registered roles remain staffed. The earlier reproduction above describes the original failure, not the now-merged retail behavior. Use a new combined cache token. No save-data changes.
