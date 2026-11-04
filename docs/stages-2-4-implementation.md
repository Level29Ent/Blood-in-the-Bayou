# Stages 2–4 implementation: playable subset, not full completion

This change implements several outstanding systems. It is deliberately NOT a
claim that every item in Stages 2, 3 and 4 is finished. Do not equate variants,
menu mini-games or a config field with all requested physical systems.

## Stage 2 integrated

### Ten additional firearms

Bayou 9mm, 29 Revolver, Machine Pistol, Tactical 12, Bayou Coach Gun, Battle 7.62,
Level 29 PDW, Gulf Precision, Swamp LMG and Triple Burst. Actual projectile fire,
reserve-ammo debit, distinct damage/cadence/spread/pellets, magazine depletion
and timed automatic reload. World/first-person models are original simple
procedural firearm geometry, NOT high-fidelity ten separate imported assets.

B / touch BOUNTY WORKSHOP inside an armory opens earned-cash purchases/restock.
Original U armory/services remain. Two wheel pages prevent 20 entries overlapping;
scroll while holding Q changes pages, arrow keys cross pages, touch WEAPON still
cycles owned entries. Existing ownership/arsenal save includes the new IDs.

Scopes reduce spread/recoil and slightly increase damage; barrel finish boosts
damage; suppressor reduces recoil/noise-heat and slightly lowers damage; extended
mag doubles mag size and speeds reload. New-gun view models show corresponding
attachment shapes. These stats apply to the **ten new guns only**, not existing
M240/shotgun/etc. Stats derive from immutable base and don't compound each frame.

### Ten vehicle variants

Bayou GT, Slab Executive, Rescue 4x4, Courier 29, Ranch Wagon, Trail 29, Night
Coupe, Metro Compact, Interceptor 29 and Bayou Hauler. Each has separate ID,
name, speed/acceleration/grip/health/price. Reuse the matching existing detailed
coachwork (sports/Cadillac/SUV/delivery/wagon/offroad/coupe/compact/police/flatbed),
not ten wholly new body assets. Purchase delivers to a tested nearby clear road;
owned purchase flag avoids treating the new vehicle as stolen.

### Garage / safehouse

B / touch WORKSHOP in garage while in a car allows earned-cash paint, matte
finish, tinted glass, gold rim finish, lightweight neon underglow plane and
performance tune. Tune changes speed/grip once; saved type-level choices apply
to later cars of that type. These are type-wide configs, not a new individually
registered vehicle ownership database. Tint/rim materials clone to avoid changing
other cached meshes. Gold finish is not multiple rim geometry styles. Underglow
is a translucent colored ground plane, not an actual projected point light.

At a safehouse B opens separate cash/ammo stash and decor. Deposit/withdraw
$500 or store/take 10 reserve rounds. No infinite M240 ammo can be deposited.
Wallpaper panel, furniture, film sign and four coin meshes are purchase-once
saved upgrades. A physical modeled wall safe appears in safehouse rooms. This
stores cash and reserve ammo, NOT whole spare weapon ownership or arbitrary
rare item inventories. Safehouse property purchasing remains unimplemented.
Owned gun racks expand to the new firearms with bounded wall rows.

### Working rearview

A true 256×96 WebGLRenderTarget is rendered using a vehicle-mounted backward
camera, displayed on a cockpit mirror plane with horizontal flip. Updated every
third simulation frame, far range 700, cockpit mode only, not boats/dead/chase.
Own-car exterior is temporarily hidden. Render target, viewport/scissor, test,
autoClear and visibility are restored in finally. Dispose on renderer/scene
replacement. This costs an extra render pass; no phone-FPS guarantee.

## Stage 3 integrated subset

- Wanted state with 0–5 stars, visual contact flag, cooldown and notoriety
  counter. Stealing unowned cars/attacking police cars/officers triggers heat.
  Police uniformed foot NPCs scale to two per star, navigate on existing road
  graph, check line of sight and attack on cooldown. Losing contact decays stars.
  No police-cruiser pursuit/roadblock network, civilian population damage hooks
  or media helicopter/paparazzi system is implemented.
