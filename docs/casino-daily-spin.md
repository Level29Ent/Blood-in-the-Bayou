# Casino banding and free daily spin

BoomCity's decorative tower bands were full-width/depth boxes. They are now
thin exterior perimeter rails instead of solid horizontal plates. Their height,
colors, frontage rotation and foundation placement are unchanged. The table
layout, casino games and interaction points are not moved. A geometry regression
checks all 32 rails are narrow and above the playable room's ceiling. The supplied
screenshot's exact camera/view still needs visual verification in the deployed game.

## Daily spin

During solo play, choose **DAILY + SPIN** (or **DAILY SPIN** after claiming the
log-in reward), then **FREE DAILY SPIN**. This is separate from the seven-day
log-in streak: the existing reward still works.

- One free spin every rolling 24 hours in this browser profile.
- Eight equal-probability segments: $500, $1,000, $1,500, $2,500, $5,000, $750,
  $2,000 and $10,000. All are fictional in-game cash; no payment, ad viewing or
  real-money redemption is involved.
- Reserve the spin before awarding cash and save the campaign before animation.
  Duplicate taps/reloads cannot reroll it. If saving fails, cash and the spin
  receipt are rolled back; storage must be available. Web Locks serializes tabs
  in supporting browsers and storage events refresh the open wheel's status.
- The wheel reports its result through live text, supports keyboard focus/Escape,
  respects reduced motion and shows the next availability time.
- This is browser-local progression, not server-authoritative: clearing local
  data, changing the clock forward, a different device/browser or concurrent
  tabs without Web Locks are not protected. Multiplayer claims are disabled.

The refreshed iOS source ZIP uses the latest game files. It still requires a new
signed app build; downloading/deploying the website does not update installed apps.
