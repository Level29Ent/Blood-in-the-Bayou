# PR #151 repair

## Branch history

The old `fix/crash-movie-posters` head was based on an obsolete game history; GitHub compared 161 commits and 57,192 changed files against current main, including generated/dependency-tree deletions and historical game changes. The tip's actual new contribution was `.gitignore`, three uploaded character GLBs and `pbr-asset-loader.js`. The repaired PR is rebuilt as a single commit on current main and preserves all three uploaded binaries exactly (SHA-256 regression checks). Current Karma, roads, Natchez, interiors, parade, women/loc NPCs, community and deployment configuration remain from main. The older movie-poster/crash work already present in current source is not rolled back.

## Failing deployment

The failed check was **Vercel – public**, not the two root Next projects. That project's Root Directory is `public`, but the old branch lacked the current `public/vercel.json`; the deployment ran Next build without an `app` or `pages` directory. Rebuilding on main preserves the existing explicit static configuration (`framework: null`, empty build/install commands, output `.`). No dashboard setting or protection is changed.

## Uploaded models and corrected loader

`characters/Anthony.glb`, `characters/Drako.glb` and `characters/Ronniebaby.glb` remain unmodified. Each requires Draco mesh compression and embedded WebP images. The old module referenced invalid `three/examples/jsmloaders` / `jsmlibs` paths, expected a global THREE despite module imports, omitted Draco support, and claimed KTX2 readiness without renderer detection.

The replacement is a first-party classic-script API backed by bundled **Three r149** GLTF/Draco/Meshopt loaders and local Apache-licensed Draco JS/WASM. `init(renderer)` is explicit; KTX2 is enabled only when the existing matching loader is available and support detection runs. No model download or worker starts at script parse time. `loadCharacter(name)` accepts the three preserved filenames; lifecycle/readiness, same-origin URL checks and worker disposal are tested. Regenerate the loader bundle with `node scripts/build-character-loaders.cjs` using the locked dependencies.

`/game/character-assets-review.html` loads each actual uploaded GLB on button click, renders its embedded textures and provides a TURN MODEL control. It is an isolated static asset viewer, not a replacement for animated gameplay NPCs. The uploaded models contain no skeletal animation/skins. Existing procedural NPCs and the separate `models/characters/ronniebaby.glb` reference hook are unchanged; do not silently redirect the latter to a different model with different dimensions.

## Validation

Tests check binary preservation, embedded buffers/textures, actual local Draco decoding of every primitive, inert/initialized loader behavior, KTX2 support detection, decoder path, failure paths, disposal and static deployment configuration. Production Next build and standalone TypeScript check pass. Current source-integrity tests pass. The broader suite retains the three pre-existing missing-reference-GLB failures (a distinct absent `models/characters/ronniebaby.glb`, not the uploaded `characters/Ronniebaby.glb`). Browser and remote check evidence are recorded on the PR.

Native packaging already copies the character files and vendor subtree; installed iOS apps still require a new signed build. No archive or device-performance claim is made by this repair.
