# Building / mission glitch investigation

## Reproduced in the current main revision

The merged game entry page had 64 repeated external script tags. In particular,
`game.js` loaded twice (`SyntaxError: Identifier 'msg' has already been declared`)
and the wrapping modules for venues, missions, city generation, controls, weather
and Powell were registered twice. Several non-IIFE globals fail redeclaration;
IIFE wrappers instead attach a second time, so the resulting application state
can differ depending on which modules fail. This is not a cosmetic duplication.

Remove the duplicate tags, keeping the newer retail/mall block (including plant,
aquarium/tire shops and neon lettering) before frontage/terrain/final build-once
wrappers. Each script now appears once irrespective of query version. No map,
progress/save key, mission roster, earnings configuration or reward is reset.

The guidance renderer also kept obsolete primary target/resource/checkpoint
markers after campaign field and extraction stages began. Operation stops and
robbery return trips did not supply correct secondary labels, and boss evidence
collection's primary marker fell back to the original fight site. Make guidance
select the actual active stage and point the boss pickup at the dropped evidence.

## Evidence

- Regression tests failed on the duplicated launcher and stale phase/return/boss
  evidence targets before the fixes; all four new regressions pass afterward.
- 240 Node tests pass, including existing building-frontage, enclosed malls,
  operation/flight/reward and navigation regressions.
- Local actual-game-script DOM/Three harness previously stopped at repeated
  `game.js` with the redeclaration error. Now the entire launcher script list
  evaluates, all seven chapters generate, and mall lift round trips, elevated
  exit collision, eight shops, police staff identity and Powell initialization
  succeed. Local building inspection found all 56 interior entrance sample
  points clear when the corresponding door is open. It is not a rendered test
  or proof that every possible furniture route is clear.
- Production build, TypeScript no-emit and refreshed iOS source archive pass.
  ZIP integrity, exact mission code parity, and no duplicate script paths in
  the native entry are checked. Installed apps require a signed native update.
- The existing Next.js security advisory remains: a separate upgrade is still
  recommended. No dependencies or security versions changed in this patch.

Rendered preview and full mission playthrough verification are recorded in the
PR. Do not claim these fixes resolve every building or mission glitch without
reproducing a player's specific case. No production merge/promotion here.
