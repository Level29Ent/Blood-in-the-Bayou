# Grounded story cinema refresh

The three 18-second prologue scenes remain original in-engine story staging,
not prerecorded films, external video embeds or photorealistic motion capture.
Story beat order, captions, completion, skip and watch-later remain unchanged.

## Presentation changes

- Garage: a supported workbench with drawers, shelves, lab rack, papers and an
  overhead fixture. The X29 vial follows Ahmad's hand through a single deliberate
  inspect/tilt/retract gesture instead of floating and bobbing independently.
- Mall: a correctly raised bench, shopfront framing, planters, paving seams and
  a small bin. The seated resident's root remains on the floor, with articulated
  legs and a restrained torso/arm reaction instead of high-frequency shaking.
- Ronnie: street frontage, pavement, framed glazing and lamp dressing. Three
  paced approach/strike/recovery beats replace constant repeated bat spinning.
  The existing animated Ronniebaby GLB is loaded exclusively for this scene;
  cloned in-place walk/slash clips use an owned mixer and a hand-mounted bat.
  The original actor is retained if the optional load fails. This is not new
  hit-detection combat or mocap; infected falls remain procedural.
- Per-scene establishing, action and reaction framing with bounded eased dolly
  moves replaces the identical orbiting camera. No random screen shake or blur.
- Balanced warm/cool lighting, ACES exposure 1, soft 512-square directional shadow,
  shared surface grain and modest distance haze ground feet/props. Output is
  capped at 960×540 with pixel ratio 1; no composer, full-screen AO, DOF or bloom
  targets are added to the story renderer. Source character materials retain
  their authored compile hooks and independent colors.

The live city render remains paused while this existing isolated story renderer
is active. It still uses a separate context, as before; this is not proof of
mobile GPU endurance. Ordinary source characters are copied/baked without
sharing a live skeleton. The optional animation asset has its own skeleton,
geometry, materials, textures and mixer; these are disposed on close, including
late asynchronous loads after cancellation. The old flat set meshes were
removed rather than layered under the new sets.

## Review and limits

`/game/story-cinema-review.html` runs the production player and staging with
production figure constructors for Ahmad/resident and the real animated GLB
for Ronnie. It is a component review, not a full-city playthrough. Review each
scene at its three six-second shot boundaries; check hands/props, feet/contact
shadows, seated pose and scene cancellation/replay. Automated tests verify
framing, grounded props, shared-resource bounds, owned-mixer root motion,
async cancellation, source non-mutation, timeline endings and cleanup.

Actors remain stylized game artwork. No facial animation, lip sync, recorded
voice performance, new cinematic music, scanned environment or finished edited
trailer is claimed. The gameplay trailer requested previously is still separate.
Legacy standalone public/index.html and the downloadable native ZIP are not
regenerated. Final tests/build/browser evidence are recorded in the PR.
