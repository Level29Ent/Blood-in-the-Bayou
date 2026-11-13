# Interior finishes and street-wide parade

## Karma

The existing photo-inspired shop now uses finer shared PBR normal/roughness textures, timber and metal response, thin clearcoat glass panes instead of two solid tinted blocks, cylindrical product jars with lids and labels, display lighting, checkout monitor/keyboard/card terminal/receipt printer, ventilation and wall outlets. Two bounded, non-shadowing ceiling lights provide illumination. The black/slatted wall layout, green branding, skeleton decor and open central aisle remain. This is an incremental realism pass on locally generated art, not a photorealistic scan.

## All enterable building interiors

The shared finish layer upgrades materials before venue static batching and on newly streamed floors. It preserves authored albedo labels/art, transparent glass, characters and roof/door ownership. Fine texture sets are shared rather than downloaded per room.

An instanced architectural dressing pass adds baseboards, crown trim, doorway casings, switches/outlets, ventilation, a framed wall panel, alarm detail and wall-wash fixtures. It registers normal venues, individual mall shops, hospital floors, both Greenmart floors, riverboat floors, civic library/metro and newly streamed homes/condo/tower rooms. Dressing is created near the player at most one site per 20 simulation frames and hidden outside its floor/distance. Streamed-floor eviction removes its dressing. All additions are wall-mounted; existing furniture, collision, doors, service pads, jobs and economy remain unchanged. Background buildings without an enterable room do not gain a new interior.

## Parade

The previous 66 marchers were placed every 12 units on exactly the same centre line and competed with residents for a 132-person cap. The procession now authors 330 marcher slots in five units of six ranks, up to eleven abreast. A cached cross-section of actual roadway adapts visible columns to the available width; marchers do not extend onto sidewalks or blocked lanes. Floats are 45% wider and use full-footprint road checks. Spectators are spread along both sidewalks instead of filling the beginning of the route first. Parade participants are prioritized over background residents within a 384-person/nine-batch crowd renderer; there is no unbounded NPC spawning or per-frame collision scan per marcher.

The existing story route, checkpoints, rewards and narrative handoffs remain. Narrow/obstructed segments reduce formation width or hide unsafe float placements, rather than forcing models into buildings. The original out-and-back route is retained; this is a visual formation pass, not a new parade traffic-control/physics system.

## Validation

34 focused checks cover maps/material preservation, instancing, entry clearance, Karma geometry, floor/venue registration, wide/narrow/blocked parade ranks, no per-frame road rescan, and the complete prologue state machine. Next production build and standalone TypeScript check pass. Full suite: 718/721 pass; three unchanged base asset checks require the absent `public/game/models/characters/ronniebaby.glb`.

`/game/interior-parade-review.html` exercises production Karma, shared finish decorators and procession rendering. Home/shop viewer furniture is illustrative; this is not full-city gameplay or a device FPS benchmark. Preview results are recorded on the PR. Native packaging copies current web sources; installed iOS builds need a new signed release.
