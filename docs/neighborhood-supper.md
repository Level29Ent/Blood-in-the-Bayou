# Neighborhood Supper — five linked side jobs

Start from the existing pause menu: **NEIGHBORHOOD SUPPER · 5 JOBS → ACCEPT JOB**. Follow the gold **N** marker to an exterior business handoff. On foot, use **U** or the dedicated touch button. Collect at the first stop and deliver at the second. Each job needs a separate explicit acceptance; later jobs unlock in order.

| Job | Route | Abstract quest parcel | Game-cash reward |
| --- | --- | --- | --- |
| Keep the Wheels Turning | Bayou Hardware → 29 Tow & Impound | Fasteners | $250 |
| A Favor for the Mechanic | Tow yard → Tire Shop | Cart repair kit | $350 |
| Kitchen on Wheels | Tire Shop → Creole Night Diner & Truck Stop | Replacement cart wheel | $450 |
| Supper Across Town | Truck stop → Chief Jojo / Major Cajun | Supper supply order | $550 |
| Bring It Home | Chief Jojo → Tow yard | Crew supper | $1,400 |

Clerk, dispatcher, mechanic, cook and Jojo dialogue links the errands to one community-supper story. Completion awards **Neighborhood Ally**, a title displayed on this job board, not a new global reputation system. The five jobs pay $3,000 total once per campaign. No actual cart repair/towing simulation, escort, new voice recordings/NPC models, item inventory, road changes or paid purchases. Parcels are tracked quest state, not physical crate models. Existing store services, prices and campaign mission rules remain unchanged.

## Persistence and interruption

Optional versioned `neighborhood` field lives in the existing campaign snapshot alongside cash, so Continue and existing Save Code transfer it together. Old saves initialize at job one. New Game resets this chain. Pickup, delivery/payment, acceptance and tracking changes trigger existing save; storage failures use the existing save error warning. Pause tracking retains a carried parcel. Death clears only the unfinished parcel/acceptance; completed jobs and payouts remain. Reaccept to retry pickup. No timer, fee or repeatable completion payout.

Other jobs/stories/campaign combat/prologue and multiplayer take precedence: this route's marker/actions yield and return when safe. It does not cancel or modify other stories. Campaign missions can be started while tracking; no additional mission-lock wrappers. On-foot, height and non-streamed/non-riverboat checks prevent remote or wrong-floor handoffs. Dedicated action consumes its own input; normal service dispatch remains available away from the handoff.

## Placement

Uses actual semantic business identifiers, existing frontage and nearest pedestrian-network point (12-unit clearance, capped 160 units from its entrance), plus current static collision and ground-height checks. No guessed coordinate fallbacks or new structures/colliders. If any business or safe handoff is missing, acceptance is unavailable and the board names it instead of paying out or placing a remote marker. Targets refresh on city rebuild. Graph/clearance checks are not proof of full-world route reachability or safe traffic crossings.

## Validation

Pure-core and VM runtime tests cover the complete five-job loop/payouts, explicit gates, ordering, repeated input, cash+progress snapshots, pause/reload/retry/New Game, old/corrupt save input, default services, blockers, rotated frontage, invalid/offshore targets, and competing story/player conditions. Production loader order and campaign integration have regression assertions. Full-world traversal and desktop/mobile UI must still be exercised on the published preview; synthetic tests do not establish rendered appearance or generated-city reachability.
