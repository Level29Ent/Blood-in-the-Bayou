# Armory showroom correction

The showroom cloned first-person weapons, including their attached glove/sleeve
meshes. Those black arms appeared as oversized floating shapes over the stands.
The original 17-unit model height budget and 14-unit stands also put exhibits
above eye level and across the view of the dealer.

First-person-only parts are now tagged by both weapon builders. The detailed
weapon baker keeps that tag separate even if arms share a material with a gun.
Showroom cloning removes tagged arms and additive muzzle effects from the clone
only; held weapons retain their hands/arms and shooting behavior. No shared
geometry or materials are disposed during this filtering.

All nine displays move to side-wall galleries with a wide central aisle. Stands
are 8 units tall, models fit a maximum 7-unit height with scale capped at .55,
and all attachments are included in the bounds calculation. Existing exhibit
names, weapon inventory, combat stats, purchases and dealer service remain.

178 Node tests pass. Added regressions cover all nine stand footprints, aisle
clearance, clone filtering without mutating held weapons, and preservation of
tags during material batching. Existing oversized-model fitting tests enforce
the lower display heights.

A separate local game-script/DOM harness built the actual weapon pools and an
armory: all nine exhibits had no first-person hand tags, scales no greater than
.55, and measured model heights from about 1.96 to 7 units. This is source/scene
hierarchy evidence, not a WebGL visual check. Deployed gameplay appearance and
physical-phone performance still need visual verification.

Web production build, TypeScript no-emit and iOS source archive generation pass.
The existing Next.js security advisory still requires a separate upgrade. The
refreshed iOS ZIP requires a new signed build for installed apps.
