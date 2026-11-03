# City expansion request — awaiting map layout choice

## Already merged before this patch

The detailed interiors, aquarium species, bank vault/deposit/tellers, contained
three-zombie police cell and 50%-larger airport/two added branded airplanes are
in main from PR #43. This patch does not duplicate them. Existing safehouse
rest/autosave/gear-inventory saves, jobs, paint/garage services, chapter missions
and ambient heat are not equivalent to all the new requested systems.

## Implemented here: reported input/aim defects

Bird kills used only bullet X/Y proximity, regardless of bird height or aiming
pitch. Remove that test entirely. An actual local firearm shot must intersect
the visible bird mesh using the center camera ray within 900 units and before
solid world, vehicle, actor or terrain obstruction. Empty weapons, snowballs,
remote bullets and open-wheel firing cannot grant bird kills. A confirmed hit
uses the existing one-time $29 reward and consumes the local shot; dead birds
cannot pay again. Falling/bobbing bird behavior remains. No new idle/random
kill path or change to zombie damage.

The wheel used client screen coordinates even with pointer lock. Maintain a
relative wheel cursor in locked mode; scale unlocked pointer coordinates from
the canvas bounds. Keep the camera still while selecting, clear held fire and
movement, cancel on blur/hidden/Escape/non-play state, and don't equip on a
cancel. Size wheel circles/text to avoid the original 50px-radius overlap on
small screens. Equipping snowballs is now silent; Felicia's explicit purchase
still queues buy/equip instructions. Her shop and existing recordings remain.

## Layout question needed for the next expansion

May the world boundary grow for the requested six-block neighborhood and main
highway, rather than replacing existing city blocks? The requested neighborhood
borders the bayou and Decatur Street near the mall, so its street/highway layout
should be agreed before rewriting parcel, traffic and mission placement.
No assertion that the existing map is full has been made. No blocks demolished,
world dimensions changed, or saves migrated in this bug-fix patch.

## Outstanding requested scope — not implemented here

- Six residential blocks with yards/houses and two multi-story apartment sites.
- Recording studio with browse/unlock beats; neon warehouse ring fighters.
- Food truck plaza/drive-thrus with health purchases and delivery side jobs.
- Chop-shop customization/rims/paint and street-race chains.
- Location-linked dynamic multi-stage jobs, bounty fights and night-only heists
  with security/payout rules.
- Wanted manager: stars 0–5, active cooldown, police visual-contact flags,
  crime inputs (civilian/cop attacks, theft, toll crashes), escalating police,
  cruisers/officers and roadblocks.
- Purchasable safehouses with unlock/save and separate gear storage.
- Working rear-view while driving (not a painted mirror).
- Multi-lane highway loop, airport and bayou/neighborhood exits, overpasses,
  guardrails, signage and lamps, US-side AI highway lanes/traffic spawning.
- Ambulance/fire response to accidents, gunfights and crime scenes.
- Level 29 Ent. / Blood in the Bayou / VIRAL billboard placements.
- Fuel/refueling and toll transactions with wanted escalation on crashes.

These need implementation and integrated playtests, not simply a new label or
menu that implies gameplay which does not exist. No claim of completion for
these systems is part of the current bug fix.

## Evidence / limits

New tests cover actual camera-ray miss/hit and wall occlusion, rejected shot
types, wheel pointer-lock/canvas scaling/cancel, and silent snowball equipment.
Full regression/build/native checks and preview result are recorded in the PR.
Existing Next.js security advisory remains unresolved and merits a separate
upgrade. No dependency/security changes are included. A new signed iPhone build
is required for installed native apps; web PR publication is not a production
merge or promotion.
