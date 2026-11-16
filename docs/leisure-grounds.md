# Cypress Leisure Grounds — golf, farmland estate and kart businesses

## Getting there

Open **Settings / Journal → Journal → Golf / Estate Farm / Kart Businesses**. Track the **L** shuttle marker outside an existing city business, walk to the pickup, and board explicitly. The shuttle is free. It only boards on foot, solo, after the prologue and outside active jobs/stories/rides. No safe connected street approach means no pickup is invented and no entry fee is charged.

This is a separate, daylight, explorable leisure destination, not three replacement parcels in the crowded main city and not a seamless highway expansion. The city simulation/timers pause during the visit. The same WebGL renderer draws the grounds; existing scenery is hidden rather than freed. Entering allocates the destination, leaving retires its geometry/materials/sign textures and restores city visibility, lighting, location, camera heading, objective and heat. The rest of the original city, including recently merged authored/generic facades, remains unchanged.

**GROUNDS / BUSINESSES** stays available while paused, including on touch screens. From this board you can return by shuttle at any time; this forfeits an unfinished activity and its fee. Walking uses the existing keyboard/touch joystick; the destination owns its own collision and camera while visiting. City job, cheat and weapon hotkeys are suppressed through the early binding adapter so they cannot launch frozen jobs off-map. Audio toggles remain available. This destination is solo-only.

## Cypress Links golf course

- Three playable, numbered, par-four holes with tees, fairways, greens, sand bunkers and flags.
- Walk into the northwest pro shop and stand at its counter to pay **$50 game cash** for a round.
- Walk near the white ball. Aim and power sliders plus **SWING** control an actual rolling ball with friction; bunkers slow the ball more strongly. The projected aim line shows the selected direction. Swinging is rejected while the ball moves, from farther than 35 game units away, or outside active play.
- Finish all three holes, with an eight-stroke cap per hole. Low-speed cup capture requires a real swept ball/cup intersection, not pressing Use at a flag. The total score and best round persist.
- Completion pays **$150–$600** by score. This is a compact three-hole stylized course, not an 18-hole simulator, online golf or animated swing/club system.

## Belle Rive plantation estate and farmland

- Walk-in columned manor with a veranda and furnished rooms, a separate barn/silo, produce market and six agricultural plots. Roofs hide when the player enters the buildings.
- Okra, corn and sugarcane have different bounded stalk/leaf shapes. Produce crates visibly disappear as the shift collects them. These are original procedural/stylized props, not imported photographic assets.
- At the east-center market counter, start a free harvest shift. Visit **all six distinct plots**, hold the current interact key / touch **HARVEST** / controller fire trigger for three uninterrupted active seconds per plot, then return to the market and use it to deliver.
- Completion pays **$450** once for that shift. A tap is not a latched auto-harvest. There is no crop growth clock, fertilizer economy, animal breeding, NPC labor simulation or historical reenactment.

## Bayou Stacks two-level kart circuit

- Walk into the southeast kart-rental business and stand at the counter. **$100** rents a kart for a three-lap time trial.
- The fenced, kart-only figure-eight has a continuous ramped deck, support columns, edge rails, a starting grid and a gold next-checkpoint gantry. At the crossing, upper and lower routes are separated by **42 game units**; the kart/camera height follows the correct layer instead of snapping to the lower crossing.
- Steer and accelerate manually using movement keys, the existing touch joystick, explicit held on-screen controls or a controller. Space / brake button / controller brake slows the kart; reverse is supported. It is not an automated coaster ride or spline-following tour.
- Sixteen ordered gates per lap, three laps, a five-active-minute limit. Wall contact stops forward movement, reduces speed and adds a rate-limited **one-second penalty**; reversing or cutting across the infield cannot award lap gates. The HUD shows lap, speed, elapsed time and penalties.
- Completing 48 gates pays **$600** once; best adjusted time persists. Finish/cancel/timeout returns the driver to the rental counter, not inside the fenced track. There are no AI opponents, online races, vehicle ownership/export or automatic host migration.

