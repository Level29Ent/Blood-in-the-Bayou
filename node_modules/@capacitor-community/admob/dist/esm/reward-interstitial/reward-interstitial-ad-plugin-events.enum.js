// This enum should be keep in sync with their native equivalents with the same name
export var RewardInterstitialAdPluginEvents;
(function (RewardInterstitialAdPluginEvents) {
    /**
     * Emits when a rewarded interstitial ad has loaded and is ready to show.
     */
    RewardInterstitialAdPluginEvents["Loaded"] = "onRewardedInterstitialAdLoaded";
    /**
     * Emits when a rewarded interstitial ad fails to load.
     */
    RewardInterstitialAdPluginEvents["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
    /**
     * Emits when a rewarded interstitial ad is shown.
     */
    RewardInterstitialAdPluginEvents["Showed"] = "onRewardedInterstitialAdShowed";
    /**
     * Emits when a loaded rewarded interstitial ad fails to show.
     */
    RewardInterstitialAdPluginEvents["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
    /**
     * Emits when a rewarded interstitial ad is dismissed.
     *
     * This event does not indicate whether the user earned a reward. Listen for
     * `Rewarded` separately before granting the reward.
     */
    RewardInterstitialAdPluginEvents["Dismissed"] = "onRewardedInterstitialAdDismissed";
    /**
     * Emits when the user earns the advertised reward.
     */
    RewardInterstitialAdPluginEvents["Rewarded"] = "onRewardedInterstitialAdReward";
    /**
     * Emits impression-level ad revenue data when a paid event is recorded.
     */
    RewardInterstitialAdPluginEvents["AdImpression"] = "onRewardedInterstitialAdImpression";
})(RewardInterstitialAdPluginEvents || (RewardInterstitialAdPluginEvents = {}));
//# sourceMappingURL=reward-interstitial-ad-plugin-events.enum.js.map