# Detailed city materials, armored bosses and departmental hospital

## Materials and lighting
Original tileable **256px PBR surface sets** (brick, plaster, wood, metal, tile and fabric support) add normal/roughness detail to opaque building and prop materials. Sets share GPU textures; existing brick/stucco albedo/facade art remains, with normal and roughness detail layered on. Building material helpers and the existing PBR conversion pass apply the maps once per material/scene, not every frame. Metallic surfaces keep lower roughness; opaque signs remain deliberately unlit. Dark rough asphalt and transparent glass are exempt from generic conversion.

These are **procedurally authored textures**, not purchased photographic texture packs, displacement, ray tracing or replacement high-poly models for every building. Existing direct/Low rendering, restrained key/bounce lighting, environment reflections, no tone mapping and quiet rain remain to avoid the previously reported washout/stutter. No new SSAO, transmission or shadow-map tier is enabled. Detailed interiors build on existing furniture; hospital/casino/retail receive the largest new authored prop changes.

## Boss difficulty
Campaign bosses, Gumbo Behemoth, Alex's research bosses and Dayshawn's rivals now have **3× their previous health** and **45% incoming damage reduction** (55% passes through): about **5.45× effective durability** compared with previous unarmored values. The HP accessor applies armor consistently to decreasing HP writes. Direct explosion/vehicle kill callbacks on these story bosses chip armor/health instead of bypassing durability. Capturing a weakened research boss still uses its scaled health threshold; normal walkers/runners/brutes that are not bosses are unchanged.

Heavy bosses no longer despawn merely because a player leaves the 1,500-unit active radius; this cannot count as an easy victory. An armored-boss HUD shows current/max HP and resistance. No regenerating armor or additional paid ammo mechanic is introduced. Existing host authority remains; multiplayer balance/end-to-end synchronization has not been validated on physical clients.

## Dealership labels
Four dedicated **opaque, full-opacity billboard price cards** use high-contrast sRGB canvases, no glow/alpha fade, unlit/no tone mapping, and fog disabled. They face the camera instead of becoming edge-on with cars. Depth testing remains so prices cannot be seen through walls. Showroom purchase UI/actual prices are unchanged.

## Hospital floors and loop

1. **Lobby / Reception**: reception desk, monitor/keyboard, waiting chairs and small decor.
2. **X-Ray / Imaging**: two imaging tables with overhead X-ray heads/gantries and control monitors.
3. **Morgue / Cold Storage**: stainless examination tables and banked cold-storage doors/handles. No gore or bodies are added to this department.
4. **Patient Wards**: three occupied beds, rails, pillows and monitors.
5. **Recovery / Dispatch**: three occupied beds, rails, pillows and monitors.

There are **six patient NPCs lying in beds** and **two moving nurse NPCs**, one per occupied ward/recovery floor. Each nurse travels between three clear bed-side points over six seconds, then pauses/tends for **four seconds**, continuously during active gameplay. Figures are visible when the player occupies their floor; actor motion pauses with gameplay. Existing desk staff remain in addition to the two patrol nurses. Department service text matches the new floors; ward care retains the previous surgery/pharmacy benefits, while the morgue offers a non-treatment check-in. Movement uses fixed bounded interior routes, not a new general hospital crowd simulator.

Elevator control/landing metadata rotates with the building, and floor-menu names match department visuals. The central entrance/elevator aisle, service counter and existing medical care/job interactions remain. The former generic hospital beds/decor pass is removed to avoid conflicting furniture layers. Legacy recording scripts referring to old departments are not newly voiced by this change.

## Casino and smoke retail
Casino slots gain separate cabinet, chrome trim, crisp reel screens, button/coin trays and stools. Tables gain felt/wood/rails, cards/chips and a roulette wheel. **Six seated customer figures** populate the slot area; existing table games still use fictional game cash. The four physical interaction points move to clear approaches matching the new furniture and final room rotation.

Crown Smoke Shop retains its single-city location and services, adding labeled cigar-humidor trays, packaged shelf stock, glassware/water-pipe shapes, bowls and hose loops. No real-money inventory checkout or new consumption mechanic is added.

## Vehicles and original GLB watercraft
Land spawn catalog adds **Crescent Electric, Parish Ambulance and Levee Utility Pickup**, with profile/body differences and relevant equipment/cross/trim detail. Existing spaced parking allocation is reused rather than increasing traffic density.

Five original **binary glTF (.glb)** watercraft assets are served locally: skiff, bowrider, cabin cruiser, pontoon and steamboat. They cover boat/yacht/skiff/cabinboat/steamboat plus two added pontoon/sport-bowrider types. Models include smoother hull/deck shapes, trim/cleats, transparent windshield/cabin panels, upholstered seats, helm/wheel/dials, outboard/shaft/propeller, ladder, railings, and a steamboat upper deck/paddle wheel. Different parts use separate paint/chrome/rubber/teak/vinyl/glass PBR finishes. Static components are merged by material: six meshes for ordinary assets, eight for steamboat, rather than hundreds of individual prop calls.

Assets are **original geometry authored by the included generator**, not licensed/scanned photorealistic third-party boats. They are roughly 280–480 KiB each, loaded/cached on demand. Existing boat meshes remain as a temporary fallback during loading/failure; successful loading swaps in the GLB. Existing steering/boarding, fishing jobs, bobbing/wake behavior and collision dimensions remain. New pontoon/bowrider reuse two existing moorings. All seven current watercraft types map to a GLB; unknown future boat types fall back to the skiff asset.

Rebuild assets with `node scripts/build-watercraft.mjs`; loader bundle with `node scripts/build-watercraft-loader.cjs`. Both use installed **Three.js r149**, and the loader shares the existing engine rather than bundling a second renderer. GLTFLoader's MIT license remains under `public/game/vendor/THREE-LICENSE.txt`. No external asset license/download dependency is introduced.

## Verification limits
Local tests exercise all assets, normal/roughness maps, opacity, populations, nurse pauses, elevator floor changes and current interactions. They are not a photorealism guarantee, a full unassisted driving/shooting playthrough or physical-iPhone/Safari FPS/audio assessment. New map/material fidelity must still be visually reviewed on user hardware. Existing Next.js security upgrade reminder remains outstanding; no live payments are added.
