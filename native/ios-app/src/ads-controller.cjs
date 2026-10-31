'use strict';
// Isolated from the SDK so consent, lifecycle, and no-fill behavior can be tested.
module.exports = function createAds({ sdk, events, config, now = Date.now, adFree = () => false, muted = () => false, onConsent = () => {} }) {
  let consent = false, initialized = false, starting, listeners = false, privacyRequired = false;
  let readyAt = null, loading = false, generation = 0, pending = null, lastShown = now();
  const unit = config.testMode ? 'ca-app-pub-3940256099942544/4411468910' : config.interstitialId;

  async function preload() {
    if (!consent || adFree() || loading || pending) return;
    loading = true;
    const version = generation;
    try {
      await sdk.prepareInterstitial({ adId: unit, isTesting: config.testMode });
      if (version === generation && consent && !adFree()) readyAt = now();
    } catch (_) { readyAt = null; }
    finally { loading = false; }
  }
  function finish(status) {
    if (!pending) return;
    const hooks = pending; pending = null;
    try { hooks.restore(); }
    finally { hooks.done({ breakStatus: status }); void preload(); }
  }
  async function updateConsent() {
    let info = await sdk.requestConsentInfo();
    if (info.status === 'REQUIRED' && info.isConsentFormAvailable) info = await sdk.showConsentForm();
    consent = info.canRequestAds === true;
    privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
    onConsent(info);
    if (!consent || adFree()) return;
    // Obtain consent BEFORE initializing: initialization itself may preload ads.
    if (!initialized) { await sdk.initialize(); initialized = true; }
    void preload();
  }
  async function start() {
    if (starting) return starting;
    starting = (async () => {
      if (!listeners) {
        await sdk.addListener(events.Showed, () => { if (pending) lastShown = now(); });
        await sdk.addListener(events.Dismissed, () => finish('viewed'));
        await sdk.addListener(events.FailedToShow, () => finish('failedToShow'));
        listeners = true;
      }
      await updateConsent();
    })().catch(() => { consent = false; readyAt = null; }).finally(() => { starting = null; });
    return starting;
  }
  return {
    start,
    async privacy() {
      if (pending) return;
      consent = false; readyAt = null; generation++;
      try { if (privacyRequired) await sdk.showPrivacyOptionsForm(); await updateConsent(); }
      catch (_) { /* Fail closed; the player can retry privacy settings. */ }
    },
    levelComplete(hooks) {
      if (pending || !consent || adFree() || now() - lastShown < config.minIntervalMs) return false;
      if (readyAt === null || now() - readyAt > 55 * 60 * 1000) {
        readyAt = null; void preload(); return false;
      }
      pending = hooks; readyAt = null;
      const applicationMuted = muted();
      try {
        hooks.pauseAndMute();
        // Resolution means presentation started, NOT that the ad was dismissed.
        Promise.resolve(sdk.setApplicationMuted({ muted: applicationMuted }))
          .then(() => sdk.showInterstitial({ adId: unit }))
          .catch(() => finish('failedToShow'));
      } catch (_) { finish('failedToShow'); }
      return true;
    },
    get pending() { return pending !== null; },
  };
};
