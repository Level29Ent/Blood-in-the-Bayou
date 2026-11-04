# Armed gangs, expanded routing, zoo/base activities, rails and stations

## Gang presentation
Three more confrontational warning lines with profanity, lower-pitched/faster
browser speech delivery. Proximity/mute/pause cancellation retained. Not studio
voice recordings; aggressiveness is wording/synthesis settings, not an actor
performance guarantee. Foot crew and drive-by passenger hold procedural carbines
with receiver, barrel, stock, magazine/grip and muzzle node. Raised arm pose and
flash/recoil synchronized to actual lastShot timestamp, not initial cooldown;
foot tracer starts at model muzzle. No damage/stat escalation or slurs added.

## Mission map policy
Shared campaign point generator now considers added homes,29Land boardwalk,
SunsetBeach approach,military gate/command,mall,airport access and metro street
entries in addition to old venues/farm. Normalize to nearby road/nav points,
require car-width clearance and ground height; reject entire zoo plus320-unit
buffer for combat safety. Cache candidate set per city. Respect requested min/max
radius when candidates exist, validate fallbacks and vary by mission index.
71 safe points in actual current world check. Powell stage placement and initial
phone dispatch use same candidate set; aircraft stages still use airport and
rescue/mission rewards and narrative-specific business stops remain intact.
This is map-routing policy for all210 campaign IDs, NOT210 individually rewritten
story scripts, not relocating prescribed shop counters or existing save progress.
Checks generate a point for every ID; full combat/race/rescue completion remains
untested in browser. Zoo interiors deliberately excluded from hostile missions.

## Zoo / base features
- Zoo keeper field guide:visit all8 habitat signs during tour,one persisted$800
  game-cash reward after distinct8 visits;repeat visits don't duplicate reward.
- Added habitat shade shelters/pools,conservation/keeper kiosks and solid benches.
- Base5-target marksman course:45active seconds,uses own actual firearm/ammo,
  aimed ray/sphere hit before opaque obstruction,targets drop,5hits pay$350,
  retry after timeout/leaving. No free ammo or virtual hits from misses.
- Field medic:actual$100 fictional-cash debit for health restoration;reject full
  health/insufficient funds. Physical aid tent,range backstop and sandbag trim.
- Existing Powell operations/troop routes retained. Activities single-player.

## Road / station defects
Rails previously horizontal while decks rose/fell. Rail mesh now uses same
orthonormal slope basis/end heights as deck. Long exit paths subdivide24units
before sampling,matching curved/stepped height provider instead of spanning
entire grade with one straight slab. Rail segment collisions match rendered
edges on exit ramps/main deck and ignore different height layer;existing exit
openings remain. Every interstate not manually driven, no universal-road claim.

Metro menu now uses actual shop pause state rather than unsupported custom state,
with menu flag to close/restore only owned modal. Visible entry steps at portals.
Clear street-return search uses player-sized collision and ground height;rejects
blocked station entry,validates arrival return. Existing18s carriage trip remains.
This is still portal/platform entry,not a newly walkable stairwell from street
to the reusable underground room. Prior metro/park geometry and save state remain.

## Checks
343Node regressions pass before final publication;focused gun geometry/pose,
nonduplicating8-stop reward,target obstruction/misses and map policy tests. Local
full-launcher scene check builds new zoo/base fixtures,validates all210 IDs have
safe generated point,71candidates across expanded districts,clear3street exits
and unblocked range-start. Earlier zoo/beach/station/Greenmart checks still pass.
Build/TypeScript/native ZIP and deployed preview evidence in PR. No claim every
mission,rail,gang encounter or station has been browser-playtested.
