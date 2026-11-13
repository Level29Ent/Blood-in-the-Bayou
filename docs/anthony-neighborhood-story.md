# Anthony, Draco and Ronniebaby gameplay placement

## Models

The uploaded Anthony GLB contains three disconnected people across X. `singleAnthony` keeps the left person's complete triangles using the measured empty X gap (< -0.12 in the original upload), preserving UVs and materials. The original file remains byte-for-byte intact. Only the extracted model is fitted to 23 game units for Ant and the asset viewer. This is one chosen supplied figure, not three overlapping clones or a portrait billboard.

Ant is placed at a reachable navigation point beside an existing Tremé/neighborhood home and marked ANT. Draco uses the uploaded `Drako.glb` behind Karma's counter as its shop owner. U at Karma's service point greets the player as Draco. Ronniebaby's existing proximity/story loader now uses `characters/Ronniebaby.glb` through the Draco-capable loader and fits it to game height. Existing mission roots, identity labels and location/elevation stay unchanged; fallback figures remain until loading succeeds. These uploaded GLBs are static/unrigged. Ant's fighting is implemented by game combat state, facing, counterattack cues and damage, not newly claimed skeletal punch clips.

## Ant's errands (solo, after the prologue, no other active mission)

1. Meet Ant in the neighborhood and U / on-screen action to accept the Superdome pickup.
2. Meet **Nora and Elise, two adult women**, at the reachable Superdome entrance. U recruits both.
3. They follow the player's street graph and do not cut through buildings. A nearby stopped road vehicle can carry them (not boats, bikes or ATVs). Stop nearby to board; exit near Ant to hand them off. On foot works too. Both must be alive and back at Ant before the next errand.
4. Talk to Ant to accept the Greenmart errand. At the ground-floor checkout, U collects a sealed condom pack. Return and U hands it over. This is a non-explicit item errand; no sexual scene or transaction.
5. Talk to Ant to accept the liquor errand. A new enterable Neighborhood Liquor Store with street access and LQ marker supplies the bottle at its counter. U picks it up; return toward Ant.
6. Arriving near Ant triggers the reveal: the same two women's civilian visuals disappear and exactly two female zombie actors appear. They attack Ant/player; Ant counterattacks, with visible impact cues and an HP display. His assistance never lands the final blow. Player help plus both actual defeated targets completes the story. Despawn/death/guard-only interruptions cannot fake completion.

The chain adds no repeat cash reward. Existing pickups, weapons and zombie combat remain. Ant can be overwhelmed, the escort can be lost, and player death interrupts the attempt. Return to Ant and RETRY from the last safe checkpoint; failed encounters are removed before retry to avoid duplicate enemies. Checkpoints persist in the normal campaign snapshot, alongside the prologue. Escort-in-progress resumes at the pickup; fight-in-progress resumes at the approach/reveal. New Game resets the chain. Other active activities pause Ant progression; the ordinary Begin Mission action is guarded while an accepted Ant errand is active.

## Validation and limits

Automated checks exercise the full runtime accept → both-women pickup → escort handoff → Greenmart → handoff → liquor → ambush → player kills → completion, wrong locations, wrong Greenmart floor, busy/prologue/death gates, transport boarding/disembarking, checkpoint restoration, enemy cleanup and no completion by despawn. Source/core tests cover no repeated completion, geometry extraction/material preservation, model fitting, loader dependency order and campaign integration. Build/typecheck pass; full suite has only the same three tests for the missing old procedural reference GLB. Browser evidence is recorded on the PR.

`/game/anthony-story-review.html` is an explicitly isolated production core/model viewer with simulated location/escort inputs, not an actual in-city route traversal. `/game/character-assets-review.html` now displays one extracted Anthony. Phone performance and a complete human-controlled drive/escort route are separate acceptance checks. The downloadable iOS source archive is refreshed through the repository's packaging script; it is not compiled or signed.
