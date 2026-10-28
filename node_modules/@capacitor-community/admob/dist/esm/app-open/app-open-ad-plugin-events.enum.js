export var AppOpenAdPluginEvents;
(function (AppOpenAdPluginEvents) {
    /**
     * Emits when an App Open ad has loaded.
     */
    AppOpenAdPluginEvents["Loaded"] = "appOpenAdLoaded";
    /**
     * Emits when an App Open ad fails to load.
     */
    AppOpenAdPluginEvents["FailedToLoad"] = "appOpenAdFailedToLoad";
    /**
     * Emits when an App Open ad is shown.
     */
    AppOpenAdPluginEvents["Opened"] = "appOpenAdOpened";
    /**
     * Emits when an App Open ad is dismissed.
     */
    AppOpenAdPluginEvents["Closed"] = "appOpenAdClosed";
    /**
     * Emits when a loaded App Open ad fails to show.
     */
    AppOpenAdPluginEvents["FailedToShow"] = "appOpenAdFailedToShow";
    /**
     * Emits impression-level ad revenue data when a paid event is recorded.
     */
    AppOpenAdPluginEvents["AdImpression"] = "appOpenAdImpression";
})(AppOpenAdPluginEvents || (AppOpenAdPluginEvents = {}));
//# sourceMappingURL=app-open-ad-plugin-events.enum.js.map