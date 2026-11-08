const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(game = true) {
  const scripts = [];
  const window = {};
  const document = {
    currentScript: { hasAttribute: () => game },
    createElement: () => ({ attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }),
    head: { appendChild: tag => scripts.push(tag) },
  };
  vm.runInNewContext(fs.readFileSync('public/game/ads.js', 'utf8'), { window, document });
  return { window, scripts };
}
function enable(window) {
  Object.assign(window.bayouAdsConfig, {
    enabled: true, consentGranted: true, publisherId: 'ca-pub-1234567890123456',
  });
}
test('owner publisher is configured without enabling live ads or routing the iOS unit to web ads', () => {
  const { window, scripts } = setup();
  assert.equal(window.bayouAdsConfig.publisherId, 'ca-pub-8022731487137227');
  assert.equal(window.bayouAdsConfig.enabled, false);
  assert.equal(window.bayouAdsConfig.testMode, true);
  assert.equal(window.bayouAdsConfig.consentGranted, false);
  assert.equal(window.bayouAdsConfig.admob.interstitialSlot, '');
  assert.equal(scripts.length, 0);
  window.bayouAdsConfig.enabled = true;
  assert.equal(window.bayouAds.initialize(), false);
  window.bayouAdsConfig.enabled = false;
  window.bayouAdsConfig.consentGranted = true;
  assert.equal(window.bayouAds.initialize(), false);
  assert.equal(scripts.length, 0);
});
test('disabled scaffold makes no requests or placements', () => {
  const { window, scripts } = setup();
  assert.equal(scripts.length, 0);
  assert.equal(window.bayouAds.gameOver(), false);
  assert.equal(window.adsbygoogle.length, 0);
  window.bayouAdsConfig.enabled = true;
  assert.equal(window.bayouAds.initialize(), false);
});
test('only the game document initializes, exactly once, with test ads', () => {
  const parent = setup(false); enable(parent.window);
  assert.equal(parent.window.bayouAds.initialize(), false);
  const { window, scripts } = setup(); enable(window);
  assert.equal(window.bayouAds.initialize(), true);
  assert.equal(window.bayouAds.initialize(), false);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].attrs['data-adbreak-test'], 'on');
  assert.equal(scripts[0].attrs['data-ad-client'], 'ca-pub-1234567890123456');
});
test('readiness, hooks, duplicates, no-fill, sound, and consent gates', () => {
  const { window } = setup(); enable(window); window.bayouAds.initialize();
  const calls = [];
  const hooks = { pauseAndMute: () => calls.push('pause'), restore: () => calls.push('restore'), done: () => calls.push('done') };
  assert.equal(window.bayouAds.gameOver(hooks), false);
  window.adsbygoogle[0].onReady();
  assert.equal(window.bayouAds.gameOver({}), false);
  assert.equal(window.bayouAds.gameOver(hooks), true);
  const placement = window.adsbygoogle[1];
  assert.equal(placement.type, 'next'); assert.equal(placement.name, 'game_over');
  assert.equal(window.bayouAds.levelComplete(hooks), false);
  placement.adBreakDone({ breakStatus: 'noAdPreloaded' });
  assert.deepEqual(calls, ['done']);
  assert.equal(window.bayouAds.levelComplete(hooks), true);
  const next = window.adsbygoogle[2];
  assert.equal(next.name, 'level_complete');
  next.beforeAd(); next.afterAd(); next.adBreakDone({ breakStatus: 'viewed' });
  assert.deepEqual(calls, ['done', 'pause', 'restore', 'done']);
  window.bayouAds.setSound(false);
  assert.equal(window.adsbygoogle[3].sound, 'off');
  window.bayouAdsConfig.consentGranted = false;
  assert.equal(window.bayouAds.gameOver(hooks), false);
});
