# Switchable third-person camera

## Controls and behavior

- Default remains first person unless the browser previously saved third person.
- On foot, **C** or the existing HUD/pause-area **VIEW** button switches first/third person. Controls use the existing wardrobe C listener, not a competing second key handler. Clothing-store First Person/Outfit View actions use the same mode selector.
- Third person follows behind and to the right at 48 units, with mouse/drag/right-stick yaw/pitch still using original look controls. While firing (or recent muzzle flash), the camera moves closer at 29 units. This is a closer firing view, not new hold-to-aim/ADS, lock-on, free-aim or ballistic mechanics.
- Camera sweeps from the player's upper body toward its desired position in <=2-unit increments with four-unit collision padding, using the current collision context, local terrain/floor support and conservative interior ceiling limits. Obstacles shorten the boom immediately, avoiding smoothing through walls. Less than 12 horizontal units of clearance temporarily restores first person and hides the avatar; preference remains third person. This is conservative avoidance, not a guarantee against every decorative roof/overhang absent from game collision data.
- Avatar is the existing clothed wardrobe character. It is synchronized before the world draw instead of after it, with walking leg movement, idle legs, jump height and existing outfit selections. Existing display weapon clone is attached cosmetically, with first-person arms/flash surfaces already stripped by the existing Arsenal API. No new player mesh system, skeletal animation set, melee animation, independent shoulder swap or character creator.
- First-person overlay scene is hidden only during an active shoulder view and restored on return, including fallback. No modification/disposal of shared weapon geometry or materials.

## Preserve existing cameras/gameplay

Independent on-foot preference does not replace C's existing vehicle cockpit/chase selection. Vehicles, aircraft, park/coast rides, scopes, dressing preview, city-story cutscenes, peaceful prologue, swimming, the bank vault and underground/metro travel retain their original camera behavior. Menus/death do not show third-person avatar. An enabled preference may be temporarily inactive during these modes. Tight interiors can fall back to first person, while ordinary roomy interiors use collision-limited shoulder view. Streamed 32-unit floors use a tighter vertical cap.

No campaign/save state, movement speed, character collision radius, projectile origins, spread, ammo, damage, recoil or combat/mission scoring changes. Weapons still use the game's existing player-origin firing and assist rules. Camera points toward the player's existing forward aim line, converging at a fixed distant target; close-range parallax and original horizontal projectile constraints remain. This is not a new camera-ray shooting system and requires actual combat playtesting before claiming close-range crosshair accuracy in every weapon mode.

Preference is a separate local `level29.camera.v1` first/third setting. Storage failures are caught and switching still works. It is not new progression data and not promised to transfer through campaign Save Code.

## Validation

Pure math checks cover yaw/pitch/floor/jump shoulder pose, shorter firing view, finite outputs, thin-wall sweep and eye fallback. VM tests exercise first-person default, pre-render clothed-avatar synchronization, one attached weapon across switches, restore of viewmodel scene, collision-context restoration even on exception, invalid space/floor/ceiling checks, saved/touch mode switching, vehicle preference separation and special-camera priority. Existing wardrobe construction/equipment and full source tests remain. Actual wardrobe sync is exercised for one avatar, outfit changes and same-frame pose/visibility. Source-order checks ensure late camera wrapper loads after existing owners.

Production build/full-suite results and deployment availability are recorded on PR. None of these checks is a rendered full-city playthrough, proof all near-plane clipping is eliminated, a visual judgment of weapon grips or an FPS/device benchmark. Browser/device verification remains required. No external assets/dependencies, additional real-time lights, timers or global scene scans are added; collision sampling is bounded by the short camera boom, and venue containment is checked once per pose, not per sample.
