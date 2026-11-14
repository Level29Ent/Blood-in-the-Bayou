# Photo-inspired ordinary home interiors

Five original procedural palettes reinterpret the supplied warm wood lounge, cream/gold seating, botanical sitting room, paneled fireplace lounge and compact warm apartment references. Includes cushioned sofas/chairs, pillows/throw strips, coffee trunks with metal trim and books, lamps, potted foliage/flowers, display shelving, abstract framed art, mouldings, layered rugs, ceiling beams and chandelier details. Bed and kitchen fixtures maintain a furnished home rather than an empty show lounge. Flames, reflections and dynamic lighting are not simulated.

## Scope

- Ordinary `safe` venues use the new builder instead of the four old generic furniture blocks, with deterministic palette selection from their coordinates/key.
- Streamed `apartment0`, `apartment1` and `harbor-condo` floors replace the old side-room dividers and repetitive desk/bed blocks with open-plan home furnishings. Outer shell, floor count, floor height, stairs, spawn, controls and stream lifetime are unchanged. Palettes vary deterministically by site/floor.
- Southern manor, businesses, converted shelters, story venues, production office tower and quarantine hospital are excluded. Does not turn decorative neighborhood shells into new enterable houses. The named Level 29 tower apartment and Ronniebaby's upper penthouse use their existing bespoke interiors; their unrelated ownership/garage/lift/mission systems are not changed here.
- Existing safehouse rest/heal/checkpoint services and pad coordinates remain unchanged. New furnishings are decorative/static blockers, not a new loot or destructible-prop system.

## Integration and performance

The source loads once before expansion. `referenceHomes` excludes authored homes from automatic estate clutter, lived-in stock, generic business/detail props, categorized prop plans, legacy cover extraction and finish recoloring. Streamed runtime records carry the same flag, preventing old furniture from reappearing later.

Furniture footprints fit the parcel and leave radius-ten routes from door/spawn to service/stairs. Streamed furniture stays below the 28-unit interior ceiling, under the unchanged 32-unit story spacing. Repeated geometry/materials are shared by palette and instanced into at most 40 tested mesh draws per authored set. No new texture/image downloads, real-time lights, reflection captures, animation loops or dependencies. Physical-device performance is not measured.

## Verification

`node --test tests/home-lounges.test.cjs tests/interior-systems.test.cjs tests/source-integrity.test.cjs tests/film-studio-interior.test.cjs tests/interior-realism-parade.test.cjs`

Covers deterministic palettes and exclusions, seven room sizes, radius-ten route flood-fill, finite geometry/bounds across all palettes at apartment heights, actual production venue build, all four actual apartment/condo floor builders, untouched nonresidential floor builders, actual cover-runtime loading and actual finish-runtime exclusions. Broad baseline comparison and production build findings are recorded in the PR.

`/game/home-lounges-review.html` shows the production builder with five style choices, safehouse/apartment size toggles and room/overhead cameras. It omits the production front shell and gameplay UI for inspection; it does not verify full-city doors, rest/heal/save or stair controls. Preview availability and visual verification are reported separately.
