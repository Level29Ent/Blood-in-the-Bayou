# Optional enterprises, rivals, cultivation, survival and photo mode

This extends the existing leisure grounds and city with opt-in progression. It does not replace the campaign, existing jobs, old harvest shifts, ownership deeds or original locations. All prices/rewards are fictional earned game cash. No new dependencies, backend resources, paid services or database migration are needed.

## Business upgrades and service contracts

Visit the existing grounds shuttle, then **GROUNDS / BUSINESSES → Business Upgrades / Garden / Rivals / Estate Journal**. The extra **UPGRADES / GARDEN / JOURNAL** action opens the cultivation page, or nearby unread estate documents. The four board tabs expose all optional leisure systems.

Own a business deed and stand at its matching counter, outside a current activity, to buy three levels:

| Business | Base upgrade cost | Level costs | Benefit per level |
|---|---:|---|---|
| Golf | $4,000 | $4k / $8k / $12k | +5% completion pay |
| Farm | $5,000 | $5k / $10k / $15k | +5% completion pay and +15% watered-crop growth speed |
| Kart | $6,000 | $6k / $12k / $18k | +5% completion pay |

Stocked workshop displays appear near each counter for purchased levels. This is visible bounded prop progression, not a rebuilt building or new passive-income simulation. Existing owner bonuses remain, with upgrade bonuses applied to the completed activity amount.

Owners can accept repeatable three-stop local service contracts from the same counters: inspect tees/service a flagstick/return tools; collect packing crates/check a field/deliver to the market; inspect two spectator safety points/return the timing kit. Hold interact (or the dedicated held WORK action/controller trigger) for two active seconds per stop, in order, and return to the counter for $600 plus upgrade bonus. Four-active-minute limit; leaving/cancelling/timeout pays nothing. Contracts block booking normal leisure activities and do not run alongside each other. There is no automatic offscreen worker income.

## Kart ghost and two AI rivals

The **RACING** tab enables two fixed-difficulty AI rivals for the next normal $100 rental. They use the same steering/throttle/brake physics, layered crossing selection, wall penalties and 48 ordered gates as the player. Their target cruising speeds differ; they are not a pre-scripted camera ride. Kart-to-kart collisions are deliberately disabled so opponents cannot push the player through a barrier. Beat both adjusted times for a $300 tournament bonus once for that race; base completion and upgrade/ownership bonuses still apply. Tournament wins persist.

A clean, completed, faster rental stores up to 620 local path samples (roughly 2 Hz). Its translucent cyan ghost replays raw elapsed track time in subsequent rentals, interpolating height and heading through the overpass. Samples remain browser-local, ride inside the normal save/export path, and are validated/bounded on import. Penalized/reset runs do not replace a clean ghost. No global leaderboard, competitive anti-cheat, remote ghost service or arbitrary downloaded replay data is added.

## Seed → water → grow → harvest → buyer

Cultivation uses the same six farmland plot areas, but is **separate from** the existing staffed harvest-shift activity. Stand at a plot with no active rental/shift/contract, open **GARDEN**, buy a seed and water it. Growth advances only during active grounds play, not in menus, the city, while hidden/paused or offline. Farm levels accelerate growth; harvesting yields three inventory units and empties the plot.

| Crop | Seed cost | Base active growing time | Base value per harvested unit |
|---|---:|---:|---:|
| Okra | $15 | 60 seconds | $30 |
| Corn | $25 | 90 seconds | $50 |
| Cane | $40 | 120 seconds | $80 |

Visit the market or clubhouse counter to sell actual harvested inventory. Clubhouse pays +20% for okra; market pays +15% for cane; other sales use the standard price. No remote sales, duplicate harvest or credit purchases. Physical plot markers distinguish unwatered, growing and ready states; plots/inventory persist. This does not add seasons, fertilizer, animal breeding, offline growth or independently animated crop-by-crop simulation.

## Four discoverable estate documents

Amber pedestals in the manor, barn and produce market hold Sam's shipping ledger, Ahmad's field notebook, Ronnie's radio transcript and a market relief letter. Stand nearby on foot to reveal READ in the **JOURNAL** tab. Reading records the clue once and keeps its original text in the journal. All four earn an Estate Archivist completion label, not cash or skipped campaign missions. Dialogue is original text, not new voice acting, cutscenes, historical reenactment or a claim that this replaces the original prologue.

## Three survival operations in the original city

Outside the grounds, open **Settings / Journal → Journal → Survival Operations / Photo Mode**. These use existing venue/home approaches and validated routes; unavailable sites/routes are rejected without payment or teleportation. Dispatch only in solo free roam, on foot, after the prologue and outside other active jobs/interiors. Starting a campaign mission while an operation is active is blocked; if another unrelated activity takes over, the operation cancels without pay.