- Existing damaged/burning vehicle incidents can dispatch up to two responders
  (ambulance and utility/fire-response vehicle), travel toward the incident
  using existing driving collision checks, stop and expire. This is a basic
  response attempt, NOT full firefighting/triage/rescue/siren/route AI. No actual
  new firetruck model is claimed.
- F8 bonus downtown bounty dispatch and F9 night-only heist dispatch: go to a
  valid street point, eliminate marked enemy wave, return to source for one
  reward. Active countdown and D waypoint; death/timeout clears. Heist pays
  more and increases wanted level. Targets are existing combat zombie enemies,
  not named human targets or a vault robbery animation.
- LOCAL JOBS / ARCADE button (F7) in existing cafe/garage/nightclub/studio/safehouse
  opens venue-specific tasks. Garage four-checkpoint vehicle time trial, cafe
  carryout delivery and night smuggler run: actual timed vehicle destinations,
  one completion reward, solo only and no concurrent local job.
- Nightclub has paid timing-based sparring (3 successful strikes before 2 misses),
  safehouse has paid dial timing. These are functional UI mini-games, NOT an
  enterable underground 3D cage/hand-combat arena or advanced safe-cracking.
- Studio has existing-radio browsing; no fake paid beat-pass unlock. No new
  recorded audio tracks are created/unlocked by this patch.
- Studio has two modeled arcade cabinets; activity menu contains plain external
  Godlight.app and JesterRush.app anchors opening safely in a new tab. The
  external games' availability is not controlled or verified by this patch.

No gangs/turf/graffiti/drive-by system, purchasable real-estate flow, fuel/toll
transaction system, physically new food-truck strip or underground fight room
is implemented here. Existing locations are reused; not replaced by new labels.

## Stage 4 integrated subset

Major mission starts and entries into existing venue types show a noninteractive
letterbox/title overlay with existing dramatic cue. Business transition is a
HUD letterbox/title, NOT a physical camera zoom or a teleport/fade-spawn system.

V invokes two seconds of 0.4× **solo simulation** focus with a 12-second real-time
cooldown. High-speed steering can also request focus. Multiplayer stays 1×.
The fixed-step accumulator consumes the scale; render/audio loops remain real
speed. This is actual shared simulation slowdown, NOT animated dive locomotion
or a complete stunt/drift scoring system. Existing weapon delay and mission
frame timers slow with simulation; world clock/real-time cooldown use real time.

Medium/high graphics adds sparse low-opacity bayou ground-mist points at night/
dusk. This is particle mist, NOT true volumetric scattering or god rays.

Recorded commercials/station IDs, impact chromatic aberration/film grain/new
postprocess pipeline, projected-shadow headlights/brake light spill, reactive
water shader/ripples/tire decals and soap-suds carwash shader remain outstanding.
Real radio audio assets or a supported production path, and actual merchandise
prices/checkout URLs, are still needed for those specific requests. They are not
an excuse to claim independent unimplemented coding is complete.

## Evidence / use

B workshop is location-gated, F7 local activities, F8 bounty, F9 night heist,
V focus. Existing services retained. New vanilla panels stop pointer/touch/key/
wheel propagation and clear held fire. Stash/customization persists separately
under level29.progression.v1 while campaign save stays intact. No ad/payment
activation, no new reset of old progression or direct production promotion.

311 Node tests passed before final small UI/asset tweaks; final totals recorded
in PR. New tests cover ten-item catalogs, immutable attachment stats, actual
new-gun projectile/ammo/mag reload, wanted visual/cooldown caps, focus cooldown,
backward camera pose and real render-target/restored GPU state using mocked
renderer. Actual-launcher local DOM/Three geometry harness fires all ten guns
with expected ammo/pellets, constructs all ten vehicle variant meshes, and makes
an actual workshop ammo purchase with debit. It uses a no-GPU environment-map
stub, not a rendered geometry proof. Existing Greenmart/full map stack still
passes. Production/build/type/native/preview checks are recorded in PR.

Do not merge without broader playtesting: police encounters, reflector cost,
vehicle purchases and many interacting timers can affect gameplay. No claim
of physical-phone performance, audible recording production, full Stages 2–4
completion or all-path save recovery until separately verified.
