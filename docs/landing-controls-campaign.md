# Landing controls and single-entry cleanup

The active Next.js launcher still embeds `/game/index.html`. Its title now has
an actual whitespace character between inline title fragments and no trailing
period. The legacy standalone launcher's matching title typo is also corrected;
its other runtime behavior is unchanged.

The Play tab has a short movement/aim/fire/use hint, a native closed `<details>`
Controls panel, and a campaign list generated from the seven actual DISTRICTS
and MISSIONS_PER/CAMPAIGN_TOTAL constants. It covers 1–30, 31–60, 61–90, 91–120,
121–150, 151–180 and 181–210 exactly once. This is informational: it does not
bypass the opening story, alter chapter-to-zone routing or expose mission skips.
The full control panel remains keyboard/touch accessible, and shows the current
remapped movement/use/vehicle bindings when opened. Settings retains its more
extensive controls/remapping UI.

The separate CLICK TO ENTER audio dialog is removed. Code-ready enables Enter
the City, but does not allocate AudioContext, WebGL or a title city. The actual
play click invokes the existing ensureAudio/resume synchronously, starts the
single engine loop once, then uses the original first-frame queue for expensive
world work. Continue and host/join use the same entry method, including keyboard
join. Optional asset counters remain actual loading-manager counts, not a fake
progress clock. A browser-suspended AudioContext can resume on later gestures.
This does not override Spotify/third-party autoplay restrictions or claim to
solve the separately observed full-city startup timeout.

Construction currently owns a visible placement preview during ordinary play.
Its public `active` getter reports exactly that existing ownership condition;
no new construction mode, default, pricing or placement rules are introduced.
The earlier GTA cheat capture handler yields T to that owner; the later build
handler toggles snapping and stops further propagation. Outside construction
ownership the cheat shortcut remains. The contextual T cheat hint also respects
the construction owner, avoiding contradictory guidance.

Daily Spin inserts explicit whitespace between wheel label nodes and a readable
DOM prize legend with middle-dot separators. The eight prizes, probabilities,
24-hour cooldown and saved-receipt/claim logic are unchanged.

Tests cover all 210 ranges, Play-tab placement, native collapsed state, title
text, single-gesture audio-before-queue order, Continue/engine idempotence and
error behavior, real competing key handlers, prize separators and existing
reward/placement logic. Final build/typecheck/preview results are recorded in
the PR. Native downloadable archives are not regenerated.
