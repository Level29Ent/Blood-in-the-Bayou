# Stage 1 — foundation, not the whole expansion

Approved scope: elevated interstate/traffic spacing, increased night zombies,
entry audio gate, organized tabs, loading feedback and compact mobile HUD.
Later-stage requests are listed below and are not declared implemented.

## Interstate / AI

The main loop is elevated on **85% of each side's centerline length**, including
its ramps, at a maximum deck Y=40. The middle 15% of each side is ground-level;
180-unit transitions meet ground without a height jump. Road surface queries,
visible decks, edge barriers and concrete supports every 50 units share this
layout. Existing raised civic bridge meshes are superseded, not stacked twice.
The loop retains four directional lane routes and existing numbered exits.

Connector ramps use where each existing path actually leaves the main
carriageway, hold its deck height through the shoulder, then descend over 240
units. A full-game scene check caught/fixed a mall-ramp height discontinuity.
No full simultaneous two-layer underpass simulation or dynamic lane switching
is implied. Core terrain, library/metro and other business heights remain.

Highway traffic keeps its route/chassis safety checks and gains lead-vehicle
headway/speed matching, occupied-space merge yielding and filtered steering.
It brakes for unsafe gaps instead of accelerating into a leader. This is bounded
lane/spacing control, not a claim of perfect autonomous driving, full interchange
routing or measured high-density merging performance. Six-vehicle highway cap
remains; other city traffic and physical collision handling remain active.

## Night zombies

Only ambient spawner budget/cadence changes: base cap 22→34 at night, upper cap
85→100, base interval 60→38 active simulation frames. Heat/progression still
apply; existing protected interiors, spawn checks, solo/client ownership and
post-mission respite remain. No change to mission enemy counts, damage/rewards
or unlimited night spawning. Existing game clock defines night.

## Real-gesture entry and loading

Initial fullscreen studio slate: Level 29 Production / Blood in the Bayou /
CLICK TO ENTER. Button stays disabled until the complete script stack registers.
Three former eager title-map generations and the eager RAF start are gated off.
A click invokes existing `ensureAudio`/AudioContext resume synchronously, then
initializes city, renderer, first render and one main loop on the next frame.
Repeated clicks do not create another loop. Failure retains a visible startup
error; users may reload to retry. Browser policy may still require a separate
Play interaction for Spotify; no unsupported promise to bypass its policy.

The progress bar counts actual Three DefaultLoadingManager items (completed /
total), not guessed elapsed-time percentages or byte progress. It shows the
city/renderer initialization phase before asset work, and covers assets needed
by that first render. It does not claim all future streamed radio, multiplayer
network or on-demand chapter assets are downloaded. Existing asset errors are
reported; optional assets can still fail independently. The engine itself is
not started by an automatic audio/DOM load event.

## Four menu tabs / touch HUD

PLAY contains existing quick-start/continue and multiplayer controls, plus a
validated four-letter room code join action. Existing multiplayer backend is
reused, not replaced. AUDIO/RADIO contains existing audio-mode control and
Level 29 Spotify player, plus persisted radio enable/disable. Radio player
returns to its prior in-game location when leaving the menu.

LEVEL 29 STORE has Challenge Coins, Vehicle Air Fresheners, Key Tags and Apparel
cards with placeholder artwork, price-to-be-configured and external checkout
anchor structure (`target=_blank`, `noopener noreferrer`). Links are disabled
until real owner prices/checkout URLs are configured. No invented transactions.

SETTINGS exposes Low/Med/High through the actual graphics renderer policy;
Low remains the default, explicit Stage-1 preference persists. Higher modes
re-enable corresponding existing shadows/postprocess behavior and may cost FPS.
Touch layout can swap joystick/actions left/right, persisting preference.

On mobile, Daily Spin/Objectives/Jobs are behind a compact MENU drawer; primary
status, map, aim/fire/movement remain available. New menu, entry and drawer
consume pointer/touch/key/click/wheel propagation. Existing game modal state
still controls combat; no new fullscreen click surface is put over gameplay.
Tab buttons support arrow-key navigation and ARIA tab/tabpanel state.

## Verification / limits

296 Node regressions pass including measured 85% centerline samples, smooth
main/exit ramp math, headway/merge spacing and capped faster night spawn behavior.
Old fixed-low test is updated to the newly requested explicit quality choices.
Actual-launcher local jsdom test verifies no map generation/RAF before entry,
exactly one audio unlock, one renderer init and one scheduled loop after entry;
four tabs, four merch placeholders and actual high-quality choice are exercised.
Separate actual-script scene check verifies all four exit profiles continuous,
Y=40 main deck, unchanged library terrain, library/metro roundtrip and full
launcher dependency loading. These are code/scene checks, not WebGL screenshots.
Build, type/native/archive and deployed browser results are recorded in the PR.
No measured mobile FPS, perfect traffic behavior or new native release claim.

## Later stages — still outstanding

- Stage 2: ten more weapons, ten different vehicles, working render-target
  rearview, attachments/stat mods, pre-game/full garage paints/tints/underglow/
  rims/performance and expanded safehouse furnishings/storage/safe mini-game.
- Stage 3: studio/fight-club/plaza/chop-shop and arcade game links, new dispatch/
  delivery/smuggling/heist chains, gangs/turf/encounters/police/media heat,
  emergency-service AI, fuel/tolls and physical merchandise checkout setup.
- Stage 4: recorded radio IDs/commercials (assets needed), cinematic mission/
  business intros, dives/drift slow motion, advanced fog/god rays/grading/grain,
  lighting/suds/water/tire effects and deeper business-specific interiors.

Some baseline versions already exist (library, mall props, car wash, soundtrack,
mission chains); that does not mean the newly requested deeper mechanics are
complete. Standalone PR #50 expansion kit remains explicitly unwired unless a
later task connects its adapters. Saves, rewards and existing checkout/ads
configuration are not reset or enabled by this foundation change.
