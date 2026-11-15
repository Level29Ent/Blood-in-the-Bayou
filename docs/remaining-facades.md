# Remaining generic storefront facades

This pass only adds static exterior relief to proven legacy generic shells for
shelter/retail/grocery/cafe/business/garage/gas venues. Four deterministic warm
stone, terracotta, sage and cool-stone palettes vary trim, shutters and frames.
Front and side inset-looking opaque windows, sills, shutters, corner pilasters,
masonry joints and shallow layered cornices replace the bare-box impression.
Existing wall colors, business signs, doors, roofs and interiors remain untouched.
Windows are opaque decorative panels, not new transparent openings or rooms.

A provenance marker is set only by the original generic venue-shell factory.
Any true reference*/authored* flag on the venue or building excludes it. Private
residences, apartments, mall/floor interiors, Mill Road and unknown/custom factory
roots are excluded. Conservative exclusions mean some old buildings may remain
unchanged rather than risking a user-authored design. This is not a redesign of
all residential towers, landmarks, bespoke exteriors or unrecognized buildings.

The finish pass runs after authored builders and uses canonical coordinates under
existing frontage transforms. No door, sidewalk, furniture/collision, navigation,
price, mission or save changes. Static relief is above pedestrian clearance or
flush/shallow wall trim. No ground props, downloaded models/textures, transparent
passes, dynamic lights, shadows, reflection cameras or per-frame update loops.
Each eligible venue adds at most five opaque instance batches, bounded window
counts and existing mobile visibility opt-in. World rebuilds replace the containing
city; repeated attachment to the same venue is idempotent.

Tests verify authored exclusions, finite bounded geometry, doorway clearance,
transformed frontages, idempotence and ownership preservation. Full city rendered
appearance and physical-device performance still require live preview verification.
