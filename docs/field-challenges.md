# Bayou field challenges

Open **Settings / Journal → Journal → Fishing Cup / Recovery / Scavenger Trail** from solo city free roam. These three additions reuse fishing, vehicles, safe street approaches and existing wardrobe assets instead of adding another map. All are optional, free to enter, and mutually exclusive with each other, leisure trips, survival operations and existing active jobs. Another activity taking over cancels the challenge without payment. No production, billing, database or environment setup is needed.

## Bayou Angler Cup

Start beside fishable water with no line currently cast (a stopped boat is allowed). Land **three fish within 180 active-play seconds**, using the existing cast/bite/reel/tension mechanics. Only the real `catchFish` success handler emits the internal species/sequence notification; prior catch totals, failed casts and market sales cannot count. Sealed dockside lockboxes do not count. The original fishing cash, stock and five-catch bonuses remain unchanged.

First clear adds **$600 game cash** and unlocks the existing **Gold Bucket Hat**. There are no AI fishing competitors, real-world prizes, online ranking, extra fish models or automatic fishing.

## Roadside Revival

Start on foot. The dispatcher chooses a clear road position with a drivable road-tile route to an existing garage approach. Unsafe/blocked sites are rejected without spawning over another car. A dedicated non-owned loaner sedan starts at quarter health with manual/AI driving locked until repaired. Stand nearby on foot and **hold interact / HOLD FIELD USE for four uninterrupted seconds** to restore it. Then manually drive **that same sedan** to the F return marker and stop below 0.3 game speed within 50 units.

Six-active-minute limit. First clear pays **$900** and unlocks **Gold Work Boots**. The loaner is removed on completion, cancel, destruction, death or world change; the player is safely dismounted before removal. Other cars, player purchases, starter bikes and quest vehicles are not used or deleted. This is repair-and-delivery, not a towing cable/trailer or persistent vehicle ownership feature. The game validates a conservative route but does not automatically drive it or teleport through obstacles.

## Five-Parish Scavenger Trail

Visit five distinct safe existing city street approaches selected from the connected mission destination list. Follow F, exit your vehicle, and hold interact / FIELD USE for two seconds at each in order. Only the current marker is visible; after collection, the next venue name is revealed. The next stop is also the current objective target. Ten-active-minute limit.

First clear pays **$1,000** and unlocks the existing **Gold Varsity Jacket**. This is an ordered five-stop city exploration trail, not five newly constructed parishes or a random loot system. No imported scenery/assets, combat spawns, new lights or geometry-generation loops.

## Rewards, progression and preservation

First-clear cash pays **once per challenge per save**. Later runs are practice and can improve recorded completion times but do not repeat the challenge cash. Normal fishing rewards still occur. Cosmetics are existing gold catalog items, not exclusive new clothing designs: completing a challenge grants ownership without changing the equipped outfit. The challenge board offers **EQUIP** buttons; normal outfit-store controls remain available. If the player already owns that item, it is not duplicated or refunded.

`level29.campaign.v2.field` stores the three cleared IDs and bounded positive best times. Existing Continue, save-code export/import and cloud-copy paths carry this optional field; old saves initialize empty. New Game resets completion records; existing wardrobe ownership follows the game's existing wardrobe behavior. Active challenges, dispatch loaners, timers and partial holds are intentionally not restored after reload. No offline timer/catch-up is applied. Death, timeout, cancellation and lost loaner pay no challenge reward.

Use holds support keyboard/current binding, touch pointer capture and controller fire trigger. Releasing/focus loss clears held input. Opening the board pauses the solo challenge. Status text reports time/catches/stage/repair progress; there is no global leaderboard or server-authoritative economy.

## Checks and acceptance

Run `node --test tests/field-challenges.test.cjs`, then `node --test tests/*.test.cjs` and `pnpm run build`. Tests exercise unique real-catch events, lockbox exclusion, duplicate event rejection, normal catch rewards, safe dispatch, exact-car/stopped delivery, on-foot ordered collection, interruption/timeout/cancel cleanup, one-time cosmetics/payouts and legacy bundle compatibility.

Before release, play the exact PR-head preview: complete a real three-catch round, manually repair/drive the dispatched car through the generated-city route, finish/replay all five trail stops, equip each earned item, export/import records, cancel/reload midway and test short-landscape touch controls on a physical phone. Local VM tests and builds are not rendered/live-device proof. The normal iOS source archive is refreshed; it is not a signed/compiled store app. Browser/physical-device verification remains pending when deployment access is blocked.
