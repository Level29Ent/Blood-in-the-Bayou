# Bayou polish and Aftermath chapter

## Scope

This is a primary `/game/index.html` polish pass, not a new city, replacement of authored interiors, photorealistic overhaul, or rewrite of the 210 campaign missions.

- Title controls refresh from the active bindings on initial load, rebind and reset; starter-bike and new ingredient/story actions use binding labels.
- PeerJS (92,865 source bytes) is requested only when hosting/joining, with a shared promise, timeout and retry. Solo players do not parse that library at startup. This is not full-world geometry streaming or a measured load-time/FPS guarantee. Existing Low mobile budgets and adaptive 60-to-30 pacing remain.
- Campaign autosaves keep up to three distinct previous multi-record checkpoints. Import validation checks size, JSON complexity, dangerous object keys, campaign indices, money, upgrades/ammo, collectible IDs and partial mission shapes. Import replacement backs up first, removes absent allowlisted records instead of mixing two saves, and rolls back on a storage-write failure. Malformed current records are preserved separately as raw recovery data, never treated as valid saves. Quota failures can prevent a backup; manual restore aborts if it cannot preserve current records. Export before clearing browser data.
- `SAVE CODE` / `LOAD CODE` remain compatible with existing valid L29 codes. `LOCAL BACKUP RECOVERY` restores the latest; `CLOUD SAVE / BACKUPS` offers the three stored timestamps. No authentication/session keys are exported.
- The existing settings/journal contains the chapter/foraging board and backup controls. New dialogs, markers and buttons share a restrained palette and 44px controls, with native dialog focus handling. Existing store art, layouts, collision and roads are unchanged.
- Original synth envelopes now distinguish shotgun, SMG, rifle/marksman and default reports without extra audio downloads/voices. Existing mute/SFX routing remains. Hit confirmations include HIT/KILL text; up to six nearby melee windups gain an orange STRIKE ring. Existing 18-tick attack windups and damage remain unchanged. Ambient respite triggers only after actual campaign completion, not entry to an extended field stage.
- Context tips follow actual movement, driving and firing and explain backup recovery. They are paced rather than all replacing one another in the first frames. No mandatory second tutorial or change to prologue errands/cutscenes is introduced.

## Three optional radio missions

Open **Settings / Journal → Journal → Bayou Aftermath / Foraging** after the prologue and outside another active mission/job. The chapter uses captions from Sam, Ahmad and Ronnie and existing street approaches. These are radio contacts/dead drops, not newly voiced or animated NPC encounters.

1. **Paper Trail:** read Sam's manifest at the riverboat boarding approach, compare the university ledger, then radio Ronnie at the mansion street approach. Clue order and on-foot proximity are required. $400 game cash.
2. **Quiet Medicine:** collect a sealed medical cache at the university only after two continuous active seconds on foot without alerted infected within 140 game units, then deliver to the hospital. This does not grant invisibility or spawn a separate encounter. $650.
3. **Who Gets the Signal?:** choose at Ronnie's street drop to power hospital triage or broadcast Ahmad's evidence from the university. The saved choice determines the destination and the persistent supply-case/radio-beacon marker. Hospital ending grants one claim of up to 50 healing when injured; broadcast ending grants one $300 community contribution. Chapter completion pays $1,000 once.

Targets use the existing navigation graph, clearance and ground-height checks; missing approaches disable acceptance rather than teleporting to fallback coordinates. Existing active activities suspend chapter use/tracking. Each stage transition, choice and payout is checkpointed inside `level29.campaign.v2.polish`; Continue/export/import carry it. Death retains the current story checkpoint. New Game resets the chapter. It is solo-only and does not advance/renumber the campaign. There is no convoy, escort AI, alternate cinematic ending, or replacement of every campaign extraction.

## Gathering and crafting

Up to 12 eligible farm/market/nursery/botanica approaches have small nonblocking green diamonds and H map marks. Gather on foot with the current interact key or touch action, once per bundle per save. The board can track a remaining source using the existing waypoint system.

- Poultice: 2 herb, heals 35.
- Tonic: 1 herb + 1 bark, existing 60-second speed buff.
- Charm: 1 bark + 2 reed, existing 120-second resistance buff.

Use the ingredient buttons in the existing Apothecary. Cash recipes remain separate alternatives; crafting never charges both. Full-health poultices do not consume ingredients. Inventory and gathering claims persist in the campaign checkpoint. Marker geometry/materials are owned and retired on rebuild. No dynamic lights, downloaded art, extra NPC populations or new solid obstacles.

## Optional cloud backup activation

Code is ready for the project's existing Supabase community integration. No production database or environment configuration is changed by this PR.

1. The database owner must apply `supabase/migrations/202611160001_cloud_saves.sql` to the same Supabase project used by Online Community. It creates only the cloud-save table, RLS policies and compare-and-swap RPC.
2. Existing validated `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must be configured for the intended deployment. Never put an admin/service-role key in the browser or send secrets in chat.
3. Sign in through **Online Community**, return to the game and choose **Cloud Save / Backups**. Check the cloud revision before uploading; restore requires a second explicit confirmation. An intervening device upload fails with a revision conflict rather than silently overwriting it. Account changes invalidate a checked copy. Delete is explicit and leaves local saves intact.

No automatic synchronization, merging, multiplayer-authoritative economy, credential backup, paid service provisioning or native cloud authentication is added. Cloud operations require the web game. Native/offline players retain local recovery/export codes. The privacy page describes the new optional storage and deletion behavior. RLS and compare-and-swap are tested locally with PostgreSQL/PGlite; a live two-account, two-device smoke test still requires migration/configuration and test accounts.

## Co-op recovery

A host connection close/error or 20 seconds without a valid state packet stops the client and presents explicit reconnect/title choices. Client role remains set while stopped, so the normal campaign autosave cannot replace that browser's solo campaign with the host's world. Held input clears; gameplay keys cannot dismiss the recovery notice. Retry/cancel ignores obsolete peer callbacks.

Rejoining the same still-running host instance restores local cash/ammo and an on-foot ground-level position if clearance allows. Vehicles, private interiors and unsafe/elevated positions are not reconstructed; a restarted host has a different session ID and gets a fresh join. The authoritative host world is resynchronized through existing snapshots. Back/return preserves the solo save. This is not automatic host migration, host crash persistence, a server-backed reconnect service, or proof across restrictive NATs/six phones.

## Verification and acceptance

Run:

```
node --test tests/*.test.cjs
pnpm run build
```

Focused coverage includes legacy save shapes, corrupt-save salvage, import rollback/quota failure, three retained backups, chapter order/proximity/quiet approach/rewards/resume, real runtime gathering and resource cleanup, Apothecary effects without cash, synth/mute behavior, cloud UI account/conflict handling, SQL tenant isolation/CAS, lazy Peer loading and the real host-loss handler.

Before release: verify the PR head in a READY preview; play all three chapter missions and both endings, code export/import and local restore; check portrait and short-landscape touch UI; test live cloud upload/conflict/restore/delete with two accounts/devices; disconnect/reconnect two peers and cancel failed joins; complete a sustained physical-iPhone drive/combat session and export a fresh startup/performance diagnostic. Passing VM tests/builds do not establish these results. No measured improvement or crash-free claim is made.

The existing source-archive refresh pipeline updates the downloadable iOS source bundle. It is not an Xcode build, signed app or App Store release. The separate legacy root launcher is not the Next app's game entry and remains unchanged.
