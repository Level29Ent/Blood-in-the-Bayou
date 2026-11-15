# Free starter bicycle

New solo games starting at mission one receive one free pedal bicycle near the
final player start position (including the opening story's casino approach).
A B map/compass marker identifies it. Use existing E / ENTER vehicle controls,
movement/steering and braking; use the existing vehicle exit action to dismount.
It is parked, not automatically mounted, so on-foot story interactions stay intact.
No cash is charged. Two wheels, diamond frame, saddle, handlebars and moving
wheels/pedals distinguish it from the existing cars. Chase view includes a simple
seated purple/green/gold rider proxy, not a full wardrobe-matched pedal animation.
The bicycle has no engine sound, cockpit dashboard or opening car-door prop.

Campaign saves and save-code exports keep starter ownership. Continue parks one
replacement near the restored spawn rather than storing exact bike location,
damage or riding state. A world rebuild/campaign handoff also restores one bike.
No automatic replacement while remaining in the same world after destruction.
Existing saves without ownership and multiplayer are unchanged. New games in
later chapters do not receive a starter grant.

Placement is bounded to 80 candidates within 128 units, checking whole-frame
road/walk/lot/plaza/bridge clearance, terrain height, parked vehicles and a clear
side approach. Blocked placement retries at most ten times at one-second game
intervals, never on every frame; no unsafe fallback or deletion of parked cars.