## Businesses and saves

All costs are earned **fictional game cash**, never real-money purchases:

| Business | Deed | Effect |
|---|---:|---|
| Cypress Links pro shop | $18,000 | +20% golf completion pay |
| Belle Rive farm market | $24,000 | +20% completed harvest pay |
| Bayou Stacks rentals | $22,000 | +20% completed race pay |

Buy at the matching counter outside an active activity. Deeds are charged once. These are playable business counters with deeds and activity income, not generic scenery signs or passive/offline income faucets. Completed activities have a 60-active-second rebooking cooldown. The board shows deeds and records.

`level29.campaign.v2.leisure` stores deeds, round/race/harvest counts and best results. Continue and existing save-code/cloud-backup paths carry this optional field. Legacy saves initialize it safely; New Game resets it. Active rentals, ball velocities and partial harvest shifts are deliberately **not** restored after reload; earned deeds/completed records persist and unfinished entry fees are not refunded. No database migration or new environment variables are needed for these additions.

## Performance and checks

The destination has 27 shared static detail batches plus bounded roof/sign/dynamic props; six crop plots, one golf ball, one kart and one movable checkpoint gantry. No imported models/textures, external packages, NPC population, new lights or per-frame geometry generation are added. It is created only when boarding and disposed on return. Retaining the paused city's resources plus this extra destination still needs real-device memory/thermal testing; this is not a crash-free or FPS guarantee.

```
node --test tests/leisure*.test.cjs
node --test tests/*.test.cjs
pnpm run build
```

Tests cover entry gates, real runtime isolation/return/cleanup, touch pause recovery, early key routing, correct fees and one-time rewards, all six harvest plots, buy-once deeds/save restore, ball friction/bunkers/cup capture, complete physically simulated golf rounds, the real ramp geometry/winding/clearance, ordered manual three-lap steering, crossing-layer selection, wall/reverse/timeout rejection, finite model resources and launcher order. These are deterministic/VM/Three checks, not browser-rendered evidence.

Release acceptance still requires a READY preview of the PR head: locate the shuttle in the generated city, board/return, walk through all five buildings, play a full golf round/harvest shift/race, buy one deed, export/import its save, and inspect portrait/short-landscape controls. Repeat on a physical phone with a long session and interrupted focus/context. The usual iOS source-archive refresh updates the download; it is not a signed/compiled native app or store release.


## Navigation and control polish

- The grounds board now offers per-business tracking with live distance, compass bearing and relative turn guidance. This is a direct bearing, not an obstacle-aware walking route. Activities override manual tracking with the golf ball, the **center** of the next unharvested plot, the delivery counter or the ordered kart gate.
- A wrapping DOM navigation/progress card replaces the long single-line canvas status, including an event-only accessible status message. Short-landscape control stacks scroll rather than spilling out of the viewport.
- Golf adds **AIM AT CUP** (direction only; no automatic power/shot), visible power/cup distance and a disabled swing when the ball is moving or too far away.
- **RESET STUCK KART · +5s** in the board returns a nearly stopped kart to its last passed checkpoint. Time and ordered lap progress are retained, velocity is cleared and each reset adds five seconds. Moving/finished rentals cannot reset.
- Held on-screen driving buttons also support Enter/Space and clear on key release/focus loss. Harvest holds clear on interruption while collected crates remain.
- Booking buttons explain counter proximity, available cash, active jobs and rebooking cooldown. Cancelling/returning during an activity requires a second explicit confirmation, with **KEEP PLAYING** preserving the session and fee.

Prices, rewards, business ownership and the saved-record schema are unchanged. Existing interrupted activity/reload rules still apply; navigation selection is session-only. New deterministic tests cover the above behavior; visual acceptance still requires the PR-head preview and phone testing.
