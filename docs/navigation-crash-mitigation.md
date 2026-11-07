# Navigation CPU mitigation

Previous Safari logs contain no recorded exception/contextloss proving a crash cause. This patch targets confirmed expensive navigation work,not a guaranteed crashfix.

The street graph previously scanned every building and every tree for each tile; now footprints and tree exclusion circles are rasterized once and intersected with allowed terrain. Strict12unitbuilding margins and16unittree distance semantics remain unchanged.

Nearest-node queries previously scanned the whole expanded map on every call,including off-network actor normalization. Search now expands rings around the query and stops only when all unsearched tile centers are provably farther than the best valid candidate. Equal-distance ties retain lowesttilekey. Radius/walkability and full search fallback remain;empty graph returns-1.

No actor/missions/map/saves/quality reductions. Collision masks and navigation paths remain equivalent in seeded tests. This is not worldstreaming and does not unloadcitygeometry or establish mobilememory/endurance. SourceZIP updated,not compiled/released. Benchmarks/tests/preview recordedinPR. No allcrashesfixedclaim.

Venue collisions/indoor checks now query nearby footprint buckets,then apply unchanged exact tests. Index rebuilt percity/count;normal doors/furniture remain dynamic andcheckedafterbroadphase. Seeded querytests ensure no relevant footprint omitted. Generatedworld retains80venues/one-roadnetwork;60warmupdates measured887ms versus earlier1225–1346ms. Different runs/ambient randomness make this indicative,not controlledFPSproof. Same-VM synthetic240×208 graph benchmark:18862.9→44.3ms construction;100nearestqueries1961→3.8ms withsamechecksum. Synthetic oldVM numbers are not expectedphone timings.
