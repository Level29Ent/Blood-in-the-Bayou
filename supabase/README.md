# Blood in the Bayou community backend

This change depends on the runtime/HUD refactor (PR #143). Merge that first, then this PR.

## One-time setup (existing Supabase project)

1. Review and run `migrations/202611110001_community.sql` once against the intended Supabase project, using Supabase SQL Editor or your authenticated Supabase migration workflow. The migration creates only `bitb_*` tables and `bitb_private` helper functions. It does not change existing game tables. It runs in a transaction; conflicts roll back. Do not rerun blindly after success.
2. Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configured for the Vercel environments that use this database. No service-role key belongs in public configuration, code, or chat. This implementation deliberately rejects service-role and legacy JWT keys.
3. Enable the Email authentication provider. Configure the Site URL and allowed redirect URLs to include `https://<your-game-domain>/game/community.html`. For preview accounts add the exact intended preview origin/path; don't allow arbitrary callback domains. Email delivery, confirmation and password reset depend on your Supabase email settings. Set up production SMTP/delivery and abuse protections before public rollout.
4. Open `/game/community.html` on the preview. Create two disposable accounts, confirm emails, then sign in and create public handles. Test friend requests/acceptance, consented host visibility, invitations, expiry, sign-out and profile deletion. Do not use real email addresses or credentials in automated fixtures.
5. `/api/community/status` performs read-only checks and reports configuration presence, Auth reachability and whether the profiles schema is missing/protected. It never returns credentials, emails or raw upstream errors. A protected schema does not prove all migrations/policies work.
6. Launch the game on the same web origin. Opt in in Account and select a category before starting a new session. New opted-in survival runs submit on death; mission records submit after completion; bounty sessions can be submitted in Account. Existing local records are not imported. The account page can be opened in another tab while solo play is paused.

The supplied publishable key permits normal Auth/Data API use, not administrative SQL. The agent cannot apply this migration with that key. Run it in your own Supabase dashboard; do not paste database passwords or admin keys into chat.

## Security and scope

- Every table uses RLS, explicit grants, foreign keys and bounded values. Anonymous users have no direct table access. Auth uses the official bundled supabase-js client, including token refresh and email confirmation/recovery handling. It loads lazily; no login is required for the offline campaign.
- Profiles expose only a chosen public handle and UUID; emails are never copied into public tables. Profiles cannot be renamed through the current UI. Delete public profile removes linked scores, friends, runs and lobbies; it does **not** delete the Supabase Auth account or browser save.
- Requests require acceptance by the recipient. Users only see their own relationships. Lobbies require a signed-in host, a valid code and opt-in visibility; friends-only listings require an accepted relationship. Listings expire after 90 seconds. A 25-second game heartbeat refreshes them while the host updates. Hidden/inactive tabs stop heartbeats. Occupancy is advisory; PeerJS still enforces actual capacity.
- Quick join selects a recent public listing and uses the normal room-code join flow. It is discovery, not atomic seat reservation, a dedicated game relay or a TURN service. NAT failures remain possible; host must stay connected. WebRTC IP/network privacy still follows the existing PeerJS implementation.
- Scores are explicitly **client-reported casual** records. Database triggers lock a run, stamp server times, enforce min/max duration, limit survival to elapsed time, bound bounties and mark runs finished atomically. Direct score updates/deletes are denied. This prevents trivial timestamp/replay edits but does **not** prove actual survival, kills or mission completion. No competitive rewards. A server-authoritative simulation/telemetry service is required for verified rankings.
- Global/friend filters show best records per player from the top 100 runs. Mission times currently aggregate different missions; these are not comparable mission-specific competitive tiers.
- Preview and production currently point to whatever database each environment specifies; use an isolated Supabase test project/branch for destructive account tests.
- Community is web-only in this iteration. Native archives keep the offline game; hosted `/api/community/*` and auth callback origins must be separately configured for a native release. No advertising changes.

## Developer checks

`pnpm install --frozen-lockfile`, `node scripts/build-community.cjs`, `node --test tests/*.test.cjs`, `pnpm build`.

The generated `public/game/vendor/community-client.js` comes from the locked official `@supabase/supabase-js` dependency. `@electric-sql/pglite` is a dev-only embedded PostgreSQL test engine, never shipped in the game. SQL tests create roles and simulate authenticated identities, exercise the actual migration, RLS, one-time submission, ownership and friend consent. They are not a substitute for live-project/email/WebRTC tests.
