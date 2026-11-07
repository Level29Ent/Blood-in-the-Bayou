# Diagnostic-led mobile/road repair

The supplied Safari logs show Low at 13–14fps with ~2,200drawcalls, pixelRatio1 despite mobileSafe=true, growing uploaded GPU counters, and no captured exception/context-loss. These counters do not prove a leak, a particular crash cause, or successful new-code delivery.

Confirmed renderer conflict: the multiplayer render wrapper reset ratio during solo frames as well. Solo now leaves resolution ownership to adaptive control. Multiplayer caps only downward and respects a lower adaptive value; the adaptive controller reads the actual ratio and never rounds above the cap. Resize reapplies the mobile cap before reallocating buffers.

Mobile ordinary walkers/runners 140–470units from camera can use a shared six-part instanced visual (up to48). Selection happens before detailed figure allocation, not after. Near, military, brute, scaled/story enemies and overflow retain their normal models. The existing entity positions, health, navigation, bullets and rewards are untouched. This is a simpler distant silhouette, not an upgrade to character realism or full-world streaming. Pool allocation does not grow with total visited zombies.

Map audit reproduced a 7tile-wide road interrupted by 3waterrows near x4128–4352,y2688–2784. A protected-parcel-aware helper fills only short, level, straight crossings with adjacent parallel lanes and existing roads at both ends.21bridge tiles repaired; one-tile pier/open water and elevated mismatches are not extended. Bridge meshes/rail collisions correspond to repaired tiles. Existing road component remains connected. No unsupported parked car chassis was found in source generation; the screenshot's raised-car appearance remains unconfirmed in normal play.

Performance events add build profile, live pixel ratio/drawcalls and distant-zombie count to distinguish this fix in future diagnostics. Existing saves/map untouched. Native source ZIP refreshed, not compiled/signed/released.

Tests/build and final-preview findings are recorded in the PR. No assurance of all bugs fixed, crash-free iPhone play,60fps,less loading time or sustained gameplay is implied by this patch. Entire world still builds eagerly; architecture/device profiling work remains.
