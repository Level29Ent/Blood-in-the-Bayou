# Crescent Donuts reference-inspired interior

The existing `depth === 'donut'` cafe gets two glass pastry cabinets holding 108 modeled donuts/pastries in trays, with pink/chocolate/glazed icing, ring and filled shapes, long pastries and instanced sprinkles. The reference palette adds mint walls, warm wood cabinets, menu/header signs, coffee equipment, cups, takeaway boxes, caged pendant fixtures, ceiling panels and a small side diner counter with three chrome-rimmed stools.

The original parcel, cafe identity, door, service coordinates, cashier, spinning exterior donut, meal purchase, delivery contract and stakeout target are retained. Only the donut venue matches. Generic base furniture, later booth/counter additions, duplicate streamed furniture/registers and architectural finishes are skipped for this room so they cannot obscure the cases or block the service route. Other cafes/diners keep their existing furnishings.

The pastry builder uses 17 instanced geometry/material batches before signs and adds no dynamic lights or remote assets. Display glass is faint and does not write depth. Front case glazing slopes slightly; shelves have warm self-lit strips rather than new scene lights. Food and menu artwork is original/generic, not copied store branding. Prices/services remain controlled by the existing cafe menu.

`/game/donut-shop-review.html` renders the production furnishings in an isolated 160×128 shell with entrance, pastry-case and diner-counter cameras. This is not deployed full-city gameplay or evidence of phone performance. The visuals are procedural game art, not photographic scanning.

Focused regressions check radius-ten entrance/service/case-front/stool-approach paths, actual shell selection, unchanged door/service coordinates, duplicate-prop exclusions, 108 pastries and bounded draw calls, faint glass, finite geometry inside the shell and raised/translated placements. Existing city-depth site and mission tests also run.
