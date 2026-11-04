# Level 29 vanilla expansion kit — generated, not yet live

## Blocker and scope

Main at `4ed81e618ce2469eacd3d28ef0bd5fb73667264f` still contains committed merge
markers in core JavaScript and app files. The game cannot be validated as a
working integrated app until those conflicts are properly resolved. This kit
DOES NOT select arbitrary conflict sides or overwrite existing slot/fishing/
vehicle/mission systems. It is generated vanilla JS/HTML/CSS and Three.js code
with explicit host adapters, plus a small steamboat material patch.

**Implemented and independently tested:** mechanics, overlay generation and
Three.js asset/collision/height builders described below. **Not complete:**
live-game wiring, production deployment, native source archive regeneration,
complete map-route integration or an actual physical-device playtest.

Do not add these scripts to the malformed game launcher as a supposed fix. After
merge repair, integrate one system at a time, replacing the corresponding old
interaction rather than opening two slot or fishing interfaces together.

## Files / isolated preview

- `public/game/expansion-kit.js`: pure mechanics + foraging mesh generator.
- `public/game/expansion-assets.js`: Three.js roads, casino, escalators, storefronts.
- `public/game/expansion-ui.js` / `.css`: plain DOM overlays, never React/Next.
- `public/game/expansion-demo/index.html`: isolated **temporary-demo-cash** overlay
  preview, independent of broken game scripts. No actual payment URLs or game
  saves. Can be served with a plain static server from `public/game`.
- `tests/expansion-kit.test.cjs`: focused Node tests using installed Three r149.

The application shell already uses Next.js, but NONE of the generated kit/UI
requires or imports React, Next.js or a bundler. No third-party asset downloads.
The fonts are CSS font stacks (`Barlow Condensed`, `IBM Plex Mono`) with local
fallbacks; host may supply its licensed fonts, no network font required.

```html
<link rel="stylesheet" href="expansion-ui.css">
<script src="expansion-kit.js"></script>
<script src="expansion-assets.js"></script>
<script src="expansion-ui.js"></script>
```

## Host adapter contract

Call `Level29ExpansionUI.install(adapter)` once after initializing the game.
Required values/functions:

| Adapter | Contract |
|---|---|
| `THREE` | Existing Three.js engine (needed for customs/mesh builders). |
| `wallet.get()/set(n)` | Read/write **fictional** game cash, not real money. |
| `player()` | `{x, y}` map coordinates or `{x,z}`, `dead`, `car`. Car has `x,y` or `x,z`, `dead`. |
| `health.get()/max()/set(n)` | Player HP. |
| `sound(name)` | Existing `sfx('cash')` / pickup adapter. |
| `isPlaying()` | Only true for active simulation, false when paused, dead, dialogs, loading. |
| `setModal(open)` | Enter/leave a safe paused/dialog game state; restore previous valid state. |
| `releaseControls()` | Clear mouse/touch fire, key/gamepad/joystick states; release pointer lock as needed. |
| `steamboatBounds()` | Current world-aligned deck box `{x,z,w,d}` or null; update for boat motion/rotation. |
| `destinations` | Valid reachable street drop boxes `{name,x,z,w,d}`. Do not use arbitrary blocked coordinates. |
| `spawnZombie(x,z)` | Return actual local combat enemy or null. Use existing safe spawner. |
| `enemyGoal(enemy,x,z)` | Set goal consumed by existing zombie navigation/AI, not direct teleportation. |
| `nearCasino()` | Actual proximity/inside check for local casino interaction. |
| `slab()` | Only at customization station and with owned/current SLAB: `{vehicle,mesh}` or null. |
| `save()` | Existing campaign/vehicle persistence. Persist paint/rim fields if saved by the host. |
| `collisionFree(x,z)` | Optional safe wave spawn check. |
| `rng()` | Optional test generator, default `Math.random`. |
| `products` | Optional merchandise list; details below. |

