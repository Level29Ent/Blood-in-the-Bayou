const { test } = require('node:test');
const assert = require('node:assert/strict');
const createAds = require('../native/ios-app/src/ads-controller.cjs');
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(options = {}) {
  const calls = [], handlers = {};
  let clock = 1000, free = false;
  let info = { status: 'NOT_REQUIRED', canRequestAds: true };
  const sdk = {
    addListener: async (event, handler) => { handlers[event] = handler; },
    requestConsentInfo: async () => { calls.push('consent'); return info; },
    showConsentForm: async () => { calls.push('form'); return options.form || info; },
    showPrivacyOptionsForm: async () => { calls.push('privacy'); },
    initialize: async () => { calls.push('initialize'); },
    prepareInterstitial: async arg => { calls.push(['load', arg]); if (options.noFill) throw Error('no fill'); },
    setApplicationMuted: async arg => calls.push(['muted', arg]),
    showInterstitial: async arg => { calls.push(['show', arg]); if (options.failShow) throw Error('failed'); },
  };
  const events = { Showed: 'showed', Dismissed: 'dismissed', FailedToShow: 'failed' };
  const controller = createAds({ sdk, events, config: { ...require('../native/ios-app/src/config.json'), ...options.config },
    now: () => clock, adFree: () => free, muted: () => true });
  return { controller, calls, handlers, sdk, advance: n => { clock += n; }, setInfo: value => { info = value; }, setFree: value => { free = value; } };
}
function hooks() {
  const calls = [];
  return { calls, pauseAndMute: () => calls.push('pause'), restore: () => calls.push('restore'), done: value => calls.push(value.breakStatus) };
}
test('iOS does not initialize or load an ad until consent permits it', async () => {
  const s = setup(); s.setInfo({ status: 'REQUIRED', isConsentFormAvailable: false, canRequestAds: false });
  assert.deepEqual(s.calls, []); await s.controller.start(); await flush();
  assert.deepEqual(s.calls, ['consent']); assert.equal(s.controller.levelComplete(hooks()), false);
});
test('consent form precedes initialization and only Google test units are loaded by default', async () => {
  const s = setup({ form: { status: 'OBTAINED', canRequestAds: true } });
  s.setInfo({ status: 'REQUIRED', isConsentFormAvailable: true, canRequestAds: false });
  await s.controller.start(); await flush();
  assert.deepEqual(s.calls.slice(0, 3), ['consent', 'form', 'initialize']);
  assert.deepEqual(s.calls[3], ['load', { adId: 'ca-app-pub-3940256099942544/4411468910', isTesting: true }]);
});
test('release configuration uses the supplied iOS unit, not the web publisher ID', async () => {
  const s = setup({ config: { testMode: false } }); await s.controller.start(); await flush();
  assert.equal(s.calls.find(c => Array.isArray(c) && c[0] === 'load')[1].adId, 'ca-app-pub-9730543201329278/8884513486');
});
test('ads pause once, wait for native dismissal, restore once, and respect cooldown', async () => {
  const s = setup(); await s.controller.start(); await flush(); const h = hooks();
  assert.equal(s.controller.levelComplete(h), false); s.advance(180001);
  assert.equal(s.controller.levelComplete(h), true); assert.equal(s.controller.levelComplete(h), false);
  await flush(); assert.deepEqual(h.calls, ['pause']); assert.equal(s.controller.pending, true);
  assert.deepEqual(s.calls.find(c => Array.isArray(c) && c[0] === 'muted'), ['muted', { muted: true }]);
  s.handlers.showed(); s.handlers.dismissed(); s.handlers.failed(); await flush();
  assert.deepEqual(h.calls, ['pause', 'restore', 'viewed']); assert.equal(s.controller.pending, false);
  assert.equal(s.controller.levelComplete(hooks()), false);
});
test('failed native presentation restores the game and continues the transition', async () => {
  const s = setup({ failShow: true }); await s.controller.start(); await flush(); s.advance(180001);
  const h = hooks(); assert.equal(s.controller.levelComplete(h), true); await flush();
  assert.deepEqual(h.calls, ['pause', 'restore', 'failedToShow']); assert.equal(s.controller.pending, false);
});
test('no fill never pauses or blocks the game', async () => {
  const s = setup({ noFill: true }); await s.controller.start(); await flush(); s.advance(180001);
  const h = hooks(); assert.equal(s.controller.levelComplete(h), false); await flush(); assert.deepEqual(h.calls, []);
});
test('ad-free entitlement prevents both loading and presentation', async () => {
  const s = setup(); s.setFree(true); await s.controller.start(); await flush();
  assert.deepEqual(s.calls, ['consent']); s.advance(180001); assert.equal(s.controller.levelComplete(hooks()), false);
});
test('privacy changes invalidate a preloaded ad and re-check consent before any reload', async () => {
  const s = setup(); s.setInfo({ status: 'OBTAINED', canRequestAds: true, privacyOptionsRequirementStatus: 'REQUIRED' });
  await s.controller.start(); await flush(); s.advance(180001);
  s.setInfo({ status: 'UNKNOWN', canRequestAds: false }); await s.controller.privacy();
  assert.equal(s.controller.levelComplete(hooks()), false);
  assert.deepEqual(s.calls.slice(-2), ['privacy', 'consent']);
});
test('expired ads are reloaded without interrupting gameplay', async () => {
  const s = setup(); await s.controller.start(); await flush(); s.advance(56 * 60 * 1000);
  const h = hooks(); assert.equal(s.controller.levelComplete(h), false); await flush(); assert.deepEqual(h.calls, []);
  assert.equal(s.calls.filter(c => Array.isArray(c) && c[0] === 'load').length, 2);
});
test('parallel starts do not install duplicate listeners or initialize twice', async () => {
  const s = setup(); await Promise.all([s.controller.start(), s.controller.start()]); await flush();
  assert.equal(s.calls.filter(c => c === 'initialize').length, 1);
});

test('privacy action can recover from an initial consent network failure without an unavailable form', async () => {
  const s = setup(); const request = s.sdk.requestConsentInfo;
  s.sdk.requestConsentInfo = async () => { throw Error('offline'); };
  await s.controller.start(); s.sdk.requestConsentInfo = request;
  await s.controller.privacy(); await flush(); s.advance(180001);
  assert.equal(s.calls.includes('privacy'), false);
  assert.equal(s.controller.levelComplete(hooks()), true);
});
