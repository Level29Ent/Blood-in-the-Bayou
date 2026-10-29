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

## City-life expansion

- The mission mansion is the only safehouse. Former neighborhood safehouses become grocery branches or business offices, using their matching interior/service builders. A shelter superseded by a new bank lot is removed, not nested inside it.
- Four bank branches are placed in separate city blocks. Operation/robbery targets rotate between matching branches rather than always choosing the closest.
- Bonnie's dealership gets allocation priority and a larger showroom/lot. Display cars show in-game prices. Walk inside to Bonnie, press ENTER / E to talk, then buy. Clear the delivery bay before buying or recalling an owned vehicle. Ownership is saved in the local garage, with recall from Bonnie after reload. Delivery is not server-authoritative multiplayer ownership.
- The waterfront casino is walk-in: approach a machine/table and use ENTER / E for slots, blackjack, poker or roulette. These use fictional earned game currency only and never real money or paid credits.
- The dance club is walk-in with animated adult NPCs and the existing player rhythm minigame. The Level 29 Spotify controller is available inside the club as well as in cars. Tap play if required; browser autoplay restrictions, Spotify availability and music licensing still apply.
- Golden Hills is a Hollywood-themed studio/film-row addition with a cafe, talent agency and screen-test annex where free plots are available at the far end near the mountains, not a separate fully simulated city. The farm has cows, pigs and chickens; USE inside the farm buys feed for $20 and restores 15 health, with a one-minute cooldown.
- The eastern bay is extended north/south. Skiffs and cabin cruisers are driveable; four ambient boats have fishing/helm crews. Boats bob with the existing vehicle model; NPC crews perform bounded procedural idle/fishing poses, not a full navigation simulation.
- Fire uses a tapered flame sprite; civilian figures gain clothing seams and badges. Bayou Arsenal and Bayou Shine replace the previously copied weapon-shop/carwash names. This is not a legal clearance of every name or asset.
- After mission one, briefing locations vary across passable street checkpoints instead of always returning to the penthouse. Existing mission target beams/map markers remain, with an added visible checkpoint column. Field objectives and extractions retain existing mission logic; not all 210 missions have bespoke unique interiors.
- New walk-in interiors cover the dealership, casino, club, retail annexes, airport terminal, university classroom and film studio. Stadium activities remain exterior-only.
- Monetization is **not live**. See `docs/app-store-purchases.md` for the native StoreKit release blockers; no unfulfilled paid cosmetic is offered. Ad-free promotions remain hidden until actual ads and native billing are configured.

## Cinematic rendering and terrain fixes

- The game remains a vanilla Three.js **r149** renderer. A locally served, MIT-licensed addon bundle supplies `EffectComposer`, `SSAOPass`, `RenderPass` and `ShaderPass`, using the existing global Three rather than downloading or bundling a second engine. Rebuild it with `pnpm build:postprocessing`; the source generator and pinned dev dependencies are included.
- **High:** SSAO, up to 1280px long-axis render targets, physical glass transmission. **Medium:** SSAO at 60% drawing-buffer resolution capped at 800px, cheaper transparent reflective glass. **Low (phone default):** direct rendering with no compositor targets, SSAO, shadows or glass transmission. Select Graphics on the title screen, or press G during play. Adaptive pixel ratio and orientation/resize changes resize the composer. GPU context loss or setup failure falls back to direct rendering until reload.
- The world is rendered through AO, then restrained contrast/saturation/warm grading with one linear-to-sRGB output conversion. Existing ACES tone mapping, PCF soft sun shadows, sky and vignette remain. Gun/dashboard and 2D HUD render separately, without world AO or depth blur. Depth separation uses distance haze, not expensive bokeh.
- Sun strength and hemisphere bounce are tuned together. A generated sky PMREM environment (not a downloaded HDR photograph or live reflection probe) is shared by world and view-model PBR materials. Opaque Lambert/Phong surfaces convert to Standard materials; signs, sky, lights and effect overlays deliberately stay unlit.
- Wire-spoked slab/lowrider wheels have crossed wires and projecting swanga hubs. The old generic wheel-detail overlay no longer adds duplicate rims over detailed vehicle models. Glass panes use Physical materials, dielectric IOR and high-tier transmission; body panels, chrome, rubber, deck and hull finishes stay distinct. Boat hulls gain smoother bevel/curve tessellation and open cabin glazing; SMG/carbine models gain rails, side details and muzzle components. Existing detailed procedural models are enhanced, **not replaced by imported photorealistic asset packs**. Texture-painted windows on distant scenery are still facade art, not walk-through glass openings.
- Moving nearby boats emit bounded, reusable foam particles from both hull sides (up to six boats). Boat meshes bob/pitch/roll on visual waves without changing navigation collision; crew height follows bobbing. This is visual motion, not fluid simulation.
- Farm allocation now checks sampled elevation/slope, selecting lowland rather than steep mountain plots. Buildings, business lots and the farm have smoothly graded, entrance-height terrain pads shared by collision and mountain meshes, including later terrain-provider replacement. Mountain micro-detail fades around developments; apartment upstairs floor height is preserved. This fixes terrain penetrating developed plots without deleting mission venues or flattening the entire summit.
- Kill attribution now distinguishes the player, guards, other players and ambient events. Guard/ambient deaths, boss cleanup and horde-clearing cheats no longer grant local cash, streaks, daily kills, rampage kills or drops. Local gunfire/melee/fire/vehicle contact and player-triggered explosion chains retain credit. Remote kill payouts still route to their owner; shared host clear missions accept remote kills.