1. **Flooded Porch · Rescue** — reach an existing neighborhood home's safe outside approach, hold interact for four seconds to breach the exterior shelter, then escort a visible resident on foot to the hospital approach. They follow graph-safe steps, wait beyond 300 units, can take nearby infected damage, and must arrive before the final two-second handoff. A shallow local water surface communicates flooding but does not rewrite water tiles or implement a swimming/flood-fluid simulation. Five-active-minute limit; first clear $1,500.
2. **Hospital Blackout** — repair three separate outside switch boxes in order, holding interact for two seconds each. The hospital's emissive materials use temporary owned clones and the world switches to night for the operation; both are restored on completion/cancel. Up to three street infected spawn near the site when the player approaches. Existing hospital geometry, purchases and floor services remain. Five-minute limit; first clear $1,800.
3. **Night Relief Convoy** — approach the marked departure, then escort an actual quest van along a fully checked road route to the hospital. It steers through the existing vehicle physics, brakes for blocked roads/traffic, and only advances when the player stays within 300 units. Mid-route street threats are bounded to three infected. The player can follow in another vehicle, but cannot commandeer the relief van. Completion requires every route node, a living van physically near the destination and a nearby player. Six-minute limit; first clear $2,200. No teleport/spline fallback if roads are blocked.

Operations deliberately have **one first-clear payment per save**. They can be replayed as practice for no repeat cash. Timeouts, death, resident/van loss, cancellation or world changes clean owned props/actors/material clones and pay nothing. Operation progress is not restored after reload; completed IDs persist. Night presentation restores the pre-operation hour rather than awarding an offline time jump. These are bounded solo scenarios, not procedural city flooding, permanent electrical-grid simulation or multiplayer convoy persistence.

## Photo mode

From the city survival dispatch board or grounds business board, choose **PHOTO MODE** during solo free roam. Finish active jobs/rentals first. It pauses simulation, suppresses HUD/weapons and uses a **separate camera**: orbit, elevation, distance 10–160 game units, and field of view 25–90 degrees. It never moves the player or changes saved position. The bounded camera can still intersect nearby geometry; adjust elevation/distance rather than treating it as a collision-aware drone.

**HIDE CONTROLS** / H hides the panel. A touch-accessible **SHOW PHOTO CONTROLS** button restores it; Escape exits. **CAPTURE PNG** renders and encodes locally, then offers an explicit **DOWNLOAD PHOTO** link. Nothing uploads. Unsupported/tainted WebGL canvas capture gives a device-screenshot fallback, not a false success. Closing revokes the temporary object URL and restores gameplay. Download is a browser action, not evidence that a device saved the file. This is not a high-resolution tiled renderer, image editor, social uploader or guaranteed native-share integration.

## Saves, ownership, resource budgets and acceptance

Optional progress lives under `level29.campaign.v2.pursuits`: bounded upgrade/contract counts, six crop plots, inventory, discovered clue IDs, completed operation IDs, tournament count and bounded clean ghost samples. Legacy saves initialize safely. Continue/export/import/cloud-copy paths carry the optional field. New Game resets it. No credentials or account records are stored in the new data. Incomplete service contracts, active races/operations and photo state are not resumed after reload.

The two rivals, one ghost, six plot indicators, upgrade displays and four clue pedestals use a small private prop root created only when visiting the grounds. No new lights, downloaded assets, NPC populations in the leisure scene or per-frame geometry creation. Survival operations allocate only their own limited props/resident/van/at most three infected, and restore modified materials. Photo mode reuses the existing renderer, not a second WebGL context. Physical-phone memory/thermal/FPS acceptance remains required; these are not measured performance improvements.

Run `node --test tests/*.test.cjs` and `pnpm run build`. Focused tests cover bounded save/ghost validation, upgrade costs, crop lifecycle and buyers, held contracts, two AI three-lap runs, ghost interpolation, real runtime fees/payouts/cleanup, clue proximity, rescue escort arrival, three repair switches, convoy destruction/arrival, night/material restoration, photo pause/separate camera/capture fallback/touch restore, and legacy compatibility.

Before merging/releasing: verify the exact PR head in a READY preview, physically travel each generated-city operation route, finish/replay each operation, beat/lose a rival race, save/restore crops and a real ghost, inspect upgrade/ready-crop visuals, test crop/contract touch holds, capture a real PNG, and repeat a sustained session on a physical phone. Local VM/Three/SQL tests and a successful build are not browser-rendered, live-network or device proof. The downloadable iOS source archive is refreshed with the existing pipeline, not compiled/signed or store-released.
