# HUD, enclosed mall stores, 29 Cuisine and living atmosphere

- Restore the original canvas money/health/armor/weapon status in the top right.
  The action grid remains spaced beneath its measured height. Remove Powell's
  HUD button only: his base NPC and missions remain accessible via U.
- Add PAUSE for touch/mouse access and put aim sensitivity/camera-shake settings
  in the solo pause menu, with a saved/resume button. Shared worlds cannot pause.
- Six mall bays now have separate enclosed solid rooms, wall/counter colliders
  and open front doorway gaps. Wider side galleries support the rooms without
  placing them in the atrium. Glass lifts/upper bridge remain.
- Rename the upstairs cafe **29 Cuisine**, with burger-meal signs and seating.
  U inside its service area purchases a $60 fictional-cash meal, restoring up to
  50 health; insufficient cash/full-health safeguards remain.
- Register planters, fountain bases and street lamp/sign poles as solid ground
  fixtures. Skip garden planting on basketball/court reservations and other
  protected amenities. Avoid new access-road tiles when planting mall planters.
- Add a protected mall-perimeter lane and two BFS connections to existing streets
  without crossing buildings, farm/court/airport/pier or water. Road tiles drive
  both ground paint and AI lane safety; this is not a global traffic rerouter.
- Add a 20-minute active-play day/night cycle beginning at 08:00, independent of
  mission number. Solo pause stops the clock. Dawn/dusk/night drive existing
  lights; rain/storm/fog drive sky/cloud colors, ambient/sun intensity and fog
  visibility. Late camera application prevents older lighting wrappers from
  restoring a bright clear sky after weather changes. No new shadow/postprocess
  pass or new network assets.

226 tests pass: clock/weather states, access paths, enclosure/door gaps, cafe
cash/health behavior and original HUD/menu wiring, plus all previous regressions.
Web production build, TypeScript no-emit and iOS source archive/sync checked.
Local actual-script DOM harness generates every chapter, builds the revised mall,
cycles the lifts and confirms two road connections and all six store identities.
These are not WebGL/screenshots or physical-device FPS guarantees. Deployed
visual playtests remain required. Existing Next.js security advisory remains.
Installed iOS apps require a new signed build from the refreshed source ZIP.

Merged gameplay-feel combat/movement fixes are preserved. Its former play-mode
Controls panel delegates to pause; only the dedicated pause module scales aim
and shake, avoiding doubled multipliers.