Native-iPhone GPU performance, visual quality on physical devices and six-player multiplayer remain unverified. Low quality is available if SSAO/transmission is too expensive. The existing Next.js security-upgrade warning is unrelated and remains outstanding.


## Armory, hillside foundations and farm roads

- Each armory has seven individually spaced, elevated weapon pedestals. Models are scaled/centered using their actual bounding boxes; the old counter/rack and the second decorative wall-rack pass are removed. Each pedestal has a targeted spotlight, active only while the player occupies that armory; spotlights do not allocate shadow maps. Pedestal colliders leave the central service/entrance aisle open.
- A shared layout helper computes foundation elevation from the approach/door terrain, rather than forcing hillside sites to sea level. The terrain blends into that fixed foundation beyond the building. Venue root transforms, interior detail elevations and collider vertical metadata use the same base. Static batching receives the final transform, not a late offset applied to an empty group. Upstairs hospital/apartment overrides remain separate. Mountain road depression no longer overrides a developed foundation.
- The agricultural zone reserves its interior against late footpath generation. Grid-road tiles are cleared from the field; a continuous perimeter lane is built outside it. Intersecting curved centerlines are routed around an inflated farm boundary with full asphalt/verge clearance, and both curve draw bounds and driveable tile data are updated. Parking/trees are cleared from the lane. If no safe curve detour exists, generation reports the conflict rather than silently painting a road across the field.
- The previous failed Vercel deployment stopped at `ERR_PNPM_IGNORED_BUILDS` for esbuild. The workspace now approves **only esbuild** with `allowBuilds`; it does not globally permit dependency build scripts. The separate existing Next.js security advisory still requires attention.


## Mobile performance and lowland spacing correction

- Phones migrate once to Low quality, including devices that retained the old costly default. Subsequent explicit Graphics/G selections remain available. Low renders the world directly: no composer, AO pass or postprocessing targets are allocated. Existing ACES tone mapping, readable ambient lighting and haze remain; High/Medium are optional.
- Phone render scale is capped at 1× in initialization, multiplayer and adaptive-resolution paths. Sustained slow touch rendering can fall back to Low. Room spotlights only activate in High. Mountain tessellation and decorative pine instances are reduced; whole-scene material scans run on scene changes instead of periodically interrupting play.
- Foundation influence lookups use spatial buckets instead of scanning every development pad for every collision/terrain query.
- Final zoning reserves a full 32-world-unit tile between all building footprints. Conflicting buildings move to lowland plots with the same dimensions; their walls, door, service station, lot metadata and collision rectangles move together. The current map relocates 14 buildings without removing services. Relocated entrances get new street paths. Any optional filler removal is recorded in zoning diagnostics; essential mission/service buildings are not silently removed.
- Mountain feature rectangles plus a 32-unit buffer are exclusion zones for **all buildings**, including the Golden Hills annexes and air terminal. The district retains its name but its businesses move off the mountain. No foundation pad is used as permission to put a building on a mountain. The current seven chapter maps have zero mountain-building intersections and zero sub-tile building clearances; four banks and all four armories remain.
- Physical-iPhone FPS remains unverified; local touch-browser checks validate the cheaper rendering configuration, not a universal frame-rate guarantee.

## Restore road color without restoring expensive effects

The ground canvas is explicitly sRGB and uses a dedicated rough, nonmetallic Standard material with environment reflection intensity zero. Grid and curved asphalt use the same near-black base, while lane markings and bridge surfaces retain their own colors. Day/dusk key and bounce light are reduced to avoid washing out dark albedo; haze starts farther away so nearby streets/buildings keep their contrast. High/Medium's output pass no longer applies a separate desaturating warm tint, making its base palette consistent with direct Low rendering. Transparent glass and performance-first phone defaults are unchanged; no extra pass is introduced on phones.


## Fixed performance-first graphics

The graphics selector and G shortcut are removed. Every device uses the fixed Low/direct-rendering policy, ignoring saved High/Medium selections. The compatibility setter cannot re-enable expensive effects. Transparent modeled glass, dark asphalt/color restoration, ACES and adaptive resolution remain; no SSAO/compositor targets, transmission or dynamic shadow maps are re-enabled. Physical-device FPS still varies by hardware.

## Mountain activity anchors, visible farm and original penthouse paint

- Mountain mesh vertices no longer add a visual-only fractal height offset above collision terrain. Footing uses the same piecewise triangle surface as the rendered mountain grid (including the grid diagonal), preventing actors from standing on a different analytical surface. This retains the lighter mountain tessellation, not additional GPU passes.
- Stunt ramps, rampage markers and packages now validate their full footprint against mountain features, buildings, the farm, height and slope. Invalid activity sites relocate to flat lowland candidates with their IDs preserved. If no safe site exists it is omitted rather than floating on a mountain.
- The existing lowland farm has 12 animals, a barn landmark, larger entrance signs and an open fence entrance. **FIND FARM** opens the map with a labeled farm and enables a green destination beam. RETURN TO GAME closes the map while keeping directions; CANCEL FARM GPS then clears the guide. Reaching the entrance clears the guide. Mission state is not changed. Walk into the field and USE to feed animals; the existing feed price/cooldown remains. This is directions, not teleportation.
- Penthouse wall paint retains the original `#672e79` purple, `#173f30` green, `#c5a23c` gold band and pale trim. The wall texture is explicitly sRGB; wall paint and matching edge panels bypass tone mapping/lighting so they do not bleach to pink/gray. Furniture, metallic trim, floors and transparent glazing retain their existing materials. Low/direct rendering stays fixed and the graphics selector remains absent.
