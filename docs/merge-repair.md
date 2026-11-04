# Committed merge repair

Main 7ea9e075 contained committed `<<<<<<< HEAD`, `=======`, `>>>>>>> main`
markers in 34 source/config files. Several were malformed/nested, so simply
removing marker lines would concatenate incompatible implementations. The lock
and manifest JSON/YAML could not be parsed and game scripts failed syntax.

## Reconciliation method

Compared conflict alternatives to clean feature revision 103ecda5, then retained
the tested feature implementation where the other side would regress it:
expanded map, interstate/library/underground station, military/Powell troops,
20 mall interiors/aquariums/bank/jail/airport, health crosses, terrain/collision,
mission safety, graphics and audio fixes. Reapplied the clean reviewed bird/
wheel changes from 77b1a497 plus core-width compatibility for the extended map.
Kept later 0xff0000 steamboat paddles and billboard day/night emission, including
material registration before the extension builder. Retained the Felicia
proximity fix and standalone expansion source kit; they were outside conflicts.

The old alternative included runtime AdMob calls directly in a browser game;
kept the existing native workspace's managed/test-mode ad integration instead,
and preserved AdSense head configuration. No ad approvals, payment links,
secrets or production ad flags changed. Expansion kit remains a documented
standalone module, not newly integrated gameplay in this repair.

## Dependencies/configuration

Keep root native sync/archive and postprocessing scripts, esbuild, pinned Three
r149, native/ios-app workspace and existing Capacitor root config dependencies.
Keep newer requested Next ^16.4.3 and React/ReactDOM ^19.3.1 ranges. Regenerate
lock with pnpm rather than hand-selecting corrupt lock fragments. Frozen install
passes, resolving Next 16.4.5 / React 19.3.1. Native workspace remains at its own
pinned plugin version; no registry auth changes. Keep actual Bayou icon paths,
AdSense and newer service-worker behavior. Bump cache generation after repair.

The imported .next cache/build files already tracked in main are not included
in this repair's build-output diff. Other imported public-root legacy copies,
Mac metadata and native project copies are left alone, not silently deleted.

## Evidence

291 Node tests pass, including three new source-integrity tests checking no
markers, syntax of all first-party game JS, and exactly-once dependency-ordered
recent launcher scripts. Production Next build passes; TypeScript no-emit passes.
Actual-launcher DOM/Three scene harness loads the full script stack, generates
all seven chapters, enters library, and makes underground station roundtrip
with bridge deck/ramp elevations preserved. This is not rendered gameplay.

Native sync/source archive rebuilt from repaired game. ZIP integrity/source
parity and preview checks are recorded in the PR. No Xcode/device claim.
No production branch merge, promotion or dashboard settings changes by this
repair. Existing unrelated gameplay systems and larger pending requests are
not declared complete merely because the source builds.
