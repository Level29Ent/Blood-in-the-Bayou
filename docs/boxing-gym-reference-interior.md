# Tremé Fight House reference interior

The existing boxing gym receives an original procedural industrial training hall inspired by the supplied boxing-club photos. It remains inside the original fitness parcel; unrelated ordinary gyms retain their existing equipment.

- Raised blue-canvas ring with four colored rope levels, posts, corner pads, apron, ties and three entrance steps.
- Four yellow/purple suspended cylindrical and teardrop bags, chains and supported steel frames.
- Green central turf lane, rubber floor, weight racks and dumbbells, original geometric Fight House wall murals.
- Rough block/concrete-like walls, exposed rectangular ducts and circular branches, sprinkler pipes, fluorescent strips and hexagonal emissive light outlines. No dynamic lights, external images/models or copied mural artwork.
- Repeated fixtures are instanced in at most 36 material/geometry batches, four local canvas maps. This does not establish physical-device frame rate.

The new builder runs during production venue furnishing, replacing generic gym equipment only when `boxingGym` is true. Generic clutter/finish passes skip it. The later Tremé landmark pass does not add its old duplicate ring/bags; it uses the actual transformed ring center for the animated trainer, elevated to the new canvas. Footprint colliders reserve the ring, steps, bags, frame feet and racks. Ten-unit player-radius routes connect the entry, turf, bag approaches, weights and service area. The raised ring remains a trainer/display stage, not newly walkable player-ring combat.

The existing 30-second cue-based PUNCH/BLOCK lesson, qualification (eight clean moves, at most three errors), once-per-session $200 fictional reward, UI and map blip are unchanged. No new sparring or bag-hit mechanics are claimed.

`/game/boxing-gym-review.html` renders production furnishings in the 256 × 224 gym footprint with hall, ring, bags/turf, weights and ceiling cameras. It omits the city shell, staff/trainers and actual drill simulation, so full-city gameplay/mobile performance remain separate checks.

Focused checks: `node --test tests/boxing-gym-interior.test.cjs tests/treme-landmarks.test.cjs tests/source-integrity.test.cjs tests/interior-realism-parade.test.cjs tests/city-detail.test.cjs`. Covers routes, collision reservations, finite translated geometry, batch/ceiling limits, module order, production furnishing and frontage-transformed trainer integration without duplicate ring geometry. Build, broad-suite and preview evidence are recorded in the PR/task summary.