```js
// `adapter` must be filled with real local state accessors, not placeholder funds.
const ui = Level29ExpansionUI.install(adapter);
function toggleShop() { ui.toggleShop(); }
function triggerHordeEvent(targetMesh, waveCount) {
  return ui.triggerHordeEvent(targetMesh, waveCount);
}
function checkFishingZone(playerX, playerZ) {
  return ui.checkFishingZone(playerX, playerZ);
}
// Existing active simulation loop: dt is seconds, not frames or milliseconds.
// Timers cap each step at .25s. Do not pass elapsed pause time on resume.
ui.tick(dtSeconds);
// Interaction hooks ONLY from corresponding nearby real pickup/service:
ui.openSlots();
ui.openCustoms();
ui.DeliveryMission.pickup('pizza', 120, 800); // or 'chicken'
// Waypoint renderer can read ui.waypoint (the current delivery box).
// On unload / chapter change:
ui.destroy();
```

Modal/container pointer, touch, click, wheel and key events stop propagation.
The host **must** honor `setModal` and `releaseControls`; event propagation alone
cannot cancel an already-held firing input. Escape closes; keyboard focus loops
inside overlays. `destroy()` removes UI/listeners and cancels pending activities.

## Steamboat paddle wheel

`boomcity.js` rim and eight paddle meshes now explicitly use `0xff0000`.
Existing `m.userData.wheel.rotation.z -= (b.v || 0) * .05` animation is unchanged.
Other steamboat deck colors are not changed. Because the containing file still
has pre-existing conflict markers, this is a material patch, not proof that the
current whole script executes. Retain the change when resolving the merge.

## Elevated interstate, exits and collisions

```js
const road = Level29ExpansionAssets.elevatedInterstate(THREE, interstatePath, [
  {name:'mall', path:mallRamp},
  {name:'military', path:militaryRamp},
  {name:'airport', path:airportRamp},
  {name:'penthouse', path:penthouseRamp}
], {height:40, width:120, pillarSpacing:50});
scene.add(road.mesh);
```

Paths contain `{x,z}` world points. All four named exits are mandatory. Main
road is y=40 with cylindrical concrete supports every 50 path units. Exit paths
descend continuously from 40 to 0. Returned `surfaceAt(x,z)` gives driveable
height; returned `edgeBlocked(x,z,radius,height)` gives edge collision. Register
both with existing vehicle/player terrain and collision queries; rendering the
mesh alone does not create physics. Plan all four ramps against current mall,
base, airport and penthouse frontage. Do not use guessed coordinates or route
through an occupied building. Pillar meshes are scenery unless host registers
pillar colliders too. This builder is not yet a replacement of the live loop.

## Casino / mall assets

`casinoInterior(THREE,{x,z,rows:2,columns:5})` returns rows of slot meshes,
a central steel cylindrical vault door/wheel, and solid footprint boxes.
`escalator(THREE,{x,z,from:0,to:56,length:170,width:30})` returns tread/handrail
meshes, `heightAt`, `blockedEdge` and two landings. Hook these into existing
mall floor selection and collision lists, and cut the upper slab opening before
using. Static steps do not move; walkable elevation comes from the height hook.
`storefront(THREE,{x,z,width:90,label:'BOOK STORE'})` generates distinct framed
glass panels around a 40-unit clear opening; combine with the existing named
sign and twenty specialized shop interiors. Existing interiors remain intact.

## Casino slots (fictional cash only)

`spinSlots(wallet,bet,rng,sound)` validates an integer stake 1–10,000, debits it,
randomizes three symbols, pays gross 12× for triples or 2× for any pair, nothing
otherwise, and plays `'cash'` only on a winning payout. The overlay shows rules,
reels and balance. Unaffordable/invalid bets do not change funds. No real-money
payout/withdrawal or external payment calls. This is new generated slot logic,
not automatically connected to BoomCity's existing slot function.

## HOUSTON SLAB customs

The modal has body/rim color pickers and a $500-game-cash apply action. The
customizer clones touched materials so other cached vehicles do not recolor.
Tag target meshes `userData.customRole = 'paint'` / `'rims'`, or use material
names `vehiclePaint` / `rimMetal`; existing `mesh.userData.paint` is recognized.
Missing paint/rim targets, non-SLAB, invalid colors or insufficient funds leave
money/materials unchanged. Apply `vehicle.col`, `vehicle.rimColor` in the host's
model rebuild and saved-vehicle code so selected rims persist after respawn.

## Horde survival

