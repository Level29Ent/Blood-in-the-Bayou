# Current GLB application

## Available models
Main at 4a6c19cf contains Ronniebaby and five watercraft GLBs: bowrider,
cruiser, pontoon, skiff and steamboat. There are no GLBs for other named
characters, buildings or cars at this revision. The website already has
loaders for these six assets; this change does not create replacement assets.
All six have embedded dependencies and no skeletal animation clips.

## Changes
- Resolve Ronniebaby's model relative to the game document. Both website
  `/game/index.html` and Capacitor's bundle-root index now find the model.
- Preserve the mission actor, ring, identity sprite and legacy data. Hide the
  old body only after the GLB loads successfully. Failed loading keeps fallback.
- Refresh the downloadable iOS source ZIP from the current game. It was missing
  Ronniebaby and his loader. All six archived GLBs now match Git byte-for-byte.
- Preserve the existing native Xcode scaffold and ad consent/test settings.
  The package stager now also handles the versioned ads.js URL correctly.

Run `node scripts/refresh-ios-assets.cjs` to refresh an existing source ZIP.
This is not a signed/compiled app. Xcode/iPhone testing and a new native release
are still required. Other platform-specific features/URLs require device review;
no claim of complete Capacitor or crash verification is made here.

## Review
`glb-activation-review.html` uses the actual Ronniebaby installer and matching
GLTFLoader to display each real repository model. It is not full-city gameplay.
Boats retain their existing loader and scripted paddle-wheel rotation.
Test/build and exact preview findings are recorded in the PR.
