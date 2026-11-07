# Indexed world, room and vehicle batching

The prior batchers expanded indexed geometry into independent triangle vertices. Retain an index buffer per combined material/spatial bucket instead. Each transformed source vertex is emitted once per material range; material boundaries, UV seams, hard normals, triangle order, world positions, bounds, collisions and draw grouping remain intact. Vehicle coachwork also retains source indices. No map parcels/assets/missions are removed and no lower quality setting is required for the benefit.

A compact-instancing prototype was discarded: it slightly reduced memory but increased scene submissions. The shipped change retains existing merged mesh counts.

Same generated city in non-GPU harness:
- Before: 195,293,640 summed vertex attribute bytes; 172,185,208 unique attribute/instance-array bytes.
- Final: 129,622,152 summed vertex attribute bytes; 106,513,720 unique attribute/instance-array bytes.
- Mesh count unchanged: 14,855; 80 venues and one connected street network preserved.

These figures EXCLUDE index buffers, textures, driver allocations and other JS objects. They are not total VRAM or a measured crash/FPS fix. Extra indices consume memory too. CPU construction samples varied around 9–11 seconds; no reliable loading-time improvement is claimed. All world geometry is still constructed eagerly; true world streaming, lower-complexity actors and physical iPhone endurance profiling remain necessary work.

Tests compare exact transformed triangle positions, material groups, index counts, bounds and room/vehicle topology. Production build/type/full suite and exact-preview results are recorded in the PR. Source iOS ZIP refreshed, not a compiled/signed release. Saves preserved. No guarantee of all mobile issues resolved.
