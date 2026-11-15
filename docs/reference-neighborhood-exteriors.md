# Residential streets and duplicate casino scenery

## Requested changes

Remove far-left duplicate riverboat-looking casino geometry in the waterfront screenshot; improve flat road surfaces and ordinary house/apartment exteriors using Craftsman, brick colonial and balcony-apartment references. Original stylized procedural interpretation, not photo scans or architectural reconstruction.

## Hidden riverboat copy

The playable riverboat's hidden interior root sets `userData.noBatch`, but the global world merger only checked that flag on individual leaf meshes, not the root. Interior shell meshes could therefore be baked into visible scenery independently of the parent’s hidden state, producing a second, broken-looking casino shell. The new global skip list explicitly includes runtime-owned venue roots with `noBatch`.

Regression constructs actual hub geometry and runs the actual production static merger: the old empty skip list reproduces visible escaped casino geometry; the new skip selection retains meshes beneath their hidden root. The detailed Natchez exterior, captain/pier, boarding/leave, floors, gaming/trade, shrimp jobs and drivable steamboat are not removed or changed. This is a reproduced mechanism consistent with the screenshot; rendered confirmation of the exact far-left object still needs a preview.

## Ordinary homes and apartments

Decatur neighborhood ordinary houses and original infill homes share reference-inspired facades: true triangular gable geometry, siding seams, framed/sashed windows, louvered shutters, porch columns/canopy, brick variants with chimneys, recessed doors, small lanterns represented by pale colored panes (not actual lights), and planted beds. Four-floor neighborhood apartment shells retain their existing height and receive sage/cream paneling, recessed balconies with rose patterned fronts and cornice trim.

Models stay inside original plot bounds. Existing door/service/streamed-floor entry coordinates, building collision, missions, home parcels, floor heights and paths are unchanged. The front 16 units of plot are visually recessed to accommodate porch/balcony detail. This does not turn previously solid homes into new enterable interiors or add walkable balcony levels. Original infill `H` metadata uses height units; the wrapper preserves its preexisting world-scale height per style rather than shrinking homes by 2.4.

Tremé shotgun homes, uploaded-asset mode, manor/penthouse, hospital and specialist interiors are excluded. Original mode remains default. Old generic neighborhood porch and apartment overlay passes are suppressed for these authored exteriors to avoid conflicting slabs.

## Roads

Fine aggregate/patch asphalt uses one shared 128×128 deterministic data texture. A linear grid scan and building-occupancy raster select existing ordinary road tiles, excluding bridges/water, building footprints and slopes above the conservative corner-height threshold. Road-tile overlay sits 0.105 units above the existing sampled terrain, beneath existing vector paint (0.16), with negative depth bias. No new colliders, road-routing rules, speed limits, vehicles, lights or movement/support changes. Existing boulevard, zoo–farm lane and road repairs remain. This is a surface refresh, not a new lane-routing/civil-engineering system; no claim that every remaining alignment issue is fixed.

## Verification

`neighborhood-exteriors-review.html` loads actual production home/road builders with street/Craftsman/brick/apartment views on a clearly labeled sample scene. It does not establish full-city appearances or traffic/collision behavior. Tests verify plot/height bounds, original metadata, shared geometry/textures, absence of new actual lights, protected road selection, unchanged map data, and the old/new hidden-interior batching reproduction. Existing source-order/Tremé/infill and riverboat tests continue; update obsolete exact five-mesh assertion to the authored bounded instance/roof architecture and keep silhouette/roofline assertions.

Production build/test results and preview availability are recorded in the PR. Full-city walkthrough, far-left boat visual confirmation and physical-mobile memory/FPS remain unverified until a compatible deployment is accessible. Added facade geometry and road triangles are not a measured performance guarantee. No save data, credentials or deployment settings changed.
