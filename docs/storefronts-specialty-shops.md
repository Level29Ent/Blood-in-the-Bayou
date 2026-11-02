# Compact actions, raised storefront names and specialty stores

## Menu

The right-side list now contains only **Daily Spin**, **Daily Objectives** and
**Jobs**, in a 120px-wide stack with 30px minimum-height, 9px text controls.
The original money/health/armor/weapon display remains active. Extra map/story/
mall/Powell/pause buttons are removed from this list, not their gameplay systems.
Existing keyboard/map/pause and in-world NPC interactions remain. Active-job
work actions are kept in the touch gameplay group rather than deleted.

## Signage

The screenshot combined multiple large venue placards with a large floating
worker-role sprite. Each venue build now captures its own signs: repeated name,
entrance/auto-door and armory sales banners are removed, other wide instruction
placards are reduced, and one raised business name is mounted on the front.
The lettering is actual extruded contour geometry with shallow depth, not a
textured rectangular banner. It follows the same pre-frontage transform as the
venue, so it faces that business's entrance. Mall shop names also use extrusion.
The main entrance remains unobstructed.

A local Helvetiker font (distributed with Three.js, license included) supplies
contours. Geometry is cached by text; no second Three engine or new dependency.
Role/name sprites on business workers/staff are reduced to 10×1.5 game units and
appear only 14–55 units away inside the venue, not across the room or in the
player's face. Named story-character identity labels are otherwise unchanged.

This addresses venue/business signs made by the shared venue builder, not every
landmark, traffic sign, billboard, mission marker or custom decorative label in
the world. Existing interior EXIT/service instructions remain where appropriate.

## Shops

The mall keeps its six existing shops including 29 Cuisine, and adds two enclosed
ground-floor rear bays:
- **Greentown Plant Store** — potted plants, stems and leaf displays.
- **Fish Aquarium Store** — glass tanks, gravel bases and visible fish displays.

They participate in the existing mall browse interaction. No new plant/fish
ownership inventory, pet unlock or real-money purchase is implied.

Exactly one secondary `kind: clinic` venue becomes **Level 29 Tire Shop**. The
main five-floor General Hospital and its care services remain unchanged. The
shop has tire stacks and a service workbench. Park a damaged land vehicle within
180 units of its entrance, walk inside and use its station: $150 fictional cash
repairs that vehicle. No charge if it is already fully repaired; no sale without
enough money. This uses existing vehicle health, not a new tire-simulation system.

## Verification

233 Node tests pass, including true extrusion bounds/depth and geometry reuse,
main-hospital protection, all eight distinct mall bays, three-action filtering,
venue-banner suppression and tire service payment/full-health/delegation checks.
The prior enclosed-room/door, weather, pause and road-connection tests remain.

An actual-game-script local DOM/Three harness generated all chapters, built an
armory and verified one front raised name plus only the small EXIT instruction,
all nine bounded weapon displays, the Tire Shop selection, General Hospital
preservation and the eight mall identities. This is not a WebGL visual test.

Production build, no-emit TypeScript and refreshed iOS source archive generation
pass. Rendered mobile/desktop appearance, tactile usability of the requested
smaller buttons, physical-phone FPS and native Xcode checks still need playtests.
The existing Next.js security advisory remains unresolved. Installed iPhone
apps require a new signed build. This work includes the prior mall/pause/weather
revision so it does not regress enclosed stores, original HUD or 29 Cuisine.

## Neon / fascia follow-up

The screenshot exposed a placement error: the original raised-name baseline was
53, inside the standard 52–55 roof slab. The sign now fits below the actual roof
underside on a bounded fascia (standard extended shell fallback 52), and sits
4.8 units outward from the door plane. The mall retains its 103-high upper
fascia; inner retail names stay within their requested 7-high shop headers.
Repeated custom exterior banners on the same facade are suppressed too.

Business and mall-shop lettering now uses a cyan-white emissive 3D core plus
one transparent additive halo made from the same font contours. No point lights
or full-screen bloom pass is added. The halo is depth-tested so it cannot glow
through occluding walls, and geometry/glow textures are cached per business name.
This is self-illuminated signage, not simulated light spill onto pavements.

236 regressions pass, including roof-clearance at four shell heights, bounded
mall signs, emissive core and depth-tested halo settings and texture reuse. A
local actual-script DOM/Three scene harness builds all 56 generated businesses,
checks finite letter bounds, neon/halo presence and world-space mounting in each
venue's outward frontage direction. It does not render WebGL or validate the
halo's appearance. Production build, TypeScript no-emit and refreshed native
archive pass; the packaged sign code and versioned entry match the source.
The pre-existing Next.js security upgrade warning remains unresolved.
