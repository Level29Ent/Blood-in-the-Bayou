// This enum should be keep in sync with their native equivalents with the same name
export var InterstitialAdPluginEvents;
(function (InterstitialAdPluginEvents) {
    /**
     * Emits when an interstitial ad has loaded and is ready to show.
     */
    InterstitialAdPluginEvents["Loaded"] = "interstitialAdLoaded";
    /**
     * Emits when an interstitial ad fails to load.
     */
    InterstitialAdPluginEvents["FailedToLoad"] = "interstitialAdFailedToLoad";
    /**
     * Emits when an interstitial ad is shown.
     */
    InterstitialAdPluginEvents["Showed"] = "interstitialAdShowed";
    /**
     * Emits when a loaded interstitial ad fails to show.
     */
    InterstitialAdPluginEvents["FailedToShow"] = "interstitialAdFailedToShow";
    /**
     * Emits when an interstitial ad is dismissed.
     */
    InterstitialAdPluginEvents["Dismissed"] = "interstitialAdDismissed";
    /**
     * Emits impression-level ad revenue data when a paid event is recorded.
     */
    InterstitialAdPluginEvents["AdImpression"] = "interstitialAdImpression";
})(InterstitialAdPluginEvents || (InterstitialAdPluginEvents = {}));
//# sourceMappingURL=interstitial-ad-plugin-events.enum.js.map