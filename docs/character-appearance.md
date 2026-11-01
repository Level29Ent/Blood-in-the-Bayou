# Readable human characters

This is a procedural, game-resolution improvement, **not photorealism**, a face
scan, or a claim of exact likeness to the reference portraits.

## Shared humans

The civilian rig keeps the original limb pivots, height range, skin/clothing
color hooks and wardrobe interfaces. Faces now have rounded eye whites/irises,
eyelids, a shaped nose bridge/tip, cheeks, separate upper/lower lips and an oval
head/jaw rather than box eyes/nose. Long hair's hemisphere now covers the BACK
of the head: the former hemisphere covered the forward-facing side, obscuring
faces. Zombies retain their glow eyes, helmets and existing rig.

## Named characters

- Ronnie's face is no longer deliberately hidden. His jacket preserves the
  torso's original scale instead of resetting it to a narrow cylinder. Shared
  hands replace duplicate block hands. Mustache/chin details are sized around
  the visible mouth. Locs are round, with shared geometry and no hundreds of
  separate twist-band meshes.
- Bonnie now uses the full human rig (face, hands, articulated arms and legs),
  not the old cylinder dress/head assembly. Dark-green clothing, braids, gold
  headband/earrings and human scale remain distinct; her pose faces the front
  of the dealership.
- Alex and Dayshawn's beard shapes no longer engulf their lower heads. Felicia's
  hair tips sit behind the face. Sheldon's headwrap now has finite, correctly
  ordered placement arguments instead of a material passed as an X coordinate.
- Eight named identities have distinct head/jaw-width profiles and short-range,
  depth-tested name/role labels: Ronniebaby, Bonnie, Chief Jojo, Alex, Dayshawn,
  Felicia, Sheldon and Damion. Labels are supplementary, not replacement faces;
  they disappear at a distance and do not draw through walls.

Shared geometries and a cached texture per identity avoid extra downloads or
render passes. Labels are checked during the existing dynamic-sync pass. The
original wardrobe, dialogue, gameplay and animation hooks remain in place.

## Verification / limits

Regressions build the actual rigs and named figures, verify finite detail bounds,
face visibility/occlusion, color isolation, reusable geometry, nameplate distance,
Bonnie's human height and all 100 wardrobe items. A Ronnie-specific check bounds
mesh count and verifies the corrected torso proportions.

Web build, no-emit type check and iOS source archive generation are checked.
These do not prove rendered resemblance or physical-phone FPS. Deployed browser
and iPhone visual checks remain required. The refreshed native source archive
still requires a newly signed app release for installed iPhone apps.
