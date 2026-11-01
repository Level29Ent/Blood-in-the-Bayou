# Blood in the Bayou ads: web and iPhone

**Not live monetization.** Browser ads remain disabled pending approval/consent
setup. iOS has a native test-ads integration that still needs Xcode/device checks
and a new signed App Store build.

## Website

The owner's publisher is configured in `public/game/ads.js`:
`ca-pub-9730543201329278`. The tag, canvas and placement calls stay in the game
iframe document; the Next layout must not also load Google's SDK.

The supplied screenshot lists **AdMob** as the only active product. It does not
establish AdSense for Content or H5 Games Ads approval. Using that same Google
account:

1. [Apply for the AdSense account upgrade](https://support.google.com/adsense/answer/6023158?hl=en)
   and connect `bloodinthebayougame.com` as Google directs.
2. [Apply for H5 Games Ads access](https://support.google.com/adsense/answer/1705831?hl=en-GB).
   Approval is not guaranteed.
3. Configure privacy disclosures, an appropriate consent-management platform and
   the exact publisher/site verification files requested in the Google account.
4. After approval, enable the configuration while retaining test mode. The CMP
   must set `bayouAdsConfig.consentGranted` according to applicable requirements
   and call `bayouAds.initialize()` **inside the game iframe**. The boolean is
   an integration gate, not a consent platform. Do not set it blindly to true.
5. Verify ads/no fill/SDK blocked/consent denied/duplicate taps/audio restoration,
   then remove test mode only for an approved live release.

The existing `enabled: false`, `testMode: true`, and `consentGranted: false`
defaults prevent Google ad requests. Merely deploying this PR does not earn money.

## Shared mission placement

`public/game/ad-transitions.js` connects the **Take the Job** user action to an
interstitial before a subsequent mission. There are no launch, combat, automatic
death/respawn, or timer-triggered placements. Placements skip multiplayer,
driving, the first mission, and uncontrolled Spotify playback. A three-minute
interval limits placements. No ready ad means the mission starts normally.

An actual ad pauses simulation/render work, blocks game input, cancels briefing
speech, mutes the game's audio and suspends its AudioContext. Dismissal/failure
restores the prior mute/context state, then starts the selected mission exactly
once. No-fill continues without pausing. Verified premium ad-free ownership is
respected. The premium storefront is not made functional by this change.

## Native iPhone app

The owner confirmed the downloadable ZIP is the native host and the repository
contains the current game. Its maintained source is now `native/ios-app`; build
commands always copy **current `public/game` files**, not the ZIP's old game.

Owner-supplied public identifiers:

- App: `ca-app-pub-9730543201329278~2335600781`
- Interstitial: `ca-app-pub-9730543201329278/8884513486`

The app ID is in the native Info.plist, and the live unit is in native config.
**Test mode is on for all builds** and substitutes Google's iOS test unit
`ca-app-pub-3940256099942544/4411468910`. It cannot generate revenue.
The native plugin resolves UMP consent before SDK initialization/loading and
exposes privacy options. It never passes an iOS ad unit to the H5 web tag.

See [native build and release instructions](../native/ios-app/README.md).
`pnpm ios:sync` stages the latest game and registers the plugin;
`pnpm ios:archive` regenerates the downloadable source ZIP. Recipients must
install dependencies and sync on their Mac before opening Xcode. A website
update alone cannot update an installed iPhone app. Native compilation, device
ad delivery, signing and App Store upload remain unverified/unperformed here.

## Android

No Android host is included. Google's H5 AdMob WebView bridge is **Android-only**;
`admob.interstitialSlot` stays empty. Do not put the supplied iOS unit there.
Android support would require an Android app, matching ad units and a registered
Google Mobile Ads WebView. Rewarded placements are not implemented.

References:
- https://developers.google.com/ad-placement/docs/example
- https://developers.google.com/admob/ios/quick-start
- https://developers.google.com/admob/ios/interstitial
