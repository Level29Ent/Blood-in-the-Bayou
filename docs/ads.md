# Google H5 Ads setup (bloodinthebayougame.com)

This is a **disabled placeholder**, not live monetization. The shared script is in
both the Next layout head and the game iframe head. Only the game document may
load Google's tag: Google requires the tag, canvas, and adBreak calls in the same
document. No publisher IDs or ad units have been invented.

## Before enabling

1. Complete AdSense H5 Games Ads eligibility/site approval for bloodinthebayougame.com
   and obtain your AdSense publisher ID. Configure privacy disclosures, a suitable
   consent-management platform, and Google's required publisher/site files using
   the exact values supplied in your Google account.
2. Replace `publisherId` in `public/game/ads.js`; keep `testMode: true` during testing.
   Set `enabled: true` only after review. Your CMP must set `consentGranted` according
   to the applicable consent requirements, then call `bayouAds.initialize()` inside
   the iframe. The boolean is only an integration gate, not a consent platform.
3. Connect retry and next-level **user actions** to the functions below. They are
   deliberately not wired to death/mission timers. Implement synchronous pause/mute
   and exact prior-state restoration, including multiplayer behavior and all audio.
4. Test ad shown, no-fill, blocked SDK, consent denied, and duplicate clicks. Remove
   test mode only after Google approval and consent/policy verification.

```js
// In the game iframe, from a retry/continue button handler:
const accepted = window.bayouAds.gameOver({ // or .levelComplete(...)
  pauseAndMute() { /* Save state; synchronously pause gameplay and mute all audio. */ },
  restore() { /* Restore the saved gameplay and audio state after an actual ad. */ },
  done(info) { /* Continue retry/next-level flow, even when no ad was available. */ },
});
if (!accepted) {
  // Continue normally: disabled, not ready, consent absent, or another break pending.
}
// Update alongside the game's mute control:
window.bayouAds.setSound(false);
```

Do not use these empty example callbacks in production. A true return means the
placement was submitted, not that an ad was shown. Never block gameplay waiting
for SDK readiness. These triggers use Google's `next` placement for a user-driven
restart/next-level transition, with distinct reporting names.

## AdMob (optional Android app, not the website)

Create/configure your Android app and interstitial ad unit in your own AdMob
account. Add the Google Mobile Ads SDK to the native host and register its WebView
with `MobileAds.registerWebView`. Set `admob.interstitialSlot` to the issued ad unit
ID; retain the AdSense publisher ID too. `rewardedSlot` is reserved for future
rewarded integration; these triggers do not request rewarded ads or grant rewards.
There is no native Android host in this repository, and no Google account was
created or configured by this change. iOS support is not implied.

References:
- https://developers.google.com/ad-placement/docs/example
- https://developers.google.com/ad-placement/apis/adbreak
- https://support.google.com/adsense/answer/9959170
