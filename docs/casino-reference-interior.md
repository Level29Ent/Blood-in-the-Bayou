# BoomCity reference casino interior

The Natchez riverboat's playable ground-floor gaming deck now uses an original procedural casino interior inspired by the supplied casino photographs: a shallow barrel vault with gold ribs, stepped side coffers, warm chandelier beads, burgundy wall panels, patterned scroll-and-diamond carpet, a brass-bordered central runner, illuminated slot cabinets with upholstered stools, and oval green-felt blackjack tables with printed layouts and chips.

- The existing 320 × 192 parcel and 48-unit deck spacing are unchanged. Sixteen slots, four tables and three chandeliers fit below the next deck.
- The central boarding spawn and gaming/trade interaction lane stay clear. Furniture collision reservations include slot seats and table chairs. Player-radius flood-fill checks reach all slot banks and table sides.
- Boarding, floor changes, armory trade, roof and leaving use the existing riverboat runtime. New table and slot meshes are decoration for the existing casino gaming interface, not new per-machine minigames.
- Repeated geometry uses shared materials and instanced batches. Original locally generated canvas maps supply carpet, reel displays and table markings; no external downloads, photo textures or new dynamic lights. The added deck has fewer than 60 mesh draws, including the segmented vault. This is not a measured full-city frame-rate guarantee.
- `/game/casino-review.html` builds the production riverboat shell and actual gaming furnishings, with gaming-hall, slot, table and ceiling cameras. It is signed-out and self-contained. It does not exercise full-city loading, boarding or mobile controls.

Validation: `node --test tests/casino-interior.test.cjs tests/survival-stories.test.cjs tests/mobile-casino-controls.test.cjs tests/waterfront-seams.test.cjs tests/source-integrity.test.cjs` covers 19 checks, including geometry bounds, deck isolation, module order, walkability, existing casino controls and waterfront regressions. Preview verification and full-suite/build results are recorded in the pull request.
