# Bayou Cycles reference-inspired mall interior

The existing ground-floor BIKE SHOP in Greentown Mall uses a dedicated showroom builder instead of three generic countertop bicycle props. It keeps its original bay, name, doorway, floor, and browse behavior. Other mall stores retain their existing display builders and counters.

The actual 102×70 bay holds eight showroom bikes on two-tier side racks and two hanging display bikes. Frames have a diamond silhouette, paired fork/stays, tire/rim/spoke/hub detail, saddle/post, drop or flat handlebars, crank/pedals, chain runs and a bottle. Frame colors vary across the racks. A slatwall holds parts packs, spare tires, helmet cubbies, bikepacking bags and service tools behind a compact counter. Wood flooring and self-lit ceiling panels follow the supplied showroom references; no copied retailer logos or advertising images are used.

All repeated geometry is instanced by geometry/material. Furnishings add no dynamic lights, model downloads or texture downloads. Solid rack/counter reservations are added to the correct mall-floor furniture list, including reversed storefront orientation. Hanging bikes and their supports stay below the shop ceiling. The generic wide back counter and duplicate checkout clutter are skipped only for BIKE SHOP.

`/game/bike-shop-review.html` renders the production builder at the actual mall-bay dimensions in an isolated shell with entrance, two-tier-rack and service-wall cameras. `/game/mall-review.html` also loads the new builder. Neither page demonstrates full-city/mobile performance or purchasable/rideable bicycles: the bicycles are decorative showroom stock, with no new purchases or vehicle mechanics.

Focused regressions cover radius-ten entrance/central-aisle clearance in both bay directions and several sizes, finite instanced transforms, geometry/ceiling bounds, draw batches without lights, actual mall builder integration and correct floor collision reservations. Existing mall shop threshold, stair, lift, cafe and waterfall tests remain in place.
