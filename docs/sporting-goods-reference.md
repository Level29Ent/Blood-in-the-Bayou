# Bayou Sporting Goods reference interior

The mall's SPORTING GOODS tenant receives an original procedural outdoor/sports outfitter interior inspired by the supplied photos: athletic mannequins on a black plinth, four-tier glove wall, three-tier colored golf bags, four-tier ball shelves, ten upright fishing rods with reels/guides, packaged accessories and compact wood checkout with folded apparel.

Gloves have cupped palms/finger lobes/lacing; golf bags have pockets, straps and club silhouettes; balls have seam rings; mannequins wear colored athletic tops and dark shorts. Green/wood slatwall, warm floor, exposed steel/duct geometry and bright ceiling strips evoke an outdoor outfitter. Original fictional graphics do not reproduce photographed branding, athlete advertising or watermarks.

The tenant room, floor, storefront, entrance and existing browse/service behavior remain unchanged. Both gallery orientations are supported. Major fixture footprints enter the normal mall-floor collision list; player-radius routes preserve entry, center service lane and rear browsing. The default counter/props and generic stock/finish passes skip this tenant. Gear is decorative stock, not new purchases, fishing upgrades or sports minigames.

Repeated stock is instanced in at most 38 batches, two original small canvas maps and no external models/images/downloads or new dynamic lights. Physical-device frame rate remains unprofiled.

`/game/sporting-goods-review.html` uses actual production furnishings in the existing 79.2 × 70 reference tenant footprint with store, glove, golf, ball and rod/mannequin cameras. It omits surrounding mall, actors and shopping UI; it is not full-city gameplay verification. The existing mall review also loads the dependency.

Checks: `node --test tests/sporting-goods-interior.test.cjs tests/source-integrity.test.cjs tests/interior-realism-parade.test.cjs`. Covers radius-ten access in both directions, finite transformed matrices, stock counts, batch/ceiling/room bounds, actual display integration and module/overlay order. Expanded mall regressions and broad/build/preview findings recorded in the PR/task summary.
