# Expanded-world visual polish

Preserves restored map,missions,NPC identities,combat and city locations.
No Unreal runtime,Lumen,Nanite,photoreal scans or promised UE5 equivalence.

- Ordinary scenery buildings receive instanced façade geometry:window-edge
  reveals/sills,corner trim,floor/roof bands,canopies and roof HVAC. Two shared
  material batches for entire overlay;castShadow off. Existing venues and special
  landmarks excluded;walking doors/colliders unchanged. Hidden on Low,enabled
  Medium/High. No new full-city renderer/camera or unbounded per-building loop.
  Instance bounding boxes span district,so frustum culling is conservative;not
  per-window occlusion/LOD despite a future budget helper being available.
- Existing256px tileable texture system gains mineral pores/slow plaster relief.
  No extra resolution or external asset downloads. Existing map/normal/roughness
  sharing and color management remain.
- Existing Medium/High composer grade gets small contrast/saturation lift,warm
  highlight bias and subtle edge falloff;High adds low-amplitude grain using
  existing pass,not extra target. Low composer remains unallocated. Not physically
  correct film/lens simulation;grain optional via quality selection.
- Existing bayou PBR shader gains slow diffuse-color swell modulation;existing
  water normals/ripples/fog unchanged. No planar reflection camera/refraction or
  SSR added during stability work. Low still uses original water.

Original RonniebabyGLB remains a separately produced static asset;not secretly
converted into rigged talking/walking NPC. High-quality city art/animated assets,
full vegetation replacement and comprehensive cinematic makeover remain unfinished.
This pass is tangible geometry/surface/postprocessing work,not a declaration that
all requested graphics work is complete.

363Node tests pass:150buildingoverlay has2instance draws,landmark/venue exclusions,
full existing postprocess resize/failure/Low fallback tests with shader-uniform
fixture updated. Production build/TypeScript pass after platform-native reinstall
(local uploaded dependencies still require this). No dependency changes committed.
GPU review scene uses exact builder but simplified supporting geometry;not all-map
performance/appearance proof. Final browser evidence in PR. Native app source ZIP
not updated by this web-only patch. Physical Safari long-session restart remains
unconfirmed;no all-crashes-fixed claim.
