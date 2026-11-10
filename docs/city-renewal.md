# City, festival, roads and retail renewal

## Festival

The Tremé parade's outgoing leg now extends by two additional 256-unit street
blocks (the return leg follows the same walkable network). Extension searches from
the start rather than getting stuck at the former route's cul-de-sac. The generated
city check increased its closed route from 26 to 58 points.

There are 66 marchers, five moving floats (formerly two), and sidewalk spectators
with raised, waving arms. Spectator placement rejects roads, bridges, water,
obstructions and overlapping standing spots. The generated map produced 32 safe
spectator positions. Residents and marchers still share nine render batches, capped
at 104 nearby people rather than creating a full figure per crowd member. Ahmad's
moving target and all existing story checkpoints remain intact.

## Road connections and interstate repairs

Three-tile-wide public connections now serve the Natchez boarding landing and the
**Downtown Parking / Helipad** approach visible in the screenshot. Routes preserve
reserved buildings and activity parcels; water crossings keep bridge tiles even
when overlapping widening passes visit them again. The generated city added 102
road/bridge tiles across these approaches. No existing save is reset.

Interstate changes address specific geometry/support faults:

- Short exit ramps reach street height at their endpoint instead of retaining a
  nonzero drop when their available descent is shorter than 240 units.
- Ground-level windows receive explicit deck pavement rather than skipped spans.
- Four corner deck pads close visual seams and maintain raised support beneath
  outside turning lanes; support and render geometry agree there.
- Piers are omitted at exits and newly connected junctions, as barriers already
  were, to keep surface-level approaches clear.
- Path lengths are cached rather than recomputed on every terrain query.

These are targeted repairs, not a claim that every possible vehicle/device issue
has been eliminated. Tests sample all corner lanes and short ramp profiles; the
real generated-city check found no piers inside the exit-clearance radius. Device
acceptance should drive both directions around all four corners, every ramp and
both new connections, including a long vehicle.

## Natchez casino exterior

A procedural Natchez-style paddlewheel boat is visible beside the actual boarding
landing: hull, three white decks, galleries, chimneys, gangway, casino sign and a
moving paddlewheel. The off-site playable casino interior remains in place so
boarding, gaming, deck changes and Sam's story coordinates stay compatible. The
exterior hides while boarded; it does not replace the separate drivable fishing
boat or require a downloaded third-party model.

## Roadside development

Bounded vacant-parcel planning adds homes, apartments, offices and skyscrapers with
windows, doors, roof details and clear public approaches. It refuses reserved
parcels, roads, bridges, water and unlevel ground. It plans at most 64 parcels; the
current generated map admits **22**: six homes, six apartments, five offices and
five towers. These are exterior buildings/scenery, not newly promised enterable
interiors. Static geometry is batched, and existing moving traffic limits remain
unchanged.

## Mall and Greenmart

The mall grows from 20 to **26** distinct shops, keeping all existing ones and adding
Crescent Pharmacy, Crescent Bakery, Homewares Store, Game Store, Cosmetics Store
and Camera Shop. Bays retain at least 70 units of width in the current mall, clear
40-unit doors, existing stairs, lifts, atrium, and supported thresholds. Displays
now carry multiple merchandise groups and an upper shelf. New props distinguish
cameras/electronics/games, cosmetic/pharmacy bottles, baked goods and housewares.

Both Greenmart floors have additional packaged merchandise, using five shared
material batches per floor over existing shelves rather than obstructing aisles.
Greenmart checkout and the new pharmacy/bakery/homewares counters offer fictional
cash purchases: meals, fruit, water, first aid and protective work vests. Purchases
clamp health/armor, reject insufficient cash or unnecessary refills, and save the
resulting player state. Existing prologue pickups take precedence over checkout.

## HUD

The duplicate objective checklist is no longer displayed over the primary mission
text; its mission state machine remains active. Distance waypoints follow the
measured mission-bottom CSS variable, and projected labels avoid the top HUD and
bottom controls. This retains mission, compass, health, minimap and button systems
without introducing another duplicate objective overlay.

## Verification

- `tests/city-renewal.test.cjs`: connections, bridge preservation, parcel separation,
  extended parade length, cheering sidewalk residents, Natchez geometry, store
  counts/doors, stock batches, purchases, HUD placement, corner support and ramps.
- Existing mall tests still exercise every new and old door, room and floor.
- Generated-map/Three integration checks build the actual city without WebGL:
  22 additional parcels, 26 stores with no blocked shop thresholds, 58-point parade,
  32 spectators, visible Natchez exterior, unobstructed original prologue pickup
  positions and no piers in exit-clearance zones.
- `/game/prologue-review.html` and `/game/city-renewal-review.html` are explicitly
  isolated shared-model reviews, not full-game performance benchmarks.
- The maintained iOS source archive is regenerated with the same runtime changes;
  a new signed native build is still required to publish an iOS app update.
