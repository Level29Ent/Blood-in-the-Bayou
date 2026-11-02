# Gameplay feel pass

This is a focused improvement pass across combat, movement/driving, mission
feedback and UI performance. It does not replace the existing map, mission roster,
progression, damage balance, enemy AI or rendering engine.

- Combat: test the bullet's swept path rather than only its end position so fast
  rounds don't skip narrow zombie hit circles. Sample impassable wall tiles along
  that path. White hit/gold kill confirmations are triggered by actual local
  damage only, not clicking or remote hits. Existing HP/armor/piercing rules remain.
- Movement: quicker acceleration and stronger release damping eliminate tiny
  residual drift without raising walk/sprint speed or diagonal speed.
- Driving: player-driven land vehicles respond more promptly to steering input;
  boat and AI steering smoothing retain their previous tuning.
- Controls/comfort: CONTROLS offers persisted sensitivity (.4–2×) and shake
  (0–100%) settings. Shake defaults to 45% with an amplitude cap; it scales only
  camera rendering, not the underlying damage/physics shake state. Solo settings
  pause play while open. Escape closes; storage failure applies settings in-session.
- Pacing: stage changes show a brief next-waypoint reminder. Successful main
  mission completion defers ambient spawns for 10 simulation seconds, not mission
  targets, existing enemies, damage or rewards. It is not an invulnerability mode.
- Focus safety: blur/page hiding clears held movement/fire, touch and controller
  states. Solo play pauses; multiplayer does not pause the shared world.
- Performance: HUD text updates at most 10 times/second and only when changed;
  waypoint DOM nodes rebuild only when labels/distances change. Projected labels
  still track the camera each render. No extra postprocessing or dependency.

219 tests pass including swept hit/wall checks, movement convergence/stop,
malformed sensitivity bounds, camera state restoration, spawn respite and
solo/shared-world focus behavior. Existing gameplay/collision/mission tests pass.
Web build, typecheck and native package generation are checked. This does not
establish a measured FPS gain or prove combat/handling feel on physical phones.
Visual/controller/mobile playtests remain necessary. iOS ZIP requires a new
signed release. The existing Next.js security warning remains unresolved.
