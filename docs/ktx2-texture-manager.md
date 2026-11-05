# Managed KTX2 textures (Three.js r149)

`TextureManager` is configured from the existing `initGL` wrapper after the
single game renderer exists. It uses the existing LoadingManager, r149 loader,
self-hosted `/game/vendor/basis/` JS/WASM and one transcoder worker. detectSupport
queries the renderer’s ASTC/ETC/S3TC/BPTC/PVRTC extensions and chooses supported
formats or the loader fallback; no second renderer and no fake extension enabling.
Existing GLTF watercraft loading uses this same KTX2Loader instance.

```js
// Promise API: each acquire/load adds one reference.
const textures = level29TextureBudget.getManager();
const url = '/game/textures/my-wall.ktx2';
const texture = await textures.acquire(url, {
  colorSpace: 'srgb', // omit to use file metadata; use 'linear' for data maps
  onProgress: ({ percent, loaded, total }) => {
    // percent is null when response has no known Content-Length.
  }
});
material.map = texture;
material.needsUpdate = true;

// When that owner is unloaded, detach first, then release with identical options.
material.map = null;
textures.release(url, { colorSpace: 'srgb' });

// Callback API also returns a Promise. Handle either errors or promise rejection.
textures.loadKTX2Texture(url, texture => { /* use texture */ },
  progress => { /* progress.percent or null */ }, error => { /* visible error */ });
```

Canonical same-origin URLs under `/game/`, case-insensitive `.ktx2` suffix.
Concurrent requests share one promise/texture, reference-counted final release
calls texture.dispose. Different sampling/orientation overrides for the same
retained URL reject rather than mutate a shared texture. Released pending results
are discarded/disposed, and pending URL reacquisition waits for settlement.
Failures leave no poisoned cache entry; retry allowed. Manager.dispose rejects
pending promises and releases owned textures/workers. Late completions cannot
revive an old manager. pagehide disposes manager; after back-forward restoration,
next call lazily makes a new manager. Do not retain disposed textures through
pagehide or share disposal authority with this manager.

Compressed textures use the file's mip chain: generateMipmaps=false, trilinear
only when multiple mip levels exist, linear otherwise. Do not ask WebGL to generate
mips for block-compressed payloads. flipY and color transfer metadata stay intact
unless explicitly overridden. No assumption all KTX2 files are upside down.

GLTF's embedded texture ownership remains GLTF's, not manager-cache reference
counting. Do not release GLTF-owned textures through this standalone API. No
automatic global replacement of existing TextureLoader photo logic or authored
materials; existing downscaling remains. Assets must actually be converted offline
to Basis/UASTC KTX2 before production textures benefit. No encoder/conversion of
the game's PNG/JPEG assets in this PR; no memory savings/FPS claim.

`node scripts/build-ktx2-fixture.cjs` writes an ORIGINAL tiny 2×2 RGBA KTX2 file
using the installed parser writer. It is uncompressed, NOT a production Basis
sample. `/game/expansion-demo/ktx2-manager.html` verifies file load/GPU upload,
request sharing, release/reload and self-hosted Basis initialization separately.
It does not prove block-compressed transcoding or savings. Tests use actual r149
decoding plus controlled asynchronous loader stubs for ownership/error races.
No new native iOS ZIP/build/device test. No login or external asset downloads.
