// This enum should be keep in sync with their native equivalents with the same name
export var BannerAdPluginEvents;
(function (BannerAdPluginEvents) {
    /**
     * Emits when the displayed banner size changes.
     */
    BannerAdPluginEvents["SizeChanged"] = "bannerAdSizeChanged";
    /**
     * Emits when a banner ad has loaded.
     */
    BannerAdPluginEvents["Loaded"] = "bannerAdLoaded";
    /**
     * Emits when a banner ad fails to load.
     */
    BannerAdPluginEvents["FailedToLoad"] = "bannerAdFailedToLoad";
    /**
     * Emits when a banner opens an overlay after the user taps it.
     */
    BannerAdPluginEvents["Opened"] = "bannerAdOpened";
    /**
     * Emits when the banner overlay is closed.
     */
    BannerAdPluginEvents["Closed"] = "bannerAdClosed";
    /**
     * Emits when an impression is recorded for the banner ad.
     */
    BannerAdPluginEvents["AdImpression"] = "bannerAdImpression";
    /**
     * Emits impression-level ad revenue data when a paid event is recorded.
     */
    BannerAdPluginEvents["AdPaid"] = "bannerAdPaid";
})(BannerAdPluginEvents || (BannerAdPluginEvents = {}));
//# sourceMappingURL=banner-ad-plugin-events.enum.js.map