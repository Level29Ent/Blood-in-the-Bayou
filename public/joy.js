'use strict';
// =====================================================================
// Joystick movement: on-screen analog stick (touch + mouse) and
// game-controller support (Xbox / PlayStation / generic via Gamepad API).
// Writes into `stick` {x: strafe/steer, y: forward/throttle} and `gp` flags.
// =====================================================================
const joyEl = document.getElementById('joy'), knobEl = document.getElementById('joyKnob');
const coarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
document.body.classList.toggle('is-touch', coarse);
// Stick and touch buttons were never styled, so on phones the stick was an invisible, unpositioned box.
const joyCss = document.createElement('style');
joyCss.textContent = `
 #joy{position:fixed;width:132px;height:132px;border-radius:50%;z-index:6;display:none;touch-action:none;user-select:none;-webkit-user-select:none;
  background:radial-gradient(circle,rgba(12,18,22,.28) 0 55%,rgba(12,18,22,.5) 100%);border:2px solid rgba(240,196,90,.6);box-shadow:0 0 0 1px rgba(0,0,0,.4),0 6px 22px rgba(0,0,0,.35);opacity:.55;transition:opacity .12s}
 #joy.on{opacity:1}
 body.is-touch #joy{pointer-events:none}
 #joy::before{content:'';position:absolute;inset:30%;border-radius:50%;border:1px dashed rgba(240,196,90,.35)}
 #joyKnob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f8dc8c,#d9a93c 70%);border:2px solid #fff3c4;box-shadow:0 3px 10px rgba(0,0,0,.5);pointer-events:none;will-change:transform}
 #joyZone{position:fixed;left:0;bottom:0;width:46vw;height:68vh;z-index:3;display:none;touch-action:none;-webkit-tap-highlight-color:transparent}
 body.is-touch #joyZone.live{display:block}
 body.is-touch #touch:not(.off){display:block;position:fixed;right:12px;bottom:66px;z-index:6}
 #touch .group{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;width:204px}
 #touch .group button,#touch .group #jobBoardButton,#touch .group #jobWorkButton{position:static!important;width:62px;min-height:48px;padding:4px;border-radius:10px;font-size:12px;border:2px solid rgba(240,196,90,.55);background:rgba(12,18,22,.62);color:#f6f3e6;font:800 13px 'Barlow Condensed',sans-serif;letter-spacing:.04em;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
 #touch .group button:active,#touch .group button.held{background:rgba(240,196,90,.4);border-color:#f4c355}
 #touch #shoot{background:rgba(150,36,28,.55)}
 @media (max-height:430px){#joy{width:116px;height:116px}#joyKnob{width:46px;height:46px;margin:-23px 0 0 -23px}#touch .group button,#touch .group #jobBoardButton,#touch .group #jobWorkButton{width:58px;min-height:40px;font-size:12px}#touch .group{width:186px;gap:6px}body.is-touch #touch:not(.off){bottom:58px}}
`;
document.head.appendChild(joyCss);
const DEFAULT_POS = () => coarse ? { left: Math.min(innerWidth * .1, 120), bottom: innerHeight >= 600 ? 54 : 26 } : { left: 222, bottom: 18 };
function parkJoy(){ const d = DEFAULT_POS(); Object.assign(joyEl.style, { left: d.left + 'px', bottom: d.bottom + 'px', top: 'auto' }); }
parkJoy(); addEventListener('resize', () => { if (joyPtr == null) parkJoy(); });
let zone = null;
if (coarse){ zone = document.createElement('div'); zone.id = 'joyZone'; document.body.appendChild(zone); }
const DEAD = .12; let JOY_R = 50;
let joyPtr = null, padActive = false;
function setKnob(x, y){ knobEl.style.transform = 'translate(' + (x * JOY_R) + 'px,' + (-y * JOY_R) + 'px)'; }
function joyFrom(e){ JOY_R = joyEl.offsetWidth * .38;
  const r = joyEl.getBoundingClientRect(), cxp = r.left + r.width / 2, cyp = r.top + r.height / 2;
  let dx = (e.clientX - cxp) / JOY_R, dy = (e.clientY - cyp) / JOY_R;
  const m = Math.hypot(dx, dy); if (m > 1){ dx /= m; dy /= m; }
  const mm = Math.min(1, m);
  if (mm < DEAD){ stick.x = 0; stick.y = 0; }
  else { const k = (mm - DEAD) / (1 - DEAD) / mm; stick.x = dx * mm * k; stick.y = -dy * mm * k; }
  setKnob(dx, -dy);
}
const surface = zone || joyEl;
surface.addEventListener('pointerdown', e => {
  if (joyPtr != null) return;
  e.preventDefault(); e.stopPropagation(); ensureAudio();
  joyPtr = e.pointerId; try { surface.setPointerCapture(e.pointerId); } catch (_) {}
  if (zone){ // floating stick: it appears under the thumb
    const h = joyEl.offsetWidth / 2, x = Math.max(h + 6, Math.min(innerWidth * .5, e.clientX)), y = Math.max(h + 6, Math.min(innerHeight - h - 6, e.clientY));
    Object.assign(joyEl.style, { left: (x - h) + 'px', top: (y - h) + 'px', bottom: 'auto' });
  }
  joyEl.classList.add('on'); joyFrom(e);
});
surface.addEventListener('pointermove', e => { if (e.pointerId !== joyPtr) return; e.preventDefault(); joyFrom(e); });
const joyEnd = e => { if (e.pointerId !== joyPtr) return; joyPtr = null; stick.x = 0; stick.y = 0; setKnob(0, 0); joyEl.classList.remove('on'); parkJoy(); };
surface.addEventListener('pointerup', joyEnd); surface.addEventListener('pointercancel', joyEnd); surface.addEventListener('lostpointercapture', joyEnd);
surface.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
surface.addEventListener('mousedown', e => e.stopPropagation());
surface.addEventListener('contextmenu', e => e.preventDefault());
// If the game leaves play mode (panel opens, player dies) while a finger is down, release the stick.
function releaseStick(){ if (joyPtr != null){ joyPtr = null; stick.x = 0; stick.y = 0; setKnob(0, 0); joyEl.classList.remove('on'); parkJoy(); } }

