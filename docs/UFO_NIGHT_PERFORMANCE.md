# UFO / nighttime performance repair

The friendly event still runs from 21:00 to midnight, with four allies and the existing bounded horde/reward logic. The saucer now has a stepped metal hull, dark dome, lower engine ring, 24 segmented rim lights, 16 vents and 12 observation ports. Repeated details use three InstancedMeshes and existing materials; no additional dynamic lights/shadows, textures or reflection cameras are allocated.

## Confirmed nighttime workloads

- The police patrol filtered the full building list every active frame for an unchanging station clearance height, and filtered zombies even while retaining the same target. Clearance is now cached per generated world; target searches run at six-second selection boundaries or if the current target dies/leaves range. Empty selections wait for the next slot. Patrol schedule and behavior are unchanged.
- Legacy street light pools were one transparent instance batch containing every intersection. A GPU cannot individually frustum-cull instances in this batch. Upload only the nearest 12/24/32 pools on Low/Medium/High and reselect after camera moves into a new 32-unit cell or quality/time phase changes. Poles, fixtures and signals are unchanged. No nearby pool limit changes zombie spawning.
- Ray-marched fog used day/twilight budgets at night. Night caps are one volume with 8 samples on Medium or 16 on High, versus two×12/four×24 during twilight. Low remains zero. Fog distance follows the current vehicle when driving, not the character's parked coordinate. This reduces effect density intentionally; it is not a new global quality downgrade.
- UFO countdown text changes only when the displayed game-minute value changes.

## Evidence and limits

Regression tests execute 600 live-target patrol updates: one building scan and at most two target scans, rather than one per frame. They also cover empty targets, bounded nearest pools and actual instance count changes, zero Low volumetrics, and UFO resources. These are deterministic workload reductions, not measured device FPS gains. The isolated UFO review is `/game/expansion-demo/ufo.html`; it is not the full city. No crash-free or 60fps guarantee. Native source archive is refreshed; signed iPhone build/device testing is separate.
