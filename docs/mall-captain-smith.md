# Garden Mall and Captain Smith

## Mountains → gardens

The connected-world generation now converts its mountain landmarks into garden
plots before height generation captures them. No mountain features remain for
either terrain collision or either mountain mesh renderer. Former summit chapter
labels now say **Level 29 Gardens**; the legacy isolated mountain-biome height
function also returns level ground. Existing forest terrain, water, streets,
missions and named businesses remain.

A deterministic clear parcel near the former mountain areas hosts the mall.
The allocator protects full activity lots, civic buildings, roads, water, airport,
farm, court, cemetery and Natchez pier. Zoning gives the mall its own reserved
landscape parcel and later scenic-road/cemetery passes respect it. If no clear
site exists, generation reports the failure instead of building over a landmark.

## Two-story mall

**MALL** in the HUD enables an M direction marker. Walk through the front opening.
The ground floor has Bayou Fashion and Tech & Gifts displays; upstairs has Home &
Living and Garden Cafe. At the marked rear lift, press **U / USE** to switch
floors. The upper floor has a closed front boundary to prevent walking into
midair. Collision furniture, camera elevation and lift landing change together.
Returning outside resets the selected floor.

Grounds include a stone entrance path, rounded shrubs, flower planters, seating,
round fountain basins and planted gardens in former mountain plots. No new
postprocessing or external landscape assets are required.

At the upstairs cafe counter, U buys a meal for **$60 fictional game cash** and
restores up to 50 health; full-health players are not charged. The other retail
areas are display/browsing spaces, not new paid storefronts or a new inventory
system. The lift is used instead of a new stair-climbing physics system.

## Captain Smith

The supplied photo is stored as `characters/captain-smith.jpg` and used in the
police service panel and Captain Smith's captions. The station commander replaces
the former desk-sergeant identity in staff labels, station signage, greeting and
police-career dispatch. Existing police services, prices, jobs and ranks remain.

The procedural avatar uses the existing human rig with warm brown skin, rounded
face, swept-back sectioned braids, a small back bun, black polo, gold badge and
CAPTAIN SMITH / LEVEL 29 POLICE uniform patches. This is an original **stylized
interpretation**, not a photorealistic scan or a verified exact likeness. The
photo is a portrait reference/UI image, not stretched across a 3D head.

## Checks and release limits

175 Node tests pass, including mall site exclusions, two-floor layout, lift and
boundary behavior, cafe cash/health rules, flat legacy terrain and Captain
Smith's finite rig/patches/name integration. Production web build, no-emit
TypeScript and iOS staging/archive generation are checked.

A separate local DOM/source harness loaded the actual game scripts, generated all
seven chapter starts (56 venues, zero mountain features), built the mall and
police station, exercised lift up/down, checked upper boundary blocking and
confirmed Captain Smith's staff identity. This is **not** a WebGL screenshot or
a physical-device test. Multiplayer floor presentation and visual quality on
phones still need in-game checks.

The refreshed iOS source ZIP contains the latest game and reference portrait;
installed apps still require a newly signed app build. The existing Next.js
security advisory remains an unrelated upgrade requirement.
