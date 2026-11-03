# Mall circulation, twenty stores and police night patrol

## Stairs and doorways

The old stairs were disconnected angled meshes and tread strips; movement only
changed levels through U-lifts. They also ran through shop rooms. The upper
atrium used solid exclusion rectangles very close to shop doorways.

Replace them with two dedicated side flights (ground→second on west side,
second→third on east). A bounded stair state follows the actual walkable slope
continuously; reaching a landing changes the active floor and collision list.
Rail boundaries prevent sideways exits midway; upper floor slabs are cut at the
stair wells rather than covering the stair tops. U-lifts still cycle levels.
Leaving the mall or using a lift clears stair state.

Stores have separate north/south enclosed bays with inward-facing 40-unit
entrances and supported circulation space between doors and atrium. Counters
are at the rear, not in entrances; doors and raised neon labels face the correct
corridor. The mall remains in its existing parcel; no neighboring businesses
are deleted. Directory (7 ground / 7 second / 6 third):

1. Bayou Fashion
2. Tech & Gifts
3. Barber Shop
4. Bike Shop
5. Toy Store
6. Magazine Store
7. Fish Aquarium Store
8. Furniture Store
9. 29 Cuisine
10. Book Store
11. Shoe Store
12. Greentown Plant Store
13. Bayou Burgers
14. Bayou Coffee
15. Luxury Collection
16. Executive Talent
17. Jewelry Store
18. Sporting Goods
19. Music Store
20. Art & Craft Store

Specialized displays include barber chairs/mirrors, bicycles, toys, books,
magazines, shoes, outfits, furniture and the existing plant/aquarium fixtures.
These are walk-in browsing spaces, not twenty new shopping inventories. The
existing 29 Cuisine $60-game-cash/+50-health service remains functional; this
patch does not imply player haircut, bike ownership or new inventory systems.

The central ground-floor food court has seating, a solid fountain basin and a
transparent falling-water sheet with 18 animated streams. Animated meshes stay
out of static batching and pause with gameplay. It is a lightweight effect, not
a fluid simulation. Food counters remain on the second floor.

## Night patrol and clock

A police-station-centered helicopter circles at an altitude above nearby roofs.
It has animated main/tail rotors, an actual non-shadow-casting spotlight and a
transparent depth-tested visible beam. Every six flight seconds it selects a
different living nearby zombie when available; otherwise it searches the ground.
It does not kill zombies, award kills, change missions or simulate police combat.

Patrol launch interval is 420 **active gameplay seconds**, measured start-to-start.
The first patrol waits until due and nighttime; a patrol lasts 90 active seconds.
Daytime eligibility is deferred until night. Do not start within 90 seconds of
dawn, so a full flight fits before daylight. Pauses/menus do not advance time.
Rebuilding the aircraft for a map does not reset the interval scheduler.

The bottom-center DAY / HH:MM clock reads the existing atmosphere clock, not
system time. Its 20-real-minute full day starts at 08:00, and the day number
changes at midnight. The clock, water and patrol share active-game time. No
extra top-right menu controls and no external dependencies are introduced.

## Evidence and remaining limits

248 Node tests pass. New behavior coverage includes actual stair ascent/descent,
continuous height, all twenty player-radius doorways with supported floors,
animated unbatched waterfall pausing, full patrol duration and repeat interval,
daylight/dawn deferral, target changes with no damage, and clock formatting.
Existing lift, room wall, cafe debit, mission, duplicate-script and HUD tests pass.

A local actual-launcher DOM/Three harness walks a player through every doorway
and both stair flights up/down using the full move/collision wrapper stack,
including traffic/landscape/indoor boundaries, and confirms 18 water streams.
This is scene/code evidence, not WebGL visual proof. Production build,
TypeScript no-emit and native packaging checks are recorded in the PR. Existing
Next.js security warning remains unresolved; upgrade separately. A new signed
iPhone build is needed for installed apps. Preview/device playtesting and exact
screenshot appearance remain unverified until checked in the browser.
