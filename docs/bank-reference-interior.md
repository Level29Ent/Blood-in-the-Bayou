# Trust Bank reference interior

Existing Trust Bank branches keep their 256 × 224 parcels, service station, teller staff point, automatic entry and banking/mission handlers. Their placeholder teller/safe furnishings are replaced with original procedural geometry inspired by the supplied bank references.

The hall combines dark timber teller panels, pale stone counters, brass-framed glazed teller windows and service arches with pale tile, pilasters and bright ceiling panels. Waiting seats use black upholstery and metal arms. A consultation desk/computer/chair sits behind a frosted-band glass partition with an open side entrance.

A rear-left safe-deposit room contains 238 metal fronts with brass handles/keyholes. Its circular layered portal is open; the round steel/brass door is hinged to the side with a spoke wheel and perimeter locking blocks. The passage is not blocked by a solid disk. Storage/teller/office/seat footprints have collision reservations. No safe-deposit interactions or vault-door animation are added: this is an interior redesign, not a new heist system. Deposits, withdrawals, careers and existing mission robbery handlers remain unchanged.

Repeated architectural details and hundreds of deposit fronts are instanced. Total interior mesh draws are bounded below 60 in tests, with two small local sign/display canvas maps and no new dynamic lights, remote images or model downloads. Generic civic safe, estate, room clutter and finish passes skip this reference interior so they cannot refill the open vault or obstruct service routes. Physical-device frame rate is unmeasured.

`/game/bank-review.html` uses production furnishings with hall, vault, deposit-room, teller and consultation cameras. It omits the existing exterior/city shell, staff and transaction UI. It cannot establish full-city gameplay or mobile performance.

Checks: `node --test tests/bank-interior.test.cjs tests/source-integrity.test.cjs tests/city-detail.test.cjs tests/interior-realism-parade.test.cjs`. Covers player-radius reachability, open vault, bounded translated geometry, module order, existing deposit/withdraw code, actual production furnish integration, original staff/service coordinates and related regressions. Build, broad-suite and preview findings are recorded in the PR/task summary.

## Vault realism and valuables follow-up
The open door now has a deep steel rim, recessed face, concentric machined rings, radial linkage bars, 16 cylindrical locking bolts, hex fasteners, combination dial with tick marks, five-spoke wheel and paired hinge barrels. Gold/brass is reserved for accents rather than the entire door.

A wood/metal table inside the left side of the deposit room holds more than 45 banded cash bundles and jewelry trays with linked necklace, rings, faceted stones, bracelets and watch. These are fictional decorative valuables: no collectible rewards, player-balance changes or new robbery mechanics. A matching table collider leaves the central vault aisle clear. The review page adds a CASH / JEWELRY camera. Additional door detail increases the mesh budget, tested below 125 draws; physical-device performance remains unprofiled.
