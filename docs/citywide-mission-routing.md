# Citywide mission routing

## Scope

Campaign contacts and free-roam objectives use a shared, cached list of current-map street approaches. The list now includes the Tremé/campus/City Park parcels, cathedral, shelter, grain yard, pharmacy, hospital, streetcar barn, riverboat harbor, Greenmart, farm, airport, military, mall and coastal approaches where safe reachable streets exist. Nearby duplicates collapse to one destination; a label may be omitted if no safe street can be found within 640 world units.

Candidates must be on the largest connected street/walk graph, clear a player and vehicle footprint, be near ground level and stay outside the zoo combat buffer. A 3×3 geographic round-robin prevents a dense downtown venue list from monopolizing early choices. The 210 campaign IDs and tutorial remain unchanged. A first field stop can now be distant; subsequent checkpoints respect local distance bounds. Extra travel allowance is added to timed campaign stages.

Powell free-roam stages, civilian field shifts, city-career field jobs and merchant supply circuits share these destinations and avoid repeating stops where alternatives exist. Civilian jobs add per-leg travel time to both shift and call limits. Campaign and enterprise timers use simulation frames and seconds respectively as before. No difficulty, rewards, ownership or saved completion keys are reset.

## Deliberate exceptions

Not every mission should visit every district. Cathedral crypts, City Park beacon, riverboat deck clearing, university lab, local cashier/ward tasks, farm care, airport apron checks, fixed heist targets, boats and named story supply pickups stay attached to their actual venues. Protected zoo activities remain peaceful. Active/resumed story progress is not forcibly relocated. Dispatch distribution is roster-wide, not a claim of 210 bespoke rewritten stories.

## Graphics

This patch does not add shaders or replace assets. Existing quality-scaled ACES/PBR/bloom/reflection/shadow options remain unchanged. The procedural map and characters remain stylized, not AAA/UE5 quality. A photorealistic overhaul requires licensed/original high-quality assets, rigging and sustained target-device profiling. Heavier rendering is not justified while freezes/restarts remain unresolved.

## Verification

Focused tests cover nine-sector distribution over 210 IDs, fixed tutorial/story identities, no duplicate destinations, bounds, connected-road components, and travel allowances. Full regression/build/type checks and a generated-world audit are recorded in the PR. These do not constitute complete mission combat playthroughs or a mobile FPS guarantee. The iOS source archive is refreshed; no Xcode build or app release is performed.
