# Waterfront alignment fixes

The supplied screenshots exposed several separate rendering faults around the
casino landing and its road approach:

- New waterfront roads were individual flat tiles at per-cell heights. Different
  tile heights created steps/cracks even though a route existed in the map grid.
- The boat exterior's stern paddlewheel was on the near side of the landing.
- The casino's off-site playable interior could draw in the world while unboarded.
- Legacy decorative riverfront scenery duplicated a boat/sign near the new dock.
- A camera wrapper re-enabled the first-person weapon scene during the peaceful
  prologue, overriding its deliberate concealment.

## Changes

The waterfront/parking approach now uses a shared-vertex triangular surface. Its
height provider uses the exact same triangle interpolation as its rendered mesh,
so character and chassis support do not cross a stack of disconnected flat slabs.
Road markings follow this height provider; route tiles, protected parcels and save
coordinates are unchanged.

The Natchez exterior is turned so the paddlewheel is on the far side and its
boarding gangway remains at the established landing. Signs are front-facing on
both sides, not mirrored through their backs. The playable casino interior is
hidden until boarded. Legacy riverfront decorative scenery is not duplicated in
maps with the casino hub; the separate fishing boat/captain/job are retained.

The prologue remains peaceful with its first-person weapon scene hidden, including
after the basketball/camera wrapper runs. Mission beam elevation includes its
actual target terrain height rather than assuming all objectives are at sea level.

## Checks

`tests/waterfront-seams.test.cjs` checks continuity across cell borders, identical
mesh heights at shared vertices, downward raycast/support agreement inside the
actual road triangles, far-side paddlewheel/landing geometry and the camera/interior
visibility gates. Existing campaign, boarding, prologue and road tests remain.

`/game/waterfront-seams-review.html` is an isolated shared-surface and boat-approach
review, not the full game or an actual driving benchmark. Device acceptance should
walk and drive the full landing approach both ways, board/exit the casino, resume
Sam's prologue step, and verify weapon concealment while peaceful. The website and
native source archive contain the same fixes; an installed iOS app still needs a
new signed build.
