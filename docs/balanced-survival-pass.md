# Balanced survival polish — implementation and acceptance boundaries

This pass builds on the existing Natchez tutorial/prologue, zombie AI, shops,
weapon sounds, saves and character rigs. It deliberately does not impose
hardcore ammunition gates, new death penalties, price changes or purchase resets.

## Startup/performance investigation and targeted improvement

The world is already deferred until ENTER THE CITY, but that entry still runs
large synchronous world generation/build and first-frame work. Earlier preview
entry commands timed out; this is not sufficient evidence of a specific GPU or
browser crash. Existing phase diagnostics and first-frame guards remain.

One inspected hot allocation was `addSign`: every tiny venue/street label made a
1024-wide canvas, even on Low, with no matching-label reuse. It now selects a
512-wide canvas on Low/Medium (1024 on High), caps tall-label height at 1024,
and caches matching text/palette/aspect/quality textures for the first 64 keys.
No live texture is disposed through cache eviction. Real-constructor tests show
one canvas for two equal labels; a 100×20 label drops from 209,920 texture pixels
to 52,224 (approximately 75% less). Unrelated geometry/collision and high-quality
choice remain. This is an allocation/work reduction, NOT proof that full-city
startup timeouts are cured. Exact city timings/GPU/device acceptance remain in
PR evidence and must be reported separately.

## Combat feedback and encounters

Actual health/armor loss produces a short directional HUD cue; blocked/invulnerable
hits do not. Existing hit/kill confirmations remain. A quiet 80-ms debounced
procedural low-frequency hit layer complements existing sounds and respects mute.
No recorded performance or new soundtrack is claimed.

Optional ambient variants reuse up to eight existing walkers per generated city;
no extra zombies, HP, damage, speed, loot or missions are added. Classification
examines at most twelve actors per half-second simulation interval.
- Listeners: sprinting can alert them beyond the normal 200-unit sight distance;
  gunfire also produces a clear warning. Existing stealth perks and optional quiet
  gear reduce the sprint-hearing radius. Original gunfire alert logic remains.
- Bank lurkers: classified only near existing water tiles. They wait using the
  existing movement wrapper, show a shore-movement warning within 140 units,
  and wake after 1.8 seconds within 95 units or when hit. Attack cooldown is held
  during that wait. Original collisions/damage apply after wake.
- Drifters: unalerted walkers follow a small local 48-unit patrol circuit through
  the original collision mover and show an early route warning, then chase with
  original rules. This is a bounded local patrol, not citywide pathfinding.

Peaceful/active prologue, authored active missions, multiplayer and special
activity modes retain their existing owners. Variants can be disabled from the
field journal; movement falls back to the original immediately. No hidden enemies
are spawned for scenery effects or behind the player.

## Exploration and preparation

Three optional notes at the actual Natchez entry, hospital door and safe-house
door give local narrative clues and an optional waypoint. Reading/replaying is
free. Each cache contains one sealed field kit, collectible once per campaign
and only on foot at the note. Capacity is three; full pouches do not consume a
cache. These are finite optional supplies, not a replacement of normal shops or
an economy-wide scarcity rebalance.

Inside an existing safe-house room, spend a kit either to heal 25 (never at full
health) or wrap gear for 120 active-play seconds of quieter player-origin gunshot
alerts. No kit is spent outside safety. Wrapping does not silence all weapons or
negate every existing enemy alert source. Buff time is session-only and is not
replenished by loading. Notes/claims/kits and opt-out are an optional field in
campaign v2; old saves normalize safely, and New Game resets it. Existing save
codes/backups carry the campaign object, including the new field. Cash, health
upgrades, purchased weapons and the infinite starter weapon remain unchanged.

PAUSE → FIELD JOURNAL / SAFE-HOUSE PREP opens a keyboard-focus-contained panel;
Escape returns to the previous game state. The contextual READ FIELD NOTE button
is touch-isolated and uses no competing gameplay shortcut. Existing tutorial,
mission route, death recovery and checkpoint systems remain intact.

## Character acting

The real animated Ronnie player now briefly reacts to actual HP loss, uses the
existing boxing clip for bat input, crossfades back to locomotion/fire and resets
on respawn. Procedural human face rigs receive occasional bounded eye blinks;
GLBs without facial controls are not deformed. No lip sync, facial rig generation,
new voice recordings or motion-capture assets are supplied. Recorded dialogue
still requires the owner to provide usable clips; it is not synthesized or faked.

## Verification

Unit/runtime tests exercise real sign allocation, cache bounds, note proximity,
one-use rewards, safe-only consumption, pause/buff timing, damage gating, hearing,
shore warning/movement, story/mission/multiplayer exclusions, old-save normalization
and animation reactions. The isolated `/game/balanced-survival-review.html` uses
the production journal/encounter module with a small fixture; it is not full-city
playthrough evidence. Final suite/typecheck/build and exact preview checks are in
the PR. Mobile endurance, all-weapon grips, full Natchez-to-outbreak playthrough
and genuine recorded dialogue remain acceptance work. The legacy standalone
launcher and existing native ZIP are not regenerated.
