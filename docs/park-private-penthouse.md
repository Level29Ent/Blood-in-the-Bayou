# Park rotation / Ronniebaby private entrance

## Changes
- 29 Land turns rigidly 90 degrees left (positive Three.js Y rotation). Local
  704x640 layout now reserves a 640x704 world rectangle with the same area.
  Shared forward/inverse transforms drive gate, boarding, near prompts and solids;
  ride cameras inherit the rotated root. Boardwalk path regenerated against the
  actual east-facing entrance, preserving all occupied parcels. All seven
  chapter generations retain a clear park. Batching normalizes root rotation as
  well as translation before merging, then restores both.
- Coaster signs shrink from 90x12 to 34x4.25, move off the boarding centerline
  and rise to 22 units on posts. All park sign planes are excluded from merging
  and other park placards have a seven-unit height cap.
- Private lift lobby replaces overlapping automatic staircase/lift entrances.
  Remove ten-step staircase that used a proximity teleport to the top floor;
  use existing explicit U / penthouse button. Only edge support columns remain,
  with clear central forecourt, canopy, brass framed doors and one compact sign.
  Venue identity is Ronniebaby's private residence rather than a player safehouse.
  Facade name mounts above the canopy and the checkpoint cylinder is flattened
  to a ground marker here only. Mission access and lift exit remain intact.
- Ronniebaby residence flagged private. Property acquisition, workshop stash/decor
  and player weapon wall displays exclude it. Existing private deed retired on
  normal property initialization, transferring any stored rare items to carried
  inventory. Migration is idempotent; no other deeds or save keys/cash are reset.
  Existing general checkpoint/recovery services are not removed; no new player
  houses are added in this patch. Current city has only this safe venue, so the
  player-property UI is unavailable here; other future eligible safe venues work.

## Verification
370 Node tests pass, including rotated world/local mapping and private deed
rejection/legacy item preservation. Production build and TypeScript pass.
Actual launcher scene harness generates seven chapters with rotated park,
checks six boarding/exit roundtrips, and walks through the penthouse approach
and U lift up/down. Private property/decor panels cannot open. Rendered preview
results are reported in the PR; non-GPU harness is not a Safari playtest.
No claim of resolving the existing gameplay crash or increasing FPS.
Web source only; downloaded/native iOS archive not regenerated.
