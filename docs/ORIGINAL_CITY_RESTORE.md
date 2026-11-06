# Original procedural city restoration and infill

The launcher sets `level29OriginalModels=true` before any asset hooks. Ronniebaby, imported buildings/props/vehicles/weapons and watercraft no longer load GLB replacements in normal play. Existing procedural rigs, weapon animations and boat rendering remain active. Uploaded files and optional review/export tools stay archived in Git; no user uploads were deleted. Both existing and downloaded native source use the same mode after refresh. An already-installed signed iOS app still needs rebuilding.

The existing ACES/PBR, compressed surface maps, quality-scaled bloom and optional High desktop reflection/shadow pipeline is retained. This update does **not** deliver photorealistic replacement assets or UE5 rendering, and does not enable expensive desktop effects on phones. Original homes receive shared stucco/brick facades and trim rather than unrelated imported shells.

## Bounded map infill

Up to16 dry, flat, unoccupied96×96 parcels are selected across the map:12 home exteriors and4 generic enterable businesses in the current source-world check. Homes vary shotgun, bungalow, townhouse and duplex silhouettes with shared-material instanced geometry. Businesses are Corner Grocer, Crescent Laundry, Bayou Hardware and Neighborhood Café. They use existing generic business/property service behavior; specialized grocery, laundry or hardware mini-games are not added.

Each parcel requires an unobstructed sidewalk to an existing low street. Placement excludes buildings, landmarks/features, zoo/farm/base/airport/mall/park/waterfront reservations and established mission approaches. Roads/water are never overwritten. Parks and protected empty land intentionally remain open; this is not indiscriminate filling of the entire map.

Eight additional parked cars use checked spaces beside the new approaches. Bonnie's existing sales menu expands4→12 choices while preserving garage/save records and delivery checks. Display pads use two rows only where player-clearance and lot dimensions allow. An optional nearby additional display court is created only if a dry safe parcel exists; never place it over existing property or roads. Main dealership display cars are stationary, not continuously rotating colliders.

Low moving traffic remains8; Medium10 and High12. Existing highway traffic counts toward the general live-AI count. No independent unbounded traffic loop is added.

## Verification boundaries

Road-grid connectivity, original-mode loader bypass, original boat attachment, parcel/sidewalk preservation and source-world entrance checks are distinct from actual driving and mobile FPS. No claim that all historic road/building bugs or random Safari restarts are resolved. Review `/game/original-city-review.html` is a shared-builder fixture, not a city screenshot. Keep release draft until exact-preview gameplay/placement checks are documented.
