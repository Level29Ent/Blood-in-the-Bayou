# NOLA services — default-everyone foundation release

## Scope and controls

This PR is the **first playable foundation**, not the entire requested city expansion. New service desks share existing business premises and use their safe exterior pedestrian approaches. No claim of nine newly authored physical buildings. Open **Pause → NOLA BUSINESSES / CITY MAP**, follow the corresponding colored icon, then E (default remapped interaction), legacy U, or the dedicated touch button at its approach. Original premises services remain reachable through **ORIGINAL BUSINESS SERVICES**. Existing input mapping, quick slots and first-/third-person controls stay intact.

No optional Survival Mode gate. Rules apply by default going forward, with existing peaceful prologue scripting and solo-only activity restrictions respected. Old campaign snapshots without NOLA data start with empty service progression; **no retroactive deduction, payroll debt or offline charges**. The state is in the existing campaign snapshot beside cash, preserving Continue and Save Code. New Game resets it.

## Playable now

| Request | This release |
| --- | --- |
| Creole Voodoo Apothecary | Desk at Moonlit Botanica; resistance (-25% nearby zombie bite damage/120s), speed (+12%/90s), projectile damage (+20%/90s), up to 3 revive charms. Active buffs cannot be bought repeatedly. |
| Cajun Boil & Po’Boy Shack | Walk-up service at Jojo’s existing premises: gumbo +45 HP/$90, crawfish +65/$120, po’boy +30/$60, capped at max HP. Food buffs stamina regeneration for 120–240s. |
| Real estate | Apartment/shotgun/cabin deeds at existing district arrival points, three upgrade levels, capped cash lockers, active-play rent accrual and paid safe travel. No new enterable house construction; original rare-item property lockers and bank stay separate and protected. |
| Mercenary / bouncer | One bodyguard or squadmate, $500 sign-on and $250 each five active-play minutes. Follows pedestrian network, fires with line of sight at non-story zombies, takes contact damage, dismisses without debt when unpaid. No driver automation. |
| Tailor & Ink | Link to existing 100-item wardrobe at Sheldon’s; $500 vest grants 75 armor, one $750 crescent-ink purchase adds a visible forearm mark to wardrobe avatar and +5 service respect. No new 100-item catalog or NPC intimidation dialogues. |
| Courier / smuggler depot | Existing warehouse hosts repeatable medical and contraband vehicle deliveries. Pick up on foot, drive a land vehicle to the destination, stop, exit, hand off. Distance-scaled timer; contraband adds heat and a bounded runner obstacle encounter. Failure/death/abort pays nothing; no fee. |
| Salvage | Existing scrap-yard desk converts nearby unowned/dead non-quest/non-dealer wrecks to metal; exchanges 20 finite spare pistol rounds for 2 metal; 12 metal unlocks a +2-damage upgrade to the existing bat strike. Not new chainsaw/flamethrower simulation or equipped-gun destruction. |
| River transit | Paid water-taxi dispatch at Seafood & Bait to safe district approaches. Instant travel with strict activity/heat/interior restrictions; no drivable ferry or hijack mission. |
| Pyrotechnics | Freight-depot desk sells existing flash and smoke utility charges, each capped at six; existing F8/F9 deployment. No explosive parade float or new flare-gun model. |
| Impact feedback | Up to 16 short-lived damage numbers and 25ms solo-only hit-stop gated at >180ms intervals; existing hit marker/shake/particles retained. Not new directional particle rendering or distinct new reload animations. |
| Zombie adaptation | 7% screamer and 5% armored selection before existing types (outside prologue/multiplayer). Screamers alert nearby existing non-story zombies without spawning extras. Armored brutes use existing military silhouette and +50% HP. Original runners/brutes remain. |
| Death stakes | Drops 20% of pocket cash, plus existing up-to-$500 hospital bill. Drop is marked '$', recoverable once within five active-play minutes. Bank and property lockers remain safe. Old free-$100 death drop is disabled under these default stakes. A charm intercepts lethal non-prologue single-player death, grants 35 HP/120 invulnerability frames, and is consumed; avoids double billing/drops. |
| District control | Three infested-district contracts at safe road approaches; three waves including existing brute leader. Player must defeat all tagged enemies; despawn/interruption cannot complete it. Each district pays $4000 once, +3 respect and unlocks 10% tonic/food discount. No re-enabled rival gangs or novel mutated boss models. |
| Starter guide | Thirty-active-second contextual checklist for moving, firing, visiting a business and taking a job; coexists with existing mission tracker and peaceful prologue. |
| Map / waypoints | Interactive map in service directory with colored business icons, tap-to-select clear walkable point, keyboard-accessible location buttons, GPS marker/direct-bearing line and existing minimap blips. Not a new corner minimap or turn-by-turn routing. |

### Stamina

Sprint drains 18/sec from a 100-unit meter; non-sprint regeneration 14/sec, or 24/sec with meal. Exhaustion reduces sprint-speed component to walking, without slowing ordinary walking. Existing endurance/survival perks and speed elixir remain multiplicative. Active-play clocks pause in menus; no offline rent/payroll. Current crew/delivery/combat encounters are deliberately not resumed from serialized entity references.

### Costs and persistence

Deeds: $8000 apartment, $12000 shotgun house, $18000 cabin; two upgrades cost half original price each. Locker capacity $5000 × level. Rent accrues $100/$150/$225 × level per five active-play minutes, capped at $100,000 uncollected; collect manually at office. Travel $75 from office or $125 water taxi. Heat >=2, vehicles, active missions/jobs and remote/interior modes block teleportation. Prices are fictional earned game cash, not real-money charges.

Death drop and unfinished missions are session-local; leaving/reloading loses an uncollected dropped amount and aborts current contract/crew. No further crew payroll after dismissal/load. No replay of completed district payouts. Browser storage failures use existing warnings, not a promise of persistence without working storage.

## Still not implemented from the full request

- St. Roch spectator boxing/zombie cage and gator-wrestling arena or wagering simulation.
- AI getaway drivers, per-mission contracts and true in-game-hour crew billing (this release uses disclosed five-minute cycles).
- Drivable Mississippi ferry, river-defense hijack encounter, armored parade-float vehicles, new fireworks/flare-gun projectiles.
- Chainsaw and flamethrower weapons, custom weapon reload/sound/vehicle-handling overhaul.
- New district-specific mutated boss art, rival-territory system, NPC intimidation behavior, busted-specific cash penalties.
- Dynamic swamp/siren/club ambient layers and combat/chase music transitions.
- A replaced corner minimap, turn-by-turn GPS road path, or new universal Tab inventory/map mapping. Existing controls and menus are retained.

These need subsequent authored gameplay and integration work; do not describe this PR as the complete requested expansion or quietly substitute menus/scenery for these mechanics.

## Tests and verification boundary

Pure-core and VM runtime tests cover finite costs, repeat-buff denial, charm cap/consumption, HP/stamina limits, bounded property storage/rent, payroll/no-debt, invalid/prototype IDs, normalized checkpoints/Continue/New Game, paired cash+state saves, real panel transactions, remote-shop rejection, default death costs/no-repeat recovery, projectile-only damage boost, story exclusions, district wave completion/one-time rewards, delivery stopped-vehicle/foot handoff, and existing prologue/neighborhood/source integration. Dynamic service node resolution uses real semantic venue tags and graph/collision checks, never invented coordinates; unavailable desks are omitted instead of unsafe parcel creation.

Passing tests and build do not prove generated-city desk availability, route reachability, full mission playthrough, physical-device performance or rendered UI. PR records actual validation/deployment state. No auth/billing/domain/protection changes or external assets added.
