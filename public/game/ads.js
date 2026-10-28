/* H5 Ads scaffold. No Google requests until explicitly enabled and consent is handled. */
(function () {
  'use strict';
  const config = {
    enabled: false,
    publisherId: 'ca-pub-REPLACE_WITH_YOUR_PUBLISHER_ID',
    testMode: true,
    consentGranted: false, // Set only through your consent-management integration.
    sound: 'on',
    admob: {
      interstitialSlot: '', // Optional Android WebView: ca-app-pub-.../...
      rewardedSlot: '',
    },
  };
  window.bayouAdsConfig = config;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = function (options) {
    window.adsbygoogle.push(options);
  };

  let ready = false;
  let pending = false;
  let initialized = false;
  const gameDocument = document.currentScript.hasAttribute('data-game-ads');

  // Call after your CMP has resolved consent. Do not enable both parent and iframe.
  function initialize() {
    if (initialized || !gameDocument || !config.enabled || !config.consentGranted ||
        !/^ca-pub-\d{16}$/.test(config.publisherId)) return false;
    initialized = true;
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    tag.crossOrigin = 'anonymous';
    tag.setAttribute('data-ad-client', config.publisherId);
    if (config.testMode) tag.setAttribute('data-adbreak-test', 'on');
    if (config.admob.interstitialSlot) tag.setAttribute('data-admob-interstitial-slot', config.admob.interstitialSlot);
    if (config.admob.rewardedSlot) tag.setAttribute('data-admob-rewarded-slot', config.admob.rewardedSlot);
    tag.onerror = function () { ready = false; };
    window.adConfig({
      preloadAdBreaks: 'on',
      sound: config.sound,
      onReady: function () { ready = true; },
    });
    document.head.appendChild(tag);
    return true;
  }

  // Invoke from a retry/next-level user action, never from the running game loop.
  // Hooks must synchronously pause/mute and restore the previous game/audio state.
  function requestBreak(name, hooks) {
    if (!ready || pending || !config.enabled || !config.consentGranted || !hooks ||
        typeof hooks.pauseAndMute !== 'function' || typeof hooks.restore !== 'function') return false;
    pending = true;
    window.adBreak({
      type: 'next',
      name: name,
      beforeAd: hooks.pauseAndMute,
      afterAd: hooks.restore,
      // Google calls this even when no ad is available. Continue here, not afterAd.
      adBreakDone: function (info) {
        pending = false;
        if (typeof hooks.done === 'function') hooks.done(info);
      },
    });
    return true;
  }

  window.bayouAds = {
    initialize: initialize,
    gameOver: function (hooks) { return requestBreak('game_over', hooks); },
    levelComplete: function (hooks) { return requestBreak('level_complete', hooks); },
    setSound: function (enabled) {
      config.sound = enabled ? 'on' : 'off';
      if (initialized) window.adConfig({ sound: config.sound });
    },
  };
  initialize();
}());
