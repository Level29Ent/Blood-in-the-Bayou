# Startup latency / refresh mitigation

## Report and evidence

Player reports a long load followed by a refresh. The supplied diagnostic has successful title startup events, older mixed-in 15–21 FPS samples and no recorded WebGL context-loss/discard error. It does **not** establish whether the refresh was memory pressure, a browser process termination, navigation or another cause. No claim that Vercel or Safari caused a confirmed crash.

Source inspection found avoidable work: CLICK TO ENTER generated a title city, allocated a WebGL renderer and rendered it before showing the menu, then Play/Continue generated the playable city. Ant/Draco models were requested eagerly during world construction even if the player was far away. Mobile renderer initialization also requested MSAA at the existing bounded drawing resolution.

## Changes

- Entry now unlocks audio and shows the existing DOM menu. It does not generate a throwaway title city, allocate a WebGL context or run title-world simulation. The pre-game loop sleeps while state is menu and city is absent. The title has no moving city backdrop until a world exists; this is intentional.
- Actual Play/Continue initializes WebGL once before existing start wrappers and constructs the gameplay world normally. Existing two-frame first-play gate remains; optional assets do not gate entry. No automatic reload or save-data clearing is added. The existing explicit Retry button still reloads only after a user action on an initialization failure.
- Water/fog effects wait until the matching playable city geometry exists; partial setup no longer marks itself ready. Low quality allocates no disabled volumetric/wake/foam objects or dense wave mesh, and quality transitions dispose/recreate safely. This fixes the first-update missing-foam error reproduced after removing title initialization.
- Renderer uses no MSAA multisample allocation (the existing desktop context already had none). Mobile may show sharper/jaggier edges, but keeps its existing pixel-ratio/texture/quality budgets.
- Anthony/Draco models are proximity-queued: wait 1.2 seconds within 180 game units and matching elevation, load one at a time, keep procedural fallback, ignore stale world owners, and back off 30 seconds on failures. Shared template caching, missions and placement remain unchanged. Ronnie's existing visible/proximity story loader remains separate.
- Persist world start, renderer, generation, ground-paint and world-build phase records before expensive work. Record elapsed phase times and retain a booting flag until the playable city renders twice or fails. An interrupted startup offers checkpoint recovery without asserting a confirmed crash.
- Fresh exports put only this navigation's events under current; old events remain solely in previous. Include live graphics/phase data in current export. This avoids interpreting old FPS samples as evidence about a new build. Runtime carries startupProfile `menu-deferred-2`.

## Verification

Tests exercise zero title generation/render allocations, idle pre-game loop, explicit retry only, WebGL-before-start ordering, two-frame gate, sustained proximity, serialized loads, backoff and stale-owner rejection, fresh diagnostic sessions and phase failure propagation. Existing save/Continue, mobile, Ant and source-integrity tests remain. Build, broad-suite and browser evidence are recorded on the PR.

This removes demonstrated startup work and reduces GPU pressure; it does not prove the reported physical device's refresh is eliminated or promise a loading-time/FPS target. The gameplay world still has synchronous generation/batching work. Device testing and a fresh diagnostic are needed if the issue persists. The source iOS archive is refreshed with the existing script; no newly compiled/signed app is produced.
