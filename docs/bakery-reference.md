# Crescent Bakery reference interior

The existing mall CRESCENT BAKERY now uses three-tier slatted wood bread racks with baguette-like long loaves, round boules and scored oval breads; an illuminated metal/glass pastry case with filled cookies, cupcakes, jam pastries and chocolate-striped bakes; three decorated cakes on platters; and a wood/stainless prep counter with a mixer, stacked ovens and pastry-box stacks. Pale floor tiles, a tiled backsplash, bread-price tickets and original bakery headers follow the supplied references without copying store brands or images.

The same bay, shop identity, doorway, browsing point and floor remain. Side-rack/case and rear-counter colliders share the production plan, leaving a radius-ten central path in both gallery orientations. Authored fixtures follow existing active-floor visibility. Only the bakery skips generic counter/display/checkout/stock/finish passes. No sales menu, prices, staffing, food effect or pastry-purchase mechanics are added.

Stock is procedural shared geometry/instances with no remote textures/models, new lights, reflections, shadows or animation loops. Glass has low opacity/depth writes disabled so food stays visible. The bakery is a stylized interpretation, not a photo scan or a copy of branded packaging.

`/game/bakery-review.html` renders the production builder at the mall bay's real 79.2×70 dimensions, with entrance, bread-rack, pastry-case and north/south controls. It is not a full-world startup, shopping or device-performance test. Focused tests cover food counts, finite model bounds/draws, no lights, central routes/orientations and actual mall floor integration.

An existing base-main toy-store integration failure (referenceToyStore missing from mall-display selection) remains unrelated and unchanged. Full regression results retain it; targeted runs omit it only to inspect the remaining mall checks separately.
