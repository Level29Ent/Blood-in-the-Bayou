# Territorial drive-bys, bayou shaders and radio recording pack

## Drive-bys and warnings
- Existing three colored territorial foot patrol districts remain.
- At most one additional crew-colored sedan/muscle drive-by car at once; 70-active-second spawn cooldown, up to eight collision-clear spawn attempts, retreat after 32 seconds or leaving turf, retire by 50 seconds or distance/map/death cleanup.
- Uses existing navigation, road chassis sweep and car physics; regular traffic AI does not overwrite its steering. Collisions remain on; it cannot teleport across barriers. Driving quality still needs real playtesting.
- Visible passenger, timed tracer/cue shots with range, LOS and elevation checks. Hits have a 55% accuracy roll after those checks, damage car or player; no offscreen arbitrary cross-map damage. Solid buildings protect the player. Three aimed, world-occluded passenger hits stop shooting and trigger retreat; no repeat bounty. Vehicle can also be destroyed normally.
- Nearby living foot crew within 230 units speaks a warning on entry, paired with a subtitle. Browser SpeechSynthesis uses an available device voice (no actor/celebrity imitation or bundled recording). Requires entry gesture, respects soundMode mute and stops on leaving range, pausing or death. Captions remain fallback if speech API unavailable/busy. Single-player only; multiplayer server authority is unchanged.

## Volumetrics / water
- Medium: two nearby bounded volume boxes, 12 ray-march samples. High: four, 24 samples. Low: off, original water restored. Shader programs and resources are reused across day/night; no density-grid rebuild at sunrise.
- Real density integration along a camera ray inside each AABB with ground-height falloff, moving density and stylized light-shaft pattern. Dawn/dusk fades and subdued nighttime haze; distance-cull beyond 550 units. Replaces older point fog rather than layering both.
- These are **stylized local volumetric shafts**, not shadow-map-occluded physically simulated sun beams or global volumetric lighting. Transparent volume back faces depth-test, but no scene-depth texture truncation at embedded objects; keep volumes in bayou open spaces. Full tree occlusion still requires a separate depth/shadow-aware render pipeline, not claimed here.
- Existing sea gets a MeshStandardMaterial shader hook with animated normal perturbation and eight capped travelling ripple impulses. Boats/vehicles in actual water and an active fishing bobber trigger impulses; land/bridge cells do not. Eight reusable expanding foam rings and 32 pooled spray droplets, with short lifetimes. No geometry rebuild per wake, reflection camera or full-fluid simulation. High/Medium only; no promise of measured phone FPS improvements.
- Water original material restored on Low and cleanup; cloned shader material and volume/particle geometry disposed on map/scene rebuild. Active-game clock drives effects, pauses stop animation.
- Isolated GPU showroom `/game/expansion-demo/atmosphere.html` uses the exact module and a small synthetic scene, with quality and splash controls. It is not proof the full city meets a device framerate target.

## Download / radio production
`public/downloads/Level-29-Adult-Comedy-Radio-Scripts.txt` contains 30 original recording names: 6 station IDs, 12 fictional commercial/film promos, 8 DJ bumpers, 4 gang voice lines. Adult comedy/profanity; no slurs or impersonations. No invented real prices/payment destinations/release dates. Casino line states game cash only. Carwash ad explicitly withheld until that service exists.
These are downloadable **text scripts**, not generated audio. Actual radio interstitial rotation still needs recorded assets and integration; browser crew warning speech is separate. Film/radio copy can be edited before recording.

## Checks
Focused behavior tests cover range/cover, bounded lifetimes, real warning API invocation/cancellation/mute, quality budgets, actual material shader hook/resource restore/dispose, integrated car spawn/input/map cleanup and 30 unique filenames. Full test/build/TypeScript/native archive and preview results recorded in PR. Neither a passing test nor a READY build substitutes for a real street encounter, GPU/device frame profile or screenshot of the full bayou.
