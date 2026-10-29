'use strict';
// =====================================================================
// Smoother controls and frame pacing on desktop and mobile:
//  - desktop: pointer-lock mouse look (no more cursor hitting the screen edge)
//  - mobile: touch look is smoothed per frame with a gentle response curve
//  - adaptive render resolution keeps the frame rate steady on slower devices
//  - inputs are released when the tab loses focus so nothing gets stuck
// =====================================================================
(() => {
  const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  window.L29_SKIP_IDLE_FRAMES = isTouch;

  const css = document.createElement('style');
  css.textContent = `
    html,body{overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
    #gl,#c{touch-action:none}
    body.is-touch button{touch-action:manipulation}
  `;
  document.head.appendChild(css);
  // iOS Safari ignores user-scalable=no, so block pinch and double-tap zoom during play.
  for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = performance.now();
    // Only the game surface needs this: cancelling touchend on a button also cancels its click.
    const onControl = e.target && e.target.closest && e.target.closest('button,a,input,textarea,select,label,[role=button],[data-place]');
    if (now - lastTap < 320 && !onControl) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  // ---------- Touch look smoothing ----------
  const pending = { x: 0, y: 0 };
  const rawTurn = turnView;
  const padInUse = () => { try { return padActive; } catch (_) { return false; } };
  turnView = function(dx, dy){
    if (!isTouch || padInUse()) return rawTurn(dx, dy);
    // Slight acceleration: slow drags stay precise, quick flicks turn further.
    const m = Math.hypot(dx, dy), boost = 1 + Math.min(.8, m * 9);
    pending.x += dx * boost; pending.y += dy * boost;
  };
  function flushLook(dtMs){
    if (!pending.x && !pending.y) return;
    if (state !== 'play'){ pending.x = pending.y = 0; return; }
    const k = 1 - Math.pow(.35, dtMs / 16.7);
    const ax = pending.x * k, ay = pending.y * k;
    pending.x -= ax; pending.y -= ay;
    if (Math.abs(pending.x) < 1e-4) pending.x = 0;
    if (Math.abs(pending.y) < 1e-4) pending.y = 0;
    rawTurn(ax, ay);
  }

  // ---------- Desktop pointer lock ----------
  const lockable = !isTouch && 'requestPointerLock' in cv;
  const isLocked = () => document.pointerLockElement === cv;
  const wheelIsOpen = () => { try { return !!wheelOpen; } catch (_) { return false; } };
  let lockHinted = false;
  if (lockable){
    cv.addEventListener('mousedown', e => {
      if (e.button !== 0 || state !== 'play' || isLocked() || wheelIsOpen()) return;
      // The click that captures the mouse shouldn't also fire a shot.
      mouse.down = false;
      try { const p = cv.requestPointerLock({ unadjustedMovement: true }); if (p && p.catch) p.catch(() => { try { cv.requestPointerLock(); } catch (_) {} }); } catch (_) {}
    });
    document.addEventListener('pointerlockchange', () => {
      view.locked = isLocked();
      if (view.locked && !lockHinted){ lockHinted = true; toast('MOUSE LOOK ON · ESC TO RELEASE'); }
    });
  }

  // ---------- Release inputs when focus is lost ----------
  function releaseAll(){
    for (const k in keys) keys[k] = false;
    mouse.down = false;
    for (const k in touch) touch[k] = false;
    stick.x = 0; stick.y = 0;
    gp.fire = gp.sprint = gp.brake = false;
    pending.x = pending.y = 0;
  }
  addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

  // ---------- Adaptive resolution ----------
  const MIN_RATIO = isTouch ? .7 : 1;
  let ratio = 0, avg = 16.7, lastFrame = 0, lastChange = 0, slowFor = 0, fastFor = 0;
  function capRatio(){ return mpRole ? Math.min(1, devicePixelRatio || 1) : Math.min(isTouch?1:1.5, devicePixelRatio || 1); }
  function adaptResolution(now, dt){
    if (!renderer || state !== 'play') return;
    const cap = capRatio();
    if (!ratio) ratio = renderer.getPixelRatio();
    if (ratio > cap){ ratio = cap; renderer.setPixelRatio(ratio); }
    avg += (dt - avg) * .05;
    if (avg > 24) { slowFor += dt; fastFor = 0; }
    else if (avg < 18) { fastFor += dt; slowFor = 0; }
    else { slowFor = fastFor = 0; }
    if (now - lastChange < 2000) return;
    let next = ratio;
    if(isTouch&&slowFor>2500&&window.level29Graphics?.quality!=='low')window.level29Graphics.setQuality('low');
    if (slowFor > 1500 && ratio > MIN_RATIO) next = Math.max(MIN_RATIO, ratio - .15);
    else if (fastFor > 5000 && ratio < cap) next = Math.min(cap, ratio + .1);
    if (next !== ratio){
      ratio = Math.round(next * 100) / 100;
      renderer.setPixelRatio(ratio);
      if (typeof MP !== 'undefined') MP.renderScale = capRatio();
      lastChange = now; slowFor = fastFor = 0;
    }
  }

  const prevRender = render;
  render = function(){
    const now = performance.now();
    const dt = lastFrame ? Math.min(200, now - lastFrame) : 16.7;
    lastFrame = now;
    try { flushLook(dt); } catch (_) {}
    if (lockable && isLocked() && (state !== 'play' || wheelIsOpen())){ try { document.exitPointerLock(); } catch (_) {} }
    if (dt < 200) try { adaptResolution(now, dt); } catch (_) {}
    prevRender();
  };

  window.level29Smooth = { get ratio(){ return ratio; }, get avgFrameMs(){ return avg; }, isTouch };
})();