// ---------- Extra touch button: RUN (hold to sprint) ----------
let runHeld = false;
if (coarse){
  const grp = document.querySelector('#touch .group');
  if (grp){
    const run = document.createElement('button'); run.id = 'runBtn'; run.textContent = 'RUN';
    const press = (b, on) => { b.classList.toggle('held', on); };
    run.addEventListener('pointerdown', e => { e.preventDefault(); ensureAudio(); runHeld = true; press(run, true); try { run.setPointerCapture(e.pointerId); } catch (_) {} });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) run.addEventListener(ev, () => { runHeld = false; press(run, false); });
    grp.appendChild(run);
  }
}

// ---------- Game controller ----------
let padPrev = [], padName = '';
addEventListener('gamepadconnected', e => { padName = e.gamepad.id; toast('CONTROLLER CONNECTED · LEFT STICK MOVE · RIGHT STICK LOOK · RT FIRE · A RIDE'); });
addEventListener('gamepaddisconnected', () => { padActive = false; gp.fire = gp.sprint = gp.brake = false; if (joyPtr == null){ stick.x = 0; stick.y = 0; } toast('CONTROLLER DISCONNECTED'); });
const dz = v => Math.abs(v) < .16 ? 0 : (v - Math.sign(v) * .16) / .84;
function pollPad(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let pad = null; for (const p of pads) if (p && p.connected){ pad = p; break; }
  if (!pad){ padActive = false; return; }
  const b = i => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .4));
  const edge = i => b(i) && !padPrev[i];
  const lx = dz(pad.axes[0] || 0), ly = dz(pad.axes[1] || 0), rx = dz(pad.axes[2] || 0), ry = dz(pad.axes[3] || 0);
  const any = lx || ly || rx || ry || pad.buttons.some(x => x && x.pressed);
  if (any) padActive = true;
  if (padActive && joyPtr == null){ stick.x = lx; stick.y = -ly; }
  if (state === 'play'){
    if (rx || ry) turnView(rx * Math.abs(rx) * .06, ry * Math.abs(ry) * .045);
    gp.fire = b(7) || b(5);              // RT / RB
    gp.sprint = b(4) || b(10);           // LB / L3: sprint, nitro in cars
    gp.brake = b(6) || b(1);             // LT / B: handbrake
    if (edge(0)) enterExit();            // A: enter / exit vehicle
    if (edge(3)){ const owned = WORDER.filter(hasW); const i = owned.indexOf(curW); selectW(owned[(i + 1) % owned.length]); } // Y: next weapon
    if (edge(2) && player && player.car){ sfx('horn'); if (player.car.spec.police) player.car.siren = !player.car.siren; alertZombies(player.car.x, player.car.y, 700); } // X: horn
    if (edge(12) && player && player.car){ radioIdx = (radioIdx + 1) % RADIO.length; toast('RADIO · ' + RADIO[radioIdx][0]); sfx('tune'); } // d-pad up: radio
    // Playlist transport stays inside Spotify; no local MP3 station.
    if (edge(13) && player && player.car){ view.chase = !view.chase; toast(view.chase ? 'CHASE CAMERA' : 'COCKPIT CAMERA'); } // d-pad down: camera
    if (edge(8)) showMap = !showMap;     // View / Share: map
    if (edge(9)){ state = 'pause'; applyVolumes(); } // Menu / Options: pause
  } else {
    gp.fire = gp.sprint = gp.brake = false;
    if (state === 'pause' && edge(9)){ state = 'play'; applyVolumes(); }
    if (state === 'menu' && (edge(0) || edge(9))) document.getElementById('start').click();
    if (state === 'shop' && (edge(1) || edge(0))) closeShop();
  }
  padPrev = pad.buttons.map(x => !!(x && (x.pressed || x.value > .4)));
}
const _updJoy = update;
update = function(){
  pollPad();
  const live = state === 'play' && player && !player.dead && !showMap;
  if (coarse){ if (zone) zone.classList.toggle('live', live); joyEl.style.display = live ? 'block' : 'none'; }
  else joyEl.style.display = live ? 'block' : 'none';
  if (!live) releaseStick();
  if (!padActive) gp.sprint = runHeld && state === 'play';
  if (state !== 'play' && joyPtr == null && !padActive){ stick.x = 0; stick.y = 0; }
  _updJoy();
};
