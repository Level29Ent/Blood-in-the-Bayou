# Cinematic bayou graphics refresh

Targets the current `/game/index.html` launcher used by the Next.js application.
The old standalone `public/index.html` launcher and native download archives are
not regenerated.

## Changes

- Reuses the existing DirectionalLight, HemisphereLight, PCFSoftShadowMap,
  EffectComposer, SSAOPass, UnrealBloomPass, HDR environment and bounded ray-marched
  bayou light shafts. No second renderer or additional full-screen passes.
- Exponential green/amber swamp haze changes density with weather/time. The
  cinematic pass no longer overwrites the atmosphere owner's haze or light
  intensities. Sun/shadow direction follows the time of day and retains the
  camera-relative shadow anchor. Mobile clip boundaries temporarily increase
  exponential density and restore it even after draw errors.
- Existing shared PBR details now have roughness variation; asphalt gains bump
  relief and becomes glossy in rain/storms. Existing imported PBR maps, glass,
  signage and unlit effects are preserved rather than destructively converted.
- Bayou water uses a dedicated wave normal map, scrolling world-space sampling
  compatible with Three r149 (`vUv`, not the later `vNormalMapUv`), depth-dependent
  absorption, subtle shoreline foam and a Fresnel sky tint. Existing environment
  reflections, wake ripples and optional planar reflections remain. Depth is a
  shoreline-distance bathymetry approximation from the tile grid, not measured
  seabed geometry or screen-space depth. Its texture is released on quality
  changes and water rebuilds.
- Retains ACES, vignette and grain; saturation is 0.88 and bloom strength is
  0.24 High / 0.16 Medium. The DOM/canvas HUD remains sharp and outside bloom.

## Limits and verification

Low remains the safe default: no composer, real-time shadow maps, water upgrade
or volumetric targets on Low. Medium/High opt into existing bounded effects;
mobile safety caps remain. This is a procedural visual refinement, not scanned
photorealistic replacement artwork, a Three.js version upgrade, or an FPS claim.
The atmospheric shafts are not shadow-occluded volumetric lighting.

Node regressions exercise shader hooks, linear bathymetry data, material
response, fog ownership, mobile restoration and existing gameplay/fallbacks.
The full Node suite passed 1,527 tests; TypeScript and the production build passed.
GPU shader compilation, full-city appearance, phone performance and endurance
still require browser/device verification. Deployed GPU appearance and device performance remain to be verified on the
PR preview.

The requested Ronniebaby shooting clip swap is **not included**: the current
third-person player is the procedural wardrobe/jester rig. The uploaded
`Ronniebaby.glb` has no animation clips, and its installer targets the mission
NPC, not the player. Neither a kneeling clip nor an alternate shooting clip can
be identified. The branch/assets containing those animations are needed before
changing that behavior; no speculative avatar changes are bundled.
