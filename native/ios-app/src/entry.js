import { Capacitor } from '@capacitor/core';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import createAds from './ads-controller.cjs';
import config from './config.json';

// This bundle is only injected into the packaged iPhone app, never the website.
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
  const controller = createAds({
    sdk: AdMob, events: InterstitialAdPluginEvents, config,
    muted: () => soundMode === 2,
    adFree: () => window.level29Premium?.adFree === true,
    onConsent(info) { privacy.dataset.required = String(info.privacyOptionsRequirementStatus === 'REQUIRED'); },
  });
  window.bayouNativeAds = controller;
  const privacy = document.createElement('button');
  privacy.id = 'nativeAdPrivacy'; privacy.type = 'button'; privacy.textContent = 'Ad privacy';
  privacy.style.cssText = 'position:fixed;top:12px;right:12px;z-index:90;min-height:44px;padding:8px;background:#14202bef;color:#fff;border:1px solid #c9a768;font:12px system-ui';
  document.body.appendChild(privacy);
  let firstStart = true, busy = false;
  async function consentUI(operation) {
    if (busy || controller.pending) return;
    if (typeof mpRole !== 'undefined' && mpRole) { toast('LEAVE MULTIPLAYER TO CHANGE AD PRIVACY'); return; }
    busy = true;
    window.bayouAdHooks.pauseAndMute();
    try { await window.level29Premium?.refresh(); await operation(); }
    finally { window.bayouAdHooks.restore(); busy = false; }
  }
  privacy.onclick = () => {
    void consentUI(firstStart ? controller.start : () => controller.privacy());
  };
  // Consent is resolved while still on the title screen. Preserve synchronous
  // startGame/save-resume semantics by replaying only this user-selected button.
  window.addEventListener('click', event => {
    const button = event.target.closest?.('#start,#resume');
    if (!button || !firstStart) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (busy) return;
    ensureAudio();
    void consentUI(controller.start).then(() => { firstStart = false; button.click(); });
  }, true);
  // Do not load ads merely by visiting the app or the website.
  if (config.testMode) {
    const note = document.createElement('p');
    note.textContent = 'iPhone ad integration: TEST ADS — not earning revenue.';
    document.querySelector('#menu .copy')?.appendChild(note);
  }
}
