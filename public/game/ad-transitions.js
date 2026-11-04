/* Shared natural transition: no ad on launch, death timers, or during multiplayer. */
(function () {
  'use strict';
  let waiting = false, saved = null, lastBreak = Date.now();
  const overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:100000;background:#0b0e10';
  overlay.setAttribute('role', 'status'); overlay.setAttribute('aria-label', 'Advertisement');
  document.body.appendChild(overlay);
  function restore() {
    if (!saved) return;
    const prior = saved; saved = null;
    window.bayouAdActive = false; overlay.style.display = 'none';
    setSoundMode(prior.mode);
    for (const [media, muted] of prior.media) media.muted = muted;
    if (actx && prior.running) actx.resume().catch(() => {});
  }
  function pauseAndMute() {
    saved = { mode: soundMode, running: actx?.state === 'running', media: [] };
    window.bayouAdActive = true;
    // Native ads are above the WebView. Web ads supply their own overlay.
    overlay.style.display = window.bayouNativeAds ? 'block' : 'none';
    rbStopVoice(); window.level29FeliciaVoice?.stop();
    setSoundMode(2);
    // Include detached HTMLAudioElement instances as well as DOM media.
    const media = new Set(document.querySelectorAll('audio,video'));
    if (typeof rbVoice !== 'undefined') media.add(rbVoice);
    for (const item of media) { saved.media.push([item, item.muted]); item.muted = true; }
    if (actx) actx.suspend().catch(() => {});
    for (const key in keys) keys[key] = false;
    mouse.down = false; stick.x = 0; stick.y = 0;
  }
  window.bayouAdHooks = { pauseAndMute, restore };
  const baseSound = setSoundMode;
  setSoundMode = function () {
    baseSound.apply(this, arguments);
    if (!window.bayouAdActive) window.bayouAds?.setSound(soundMode !== 2);
  };
  window.bayouAds?.setSound(soundMode !== 2);
  const baseAct = rbAct;
  rbAct = function (action) {
    if (waiting) return;
    // Only a user accepting a subsequent mission is a placement opportunity.
    // Skip uncontrolled external Spotify playback rather than advertising over music.
    if (action !== 'take' || state !== 'talk' || !mission || mission.phase !== 'start' ||
        (!completed.size && mission.info.i === 0) || mpRole || player?.car ||
        (typeof spotifyPlaying !== 'undefined' && spotifyPlaying) ||
        (typeof spotifyFallback !== 'undefined' && spotifyFallback) ||
        Date.now() - lastBreak < 180000) return baseAct.apply(this, arguments);
    const backend = window.bayouNativeAds || window.bayouAds;
    if (!backend) return baseAct.apply(this, arguments);
    const expected = mission;
    waiting = true;
    const accepted = backend.levelComplete({
      pauseAndMute,
      restore,
      done(info) {
        waiting = false;
        if (info.breakStatus === 'viewed') lastBreak = Date.now();
        if (mission === expected && state === 'talk') baseAct('take');
      },
    });
    if (!accepted) { waiting = false; return baseAct.apply(this, arguments); }
  };
  // Block JS input under a native ad without treating native dismissal as a game tap.
  for (const type of ['keydown', 'keyup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'touchmove', 'click']) {
    window.addEventListener(type, event => {
      if (!window.bayouAdActive) return;
      // Do not intercept clicks/keys aimed at Google's HTML ad controls.
      if (!window.bayouNativeAds && !event.target?.closest?.('#gl,#c,#audio,#touch,#joy,#rbtalk,#shop,#cheat,#mp,#menu')) return;
      event.preventDefault(); event.stopImmediatePropagation();
    }, { capture: true, passive: false });
  }
}());