`HordeEvent` / UI `triggerHordeEvent(mesh,waves)` snapshots world X/Z target,
accepts 1–10 waves, prevents concurrent starts, spawns 5 then 7 etc., assigns
converging enemy goals, waits for each whole wave, and pays 500 per survived
wave once at final completion. Player death, leaving 800-unit area, 10-minute
timeout or a fully blocked spawn cancels with no reward. Only the host owns
combat damage/kill attribution; the kit never manufactures kill credits.

## Fishing

`FishingManager` supports CAST LINE → random 3–8s waiting → bite cue (5s window)
→ hold/release reeling. Holding increases tension/progress, releasing cools
it. At .95 tension line breaks; at full progress one catch is paid once.
Catfish (35 weight/$180), Alligator Gar (8/$650), Koi (10/$400), Goldfish
(22/$100), Mosquito Fish (25/$45). All are **game cash**. The UI has a red-zone
tension meter and keyboard/pointer hold handling. Off-deck/vehicle/death hides
and cancels fishing. `checkFishingZone` checks proximity to a deck box edge.
For rotated boats supply a conservative current deck footprint or replace the
host hook with a local-space deck check; do not use the old hardcoded pier.

## Delivery

`DeliveryMission.pickup('pizza'|'chicken',seconds,reward)` starts once, selects
a valid host destination, counts down only when ticked, exposes waypoint/timer,
and pays only when an actual live vehicle enters the destination box before
expiry. Timer zero fails with no payout; completion cannot pay twice. Hook to
actual food pickup events, not an always-available free reward button.

## Heavy SUV / mud

`SUV_PROFILE` has maxSpeed 6 (configure ordinary car baseline above 6), mass
2600, acceleration .1, grip .82, health 350. Register as heavyDuty=true.
`terrainModifier(vehicle,position,zones)` returns speed/handling factors:
SUV .90/.95 on swamp/mud, ordinary car .38/.45; clear ground 1/1. Apply these
to base values without compounding every frame. Map mass to the existing
collision impulse solver; setting a config field alone does not implement
momentum or permission to drive through solid buildings. The live engine has
not yet been modified to consume these new fields.

## Foraging

`generateForage(THREE,scene,zones,{ground,valid,rng,count})` builds grapevines,
banana and fig trees with separate fruit groups. Zones use `{x,z,w,d}`; ground
returns actual world Y; valid rejects water, roads and occupied paths. Set the
result with `ui.setPlants(items)` for a nearby harvest prompt. Interaction caps
HP, hides fruit and plays pickup; fruit returns after 120 active seconds. No
healing at full health or remotely; pause time does not regrow fruit.

## Merch Shop

Four default cards: Level 29 Challenge Coins, Vehicle Air Fresheners, Key Tags,
and Snack Trays and Apparel. Each uses a placeholder image, title, price field
and a real `<a href>` BUY NOW element. Defaults intentionally show PRICE TO BE
CONFIGURED with disabled `href="#"` links. No guessed prices or payment URLs.
Pass your public checkout links (not secret credentials):

```js
adapter.products = [
  {title:'Level 29 Challenge Coins',priceLabel:'YOUR PRICE',paymentUrl:''},
  {title:'Vehicle Air Fresheners',priceLabel:'YOUR PRICE',paymentUrl:''},
  {title:'Key Tags',priceLabel:'YOUR PRICE',paymentUrl:''},
  {title:'Snack Trays and Apparel',priceLabel:'YOUR PRICE',paymentUrl:''}
];
```

Only configured HTTPS links become active; they open the external provider in
a new tab with `noopener noreferrer`. No card collection, fake checkout,
webhook/order fulfillment or claim that clicking completes a purchase.

## Checks and remaining work

Nine focused Node regressions pass: slot debit/payout, fishing timing/tension/
one-time reward, delivery car-only/expiry, horde staging/no empty reward,
SUV modifier, cloned paint/rims, fruit health/cooldown, bridge pillars/exits/
collisions and casino/escalator geometry. Local jsdom exercise confirms real
SPIN click updates demo balance, four disabled merch links, zero leaked clicks,
fishing zone show/hide and clean UI destroy. Full game regressions and build
remain blocked by existing merge markers. Visual checks apply only to the
isolated demo if available, not the broken main game. No native archive rebuilt
from conflicted source; no production merge or promotion.
