# Gameplay room-entry stall repair

## Reproduced
The first legacy furniture-cover load scanned the full city graph and recomputed
world matrices/bounds for each furniture reservation (up to16timesperroom).
In the actual-launcher non-GPU fixture, direct room.load costs were:
- Donut:1123.9ms
- Diner:1278.2ms
- Records:491.8ms
The unchanged mission objective label also mutated the DOM5timesin5updates:
comparison used raw objective while assigned value had a `□ `prefix.

## Fix
Build one spatial static-mesh/geometry-reference index with each city build.
Room entry only queues legacy fixture conversion. One fixture processes per
active update,querying local indexed bounds rather than traversing the whole
city. Keep original geometry/solid until converted. Update shared geometry
ownership counts after extraction. Changed source bounds remain conservative.
Retain destruction/collider removal,queueinvalidations onfloorforget/worldreset,
register discovery after first converted counter,register reset onroomunload.
No save keys,map content,spawn caps,missionsorqualitysetting changed.
HUD changes only when final rendered label differs.

## Checks
Afterfix directload:Donut2.5ms,Diner0.7ms,Records2.3ms. These initialloads nowqueue
work ratherthancompleteallconversion synchronously. The samecheck processes26
fixtures,allpending0,9Donutlegacycovers,coverbreakworks;maxmeasuredstep17.6ms.
This is sourceCPUwallclock in nonGPUharness,NOT measuredSafariFPSormobile60fps.
Cityconstruction stillheavy (~7secondsinfixture);not a startup/crashresolution.

427Node regressions/build/TypeScript pass. Newtests indexquerystopsrepeatedtraversal,
translated/sharedgeometryownership,unchangedobjectivewritesonce,real runtimequeues
2fixtures/processesoneperupdate/keepscollisionandregister/damageworking.
DeployedpreviewresultsrecordedinPR. Specificplayer-reportedglitchstillunknown:
requestaskedstutter/flicker/movement/restartclarification. No claimallglitchesfixed.
NativeiOSZIPnotrebuilt;no newrenderlooporforcedrendererreinitialization.
