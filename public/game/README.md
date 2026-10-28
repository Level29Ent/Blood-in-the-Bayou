# Level 29 · Blood in the Bayou

The existing browser game now includes the Level 29 estate and world-art expansion. Serve this directory with any static HTTP server and open `index.html`; no build step is required.

## Mansion and penthouse

- **One mansion:** Only the primary Level 29 property has a fortress, security checkpoint and mansion sign. Other neighborhood safehouses remain available.
- **Ronniebaby:** Lives in the top-floor penthouse, with five distinct adult, fully clothed party guests.
- **Elevator:** Walk to the entrance of the mansion building and press U, or tap the PENTHOUSE button. Use the same elevator area upstairs to return to the lobby.
- **Mission access:** Walk around the lounge table toward Ronniebaby to open the existing mission conversation.
- **Interior:** Purple upper walls, a broad gold stripe, pale trim, dark green lower walls, two original logo artworks, a marble-patterned floor, lounge, bar and city-facing glazing.

## Vehicles and world

- **Fifteen new types:** City Compact, Sport Hatch, Touring Wagon, Bayou Crossover, Full-Size SUV, Executive Sedan, Stretch Limo, Classic Muscle, Open Roadster, Family Minivan, Delivery Step Van, Trail 4x4, Rally Coupe, Work Flatbed and Recovery Tow Truck.
- **Parking:** The new models reuse existing spaced parking positions. The expansion does not increase traffic density.
- **Hidden packages:** Sixty additional supply cases spread across the land map, in addition to the original ten. New cases avoid road tiles, venues, apartment towers and blocked positions.
- **Water life:** Twelve catfish and eighteen crawfish inhabit the shallow water near the pier. Both species are also fishing catches; press I or tap FISH by the water.
- **Career interiors:** Additional themed fixtures for the garage, armory, detailing bay, business, safehouses, bank, grocery, gym, hospital, police, gas and fire locations.
- **Equipment:** Plate-carrier armor pickups with straps, MOLLE webbing, pouches and buckles; detailed weapon models with fine metal surface relief and improved small-screen framing.

## Preserved behavior and limitations

Ronniebaby's uploaded voice clips, existing road layout, mission extensions, driving changes, spaced traffic, 30-second cash cleanup and multiplayer snapshot throttling remain in place. Multiplayer snapshots now also carry player floor height for upstairs avatars.

Car music uses the Level 29 Spotify playlist only. Spotify's own playback, account and browser restrictions still control playback and shuffle; this game does not override them.

Graphics are procedural and stylized, with added shape, material and environmental detail rather than photorealistic scanned assets. Multiplayer smoke testing covers two connected browser sessions, not a six-device load test or a guarantee of frame rate on every phone.

## Street access and survival activities

- Remaining houses, towers, helipad buildings and the cathedral have walk-in ground-floor businesses. Monument props (the dome, water tower and memorial) are not occupiable buildings. Upper floors of converted towers remain scenery.
- Every business and shelter gets a walking route to a road or bridge, avoiding other building footprints and water. Trees, rocks and parked land vehicles are cleared from those routes; doors still open automatically.
- Neighborhood safehouses have seating, wall art, lighting and a supply station. Stand by the supply station for three uninterrupted seconds to find $120 and recover up to 15 health, once per neighborhood safehouse per browser save. Search progress travels with exported save codes.
- Zombie collision and spawning reject all building footprints, even with doors open. Zombies migrated into a building are removed without a kill reward.
- **Fishing:** Press I or tap FISH beside water or on a stopped boat. Wait for a bite, then press again in the gold zone to hook. Tap to reel, pausing between taps to lower tension; the line snaps at 100% tension. Moving away cancels the cast. The professional rod improves the hook window and reel strength.
- Boat fishing favors offshore catches and pays 20% more. Every fifth landed catch earns a $350 angler-contract bonus. Bobbers, fishing lines and expanding ripples show the cast in the world; moving boats leave pooled foam wakes instead of smoke.

Run the dependency-free regression suite with `node --test tests/*.test.cjs`.

## World and equipment upgrade

- Former street shelters rotate between **smoke-and-supply shops**, **community hospitals** and **fish markets**, with distinct signage, map letters and interior fittings. Approach the station and press U / USE. Secondary safehouse floors no longer remain solid on the tile grid. Existing neighborhood safehouses keep rest/heal/checkpoint services and now offer the three-second supply search instead of the old street shelters.
- Hospitals sell emergency care and permanent trauma training. Smoke shops sell precision grips, match ammunition and equippable teal/bronze finishes for the new firearms and dashboard. All purchases use earned **in-game cash**, not real money.
- Fish markets buy unsold catches for a bonus on top of existing catch rewards; coolers improve the sale price. Offshore tackle increases reel strength. Buy a personal launch and request delivery in clear Gulf water; its B marker identifies it, and an active boat cannot be duplicated. Ownership persists; after a reload or loss, request a free replacement at a market.
- **Bayou SMG (6)** and **Ranger Carbine (7)** join the weapon wheel, mobile weapon cycling and armory. The SMG trades precision for rate of fire; the carbine has longer-range, penetrating rounds. Purchases and ammunition use the existing campaign save.
- Aircraft now have tapered fuselages, swept wings, cockpit/cabin windows, engine intakes, undercarriages and navigation lights. Driveable boats gain teak deck seams, rails, cleats, fenders, lights, a helm and propeller; the car-detail pass no longer attaches wheels to boats.
- Cockpits gain functioning speed/rev needles, vents, center display, climate controls, shifter and mirror; exterior car cabins gain door cards and seat seams.
- Mountains gain layered rock texture/bump detail and a varied snowline. City trees gain branching trunks and asymmetrical crown lobes; mountain pines gain layered crowns. These remain procedural, stylized assets, not photorealistic models.
- Pier edges gain cleats, liferings, seating, bins and fishing guidance while keeping the central deck clear.
- The confidence course has visible stations and proximity-based rope/wall tapping, timed hurdle/crawl drills and a narrow balance alignment challenge. Hold progress resets when leaving the station; climb taps are rate-limited. Existing medals, timers and record rewards remain.
- Trading ownership, equipment finishes, catch inventory and safehouse search claims travel with exported save codes. Storage is browser-local, not a server-authoritative economy.
