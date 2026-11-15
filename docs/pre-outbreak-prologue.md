# Before the Bayou

New **solo** games at mission 1 now start with a saved opening story. Completing it
returns to the unchanged 210-mission campaign and Ronniebaby's penthouse. Existing
campaign saves without prologue data and multiplayer starts retain their existing
entry flow. To experience the opening with an old campaign save, export SAVE CODE
first and intentionally start a new game; do not clear browser storage.

## Story order

1. Board the existing casino riverboat and meet **Sam Butcher at the back of the
   gaming deck**. The current casino is an off-street boat interior, so the first
   marker leads to its real boarding landing, not an unreachable world coordinate.
2. Find **Ahmad Ervins** walking with the moving second line in Tremé. Mardi Gras
   colors, brass players, hats, parasols, five moving crown floats and an original
   synthesized festival phrase accompany the crowd. This is a stylized celebration,
   not a claim to reproduce a particular parade or recording.
3. Retrieve Ahmad's phone from the porch of the apartments nearest the mall; bring
   it back to Ahmad in the moving festival.
4. Return to Sam. Retrieve the cordyceps book from the existing public library's
   science shelf and bring it back.
5. Find Ahmad at the university and escort him to Sam's garage alley. He follows
   on foot, using the university doorway and street navigation; he waits if the
   player gets more than 30 game metres ahead. His AH map/compass marker and
   escort waypoint remain available if separated.
6. Retrieve his lab coat and goggles at the university, the Science Kit at the
   Greenmart checkout, and honey from Chief Jojo. Bring all four items to Ahmad.
7. The light changes to dusk. Ahmad puts on the coat and goggles and walks through
   the garage doorway. Approach the garage and use **U / the story button**.
8. Garage scene: `dyg3Wbx4iSc`.
9. Meet Ahmad in a black shirt, blue jeans and glasses at the mall beside a seated
   resident. Mall scene: `vAZoEoBmff0`.
10. The outbreak begins: civilians flee moving zombies. Find Ronniebaby's existing
    GLB avatar on the second neighborhood street. At roughly six feet (18.3 game
    units, using the renderer's 10 cm/unit convention), the final scene prompts:
    `jy8lyAr8620`.
11. The original map/campaign starts, with Ronniebaby back in his penthouse.

All pickup and dialogue steps require proximity, being alive and being on foot.
The escort cannot complete while Ahmad is absent. Items are consumed only by their
proper return step. The original campaign's mission index is not advanced by errands.

## Saves and failure recovery

The existing `level29.campaign.v2` record embeds a versioned `prologue` checkpoint;
SAVE CODE / LOAD CODE therefore carry it without a separate browser-storage key.
Each transition is saved, and ordinary autosave still works. A scene checkpoint
resumes with a Play prompt rather than silently treating an unfinished film as
watched. An explicit new game restarts the prologue; resuming a legacy save does
not. Death restores the current prologue objective and items without running the
original campaign's delayed safehouse/death timer.

## Native story cutscenes and audio

The three former YouTube checkpoints now play original 18-second in-game scenes,
not embedded videos or shot-for-shot copies:
- **The Experiment:** Ahmad in his lab coat/goggles testing the X29 vial at a lab bench.
- **The First Signs:** Ahmad in black shirt, jeans and glasses beside the seated man
  after giving him X29; the man begins reacting.
- **Blood in the Bayou:** Ronniebaby strikes three staged zombies with a melee bat;
  they fall and stay down, with no live-world combat rewards or damage.

PLAY SCENE starts a bounded 640×360, pixel-ratio-one WebGL scene only after a
user gesture. Visual copies preserve live actor materials/geometry/skeletons;
new materials and baked skinned geometry are released on completion, skip,
return, pagehide or a render error. No video iframe, external playback request,
new model download or automatic audio autoplay. Subtitles are original dialogue;
there is no newly recorded character voice or lip sync. Existing game audio is
muted while the panel is open and restored afterward. The paused world draw is
suspended during scene playback to avoid two active world renders.

SKIP SCENE / CONTINUE STORY explicitly advances the existing checkpoint. RETURN
TO GAME · WATCH LATER leaves it pending. Completion advances only after the
18-second sequence; hidden-tab time is not counted. Errors offer retry/skip and
never silently complete a scene. Save format, original scene IDs and campaign
handoff are unchanged. Physical-device performance and appearance require a
READY preview and playtest; deterministic tests are not rendered verification.

## Rendering and compatibility

The opening's residents use 420 lightweight world descriptors with at most 104
nearby residents/marchers rendered in nine shared instance batches, plus two floats
and a small fixed named-character pool. Far-away routines are not simulated every
frame. Crowd paths and the festival use the existing cardinal street graph. The
original mobile rendering budget remains unchanged. Normal zombie spawning, heat,
fire and Ronnie's original campaign interaction are gated during the peaceful
opening; outbreak combat is enabled after the mall scene. No original mission or
save data is deleted to perform the handoff.

The garage's ordinary door is temporarily kept open for Ahmad and restored on
cleanup. Scene resources owned by the prologue are removed without disposing the
shared human geometry or Ronnie GLB template.

## Checks

- `node --test tests/prologue-story.test.cjs tests/prologue-runtime.test.cjs`
  exercises all 19 checkpoints, video source/origin validation, interaction bounds,
  real runtime wrappers, item return order, escort gating, lab/mall outfits, death,
  peaceful/outbreak gates, legacy/multiplayer entry and the original-campaign handoff.
- `/game/prologue-review.html` is an isolated shared crowd/float and story-state
  component review. It is **not** the generated full city, escort integration or a
  phone performance benchmark.
- Device acceptance: start a new solo game, complete both casino visits and all
  errands, test save/continue and code export/import midway, follow Ahmad through
  both doorways, reject/skip one film, finish another, and verify Ronnie's GLB
  proximity scene and the penthouse handoff. Keep an exported save when testing.
